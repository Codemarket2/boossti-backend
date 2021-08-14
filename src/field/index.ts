import { DB } from '../utils/DB';
import ListType from '../list/utils/listTypeModel';
import { User } from '../user/utils/userModel';
import Field from './utils/fieldModel';
import { getCurretnUser } from '../utils/authentication';
import { AppSyncEvent } from '../utils/cutomTypes';
import { userPopulate } from '../utils/populate';

export const handler = async (event: AppSyncEvent): Promise<any> => {
  try {
    await DB();
    const { fieldName } = event.info;
    const { identity } = event;
    const user = await getCurretnUser(identity);
    let args = { ...event.arguments };

    if (fieldName.toLocaleLowerCase().includes('create') && user && user._id) {
      args = { ...args, createdBy: user._id };
    } else if (
      fieldName.toLocaleLowerCase().includes('update') &&
      user &&
      user._id
    ) {
      args = { ...args, updatedBy: user._id };
    }

    const populate = [
      userPopulate,
      {
        path: 'typeId',
        select: 'title',
      },
    ];

    switch (fieldName) {
      case 'getFieldsByType': {
        const { page = 1, limit = 20, search = '', parentId } = args;
        const data = await Field.find({
          parentId,
          label: { $regex: search, $options: 'i' },
        })
          .populate(populate)
          .limit(limit * 1)
          .skip((page - 1) * limit);

        const count = await Field.countDocuments({
          parentId,
          label: { $regex: search, $options: 'i' },
        });
        return {
          data,
          count,
        };
      }
      case 'createField': {
        const field = await Field.create(args);
        return await field.populate(populate).execPopulate();
      }
      case 'updateField': {
        const field: any = await Field.findByIdAndUpdate(args._id, args, {
          new: true,
          runValidators: true,
        });
        return await field.populate(populate).execPopulate();
      }
      case 'deleteField': {
        await Field.findByIdAndDelete(args._id);
        return true;
      }
      default:
        await ListType.findOne();
        await User.findOne();
        throw new Error(
          'Something went wrong! Please check your Query or Mutation'
        );
    }
  } catch (error) {
    const error2 = error;
    throw error2;
  }
};
