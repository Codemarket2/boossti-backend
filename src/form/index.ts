import slugify from 'slugify';
import { DB } from '../utils/DB';
import { FormModel } from './utils/formModel';
import { ResponseModel } from './utils/responseModel';
import { SectionModel } from './utils/sectionModel';
import ListType from '../list/utils/listTypeModel';
import ListItem from '../list/utils/listItemModel';
import { getCurrentUser } from '../utils/authentication';
import { AppSyncEvent } from '../utils/cutomTypes';
import { userPopulate } from '../utils/populate';
import { runFormActions } from './utils/actions';
import { sendResponseNotification } from './utils/responseNotification';
import getAdminFilter from '../utils/adminFilter';
import { fileParser } from './utils/readCsvFile';

export const formPopulate = [
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

export const responsePopulate = [
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

const sectionPopulate = [
  {
    path: 'fields.typeId',
    select: 'title description media slug',
  },
  {
    path: 'fields.form',
    select: 'name',
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
    if (Object.prototype.hasOwnProperty.call(args, 'name')) {
      args = { ...args, slug: slugify(args.name, { lower: true }) };
    }
    if (fieldName.toLocaleLowerCase().includes('create') && user && user._id) {
      args = { ...args, createdBy: user._id };
    } else if (fieldName.toLocaleLowerCase().includes('update') && user && user._id) {
      args = { ...args, updatedBy: user._id };
    }

    switch (fieldName) {
      case 'getForm': {
        return await FormModel.findById(args._id).populate(formPopulate);
      }
      case 'getFormBySlug': {
        return await FormModel.findOne({ slug: args.slug }).populate(formPopulate);
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
        await ResponseModel.deleteMany({ formId: args._id });
        await SectionModel.findByIdAndDelete(args._id);
        return args._id;
      }
      case 'getResponse': {
        return await ResponseModel.findById(args._id).populate(responsePopulate);
      }
      case 'getResponseByCount': {
        return await ResponseModel.findOne(args).populate(responsePopulate);
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
          .sort({ createdAt: -1 })
          .populate(responsePopulate)
          .limit(limit * 1)
          .skip((page - 1) * limit);
        const count = await ResponseModel.countDocuments(filter);
        return {
          data,
          count,
        };
      }
      case 'createResponse': {
        args = { ...args, count: 1 };
        const lastResponse = await ResponseModel.findOne({ formId: args.formId }).sort('-count');
        if (lastResponse) {
          args = { ...args, count: lastResponse?.count + 1 };
        }
        let response = await ResponseModel.create(args);
        response = await response.populate(responsePopulate).execPopulate();
        // Run Actions
        if (!(process.env.NODE_ENV === 'test')) {
          const form: any = await FormModel.findById(response.formId);
          await runFormActions(response, {
            ...form,
            settings: {
              ...form.settings,
              actions: args?.options?.actions || form.settings?.actions,
            },
          });
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
          .sort({ createdAt: -1 })
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
        return true;
      }
      case 'getSection': {
        let section = await SectionModel.findById(args._id).populate(sectionPopulate);
        if (section) {
          return section;
        } else if (user?._id) {
          section = await SectionModel.create({ _id: args._id, createdBy: user._id });
          return await section.populate(sectionPopulate).execPopulate();
        }
        return null;
      }
      case 'createSection': {
        return await SectionModel.create({ createdBy: user._id });
      }
      case 'updateSection': {
        const section: any = await SectionModel.findByIdAndUpdate(args._id, args, {
          new: true,
          runValidators: true,
        });
        if (section) {
          return await section.populate(sectionPopulate).execPopulate();
        }
        return null;
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
