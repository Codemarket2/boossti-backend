import { DB } from '../utils/DB';
import { FormModel } from './utils/formModel';
import { ResponseModel } from './utils/responseModel';
import ListType from '../list/utils/listTypeModel';
import ListItem from '../list/utils/listItemModel';
import { getCurretnUser } from '../utils/authentication';
import { AppSyncEvent } from '../utils/cutomTypes';
import { userPopulate } from '../utils/populate';

const formPopulate = [
  userPopulate,
  {
    path: 'fields.typeId',
    select: 'title description media slug',
  },
];

const responsePopulate = [
  userPopulate,
  {
    path: 'values.itemId',
    select: 'types title description media slug',
  },
];

export const handler = async (event: AppSyncEvent): Promise<any> => {
  try {
    await DB();
    const {
      info: { fieldName },
      identity,
    } = event;
    const user = await getCurretnUser(identity);
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
        const data = await FormModel.find({ name: { $regex: search, $options: 'i' } })
          .populate(formPopulate)
          .limit(limit * 1)
          .skip((page - 1) * limit);
        const count = await FormModel.countDocuments({ name: { $regex: search, $options: 'i' } });
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
        const { page = 1, limit = 20 } = args;
        const data = await ResponseModel.find()
          .populate(responsePopulate)
          .limit(limit * 1)
          .skip((page - 1) * limit);
        const count = await ResponseModel.countDocuments();
        return {
          data,
          count,
        };
      }
      case 'createResponse': {
        const form = await ResponseModel.create(args);
        return await form.populate(responsePopulate).execPopulate();
      }
      case 'updateResponse': {
        const form: any = await ResponseModel.findByIdAndUpdate(args._id, args, {
          new: true,
          runValidators: true,
        });
        return await form.populate(responsePopulate).execPopulate();
      }
      case 'deleteResponse': {
        await ResponseModel.findByIdAndDelete(args._id);
        return args._id;
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
