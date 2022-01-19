import { DB } from '../utils/DB';
import { FormModel } from './utils/formModel';
import { ResponseModel } from './utils/responseModel';
import ListType from '../list/utils/listTypeModel';
import ListItem from '../list/utils/listItemModel';
import { getCurrentUser } from '../utils/authentication';
import { AppSyncEvent } from '../utils/cutomTypes';
import { userPopulate } from '../utils/populate';
import { runFormActions } from './utils/actions';
import { sendResponseNotification } from './utils/responseNotification';
import getAdminFilter from '../utils/adminFilter';
import { fileParser } from './utils/readCsvFile';

const formPopulate = [
  userPopulate,
  {
    path: 'fields.typeId',
    select: 'title description media slug',
  },
  {
    path: 'fields.form',
    select: 'name',
  },
];

const itemSelect = 'types title media slug';

const responsePopulate = [
  userPopulate,
  {
    path: 'parentId',
    select: itemSelect,
  },
  {
    path: 'values.itemId',
    select: itemSelect,
  },
  {
    path: 'values.response',
    select: 'values',
  },
];
const myResponsePopulate = [
  ...responsePopulate,
  {
    path: 'formId',
    select: 'name',
  },
];

export const handler = async (event: AppSyncEvent): Promise<any> => {
  try {
    await DB();
    const {
      info: { fieldName },
      identity,
    } = event;
    const user = await getCurrentUser(identity);
    let args = { ...event.arguments };

    if (fieldName.toLocaleLowerCase().includes('create') && user && user._id) {
      args = { ...args, createdBy: user._id };
    } else if (fieldName.toLocaleLowerCase().includes('update') && user && user._id) {
      args = { ...args, updatedBy: user._id };
    }

    switch (fieldName) {
      case 'getForm': {
        return await FormModel.findById(args._id).populate(formPopulate);
      }
      case 'getForms': {
        const { page = 1, limit = 20, search = '' } = args;
        const adminFilter = getAdminFilter(identity, user);
        const data = await FormModel.find({
          ...adminFilter,
          name: { $regex: search, $options: 'i' },
        })
          .populate(formPopulate)
          .limit(limit * 1)
          .skip((page - 1) * limit);
        const count = await FormModel.countDocuments({
          ...adminFilter,
          name: { $regex: search, $options: 'i' },
        });
        return {
          data,
          count,
        };
      }
      case 'createForm': {
        const form = await FormModel.create(args);
        return await form.populate(formPopulate).execPopulate();
      }
      case 'updateForm': {
        const form: any = await FormModel.findByIdAndUpdate(args._id, args, {
          new: true,
          runValidators: true,
        });
        return await form.populate(formPopulate).execPopulate();
      }
      case 'deleteForm': {
        await FormModel.findByIdAndDelete(args._id);
        return args._id;
      }
      case 'getResponse': {
        return await ResponseModel.findById(args._id).populate(responsePopulate);
      }
      case 'getResponses': {
        const { page = 1, limit = 20, formId, parentId, search = '', formField } = args;
        let filter: any = { formId };
        if (parentId) {
          filter = { ...filter, parentId };
        }

        if (search && formField) {
          console.warn('filter');
          filter = {
            ...filter,
            $and: [
              { 'values.value': { $regex: search, $options: 'i' } },
              { 'values.field': formField },
            ],
          };
        }

        const data = await ResponseModel.find(filter)
          .populate(responsePopulate)
          .limit(limit * 1)
          .skip((page - 1) * limit);
        const count = await ResponseModel.countDocuments(filter);
        console.log(count);
        return {
          data,
          count,
        };
      }
      case 'createResponse': {
        let response = await ResponseModel.create(args);
        response = await response.populate(responsePopulate).execPopulate();
        // Run Actions
        const form = await FormModel.findById(response.formId);
        await runFormActions(response, form);
        if (!(process.env.NODE_ENV === 'test')) {
          await sendResponseNotification(form, response);
        }
        return response;
      }
      case 'updateResponse': {
        const response: any = await ResponseModel.findByIdAndUpdate(args._id, args, {
          new: true,
          runValidators: true,
        });
        return await response.populate(responsePopulate).execPopulate();
      }
      case 'deleteResponse': {
        await ResponseModel.findByIdAndDelete(args._id);
        return args._id;
      }
      case 'getMyResponses': {
        const { page = 1, limit = 20 } = args;
        const data = await ResponseModel.find({ createdBy: user._id })
          .populate(myResponsePopulate)
          .limit(limit * 1)
          .skip((page - 1) * limit);
        const count = await ResponseModel.countDocuments({ createdBy: user._id });
        return {
          data,
          count,
        };
      }
      case 'createBulkResponses': {
        const { formId, fileUrl, map, parentId, createdBy } = args;
        console.log(args);

        const filter: any = Object.values(map);
        const fields = Object.keys(map);
        const fileData = await fileParser(fileUrl, filter);

        const responses: any = [];

        fileData.map((file) => {
          const response = {
            formId: formId,
            parentId: parentId,
            values: [{}],
            createdBy: createdBy,
          };
          for (let i = 0; i < fields.length; i++) {
            const value = {
              field: fields[i],
              value: file[filter[i]],
              valueNumber: null,
              valueBoolean: null,
              valueDate: null,
              itemId: null,
              media: [],
            };
            response.values.push(value);
            if (i === fields.length - 1) response.values.shift();
          }
          responses.push(response);
        });

        const responseCreated = await ResponseModel.create(responses);
        // responseCreated = await responseCreated.populate(responsePopulate).execPopulate();
        // Run Actions
        // const form = await FormModel.findById(responseCreated.formId);
        // await runFormActions(responseCreated, form);
        // if (!(process.env.NODE_ENV === 'test')) {
        //   await sendResponseNotification(form, responseCreated);
        // }

        console.log('responseCreated: ', responseCreated);

        return true;
      }
      default:
        throw new Error('Something went wrong! Please check your Query or Mutation');
    }
  } catch (error) {
    if (error.runThis) {
      await ListType.findOne();
      await ListItem.findOne();
    }
    const error2 = error;
    throw error2;
  }
};
