import { DB } from '../utils/DB';
import { FormModel } from './utils/formModel';
import { getCurretnUser } from '../utils/authentication';
import { AppSyncEvent } from '../utils/cutomTypes';

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
        return await FormModel.findById(args._id);
      }
      case 'getForms': {
        const { page = 1, limit = 20 } = args;
        const data = await FormModel.find()
          .limit(limit * 1)
          .skip((page - 1) * limit);
        const count = await FormModel.countDocuments();
        return {
          data,
          count,
        };
      }
      case 'createForm': {
        return await FormModel.create(args);
      }
      case 'updateForm': {
        return await FormModel.findByIdAndUpdate(args._id, args, {
          new: true,
          runValidators: true,
        });
      }
      case 'deleteForm': {
        await FormModel.findByIdAndDelete(args._id);
        return true;
      }
      default:
        throw new Error('Something went wrong! Please check your Query or Mutation');
    }
  } catch (error) {
    const error2 = error;
    throw error2;
  }
};
