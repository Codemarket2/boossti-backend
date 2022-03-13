import { DB } from '../utils/DB';
import { RoleModel } from './utils/roleSchema';
import { getCurrentUser } from '../utils/authentication';
import { AppSyncEvent } from '../utils/cutomTypes';
import { userPopulate } from '../utils/populate';
import { User } from '../user/utils/userModel';
import { FormModel } from '../form/utils/formModel';

export const rolePopulate = [
  userPopulate,
  {
    path: 'forms',
    select: 'name',
  },
  {
    path: 'users',
    select: 'name email',
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

    if (fieldName.toLocaleLowerCase().includes('create') && user?._id) {
      args = { ...args, createdBy: user._id };
    } else if (fieldName.toLocaleLowerCase().includes('update') && user?._id) {
      args = { ...args, updatedBy: user._id };
    }

    switch (fieldName) {
      case 'getRole': {
        return await RoleModel.findById(args._id).populate(rolePopulate);
      }
      case 'getRoles': {
        const { page = 1, limit = 20, search = '' } = args;
        const data = await RoleModel.find({
          name: { $regex: search, $options: 'i' },
        })
          .populate(rolePopulate)
          .limit(limit * 1)
          .skip((page - 1) * limit);
        const count = await RoleModel.countDocuments({
          name: { $regex: search, $options: 'i' },
        });
        return {
          data,
          count,
        };
      }
      case 'createRole': {
        const role = await RoleModel.create(args);
        return await role.populate(rolePopulate).execPopulate();
      }
      case 'updateRole': {
        const data: any = await RoleModel.findByIdAndUpdate(args._id, args, {
          new: true,
          runValidators: true,
        });
        return await data.populate(rolePopulate).execPopulate();
      }
      case 'deleteRole': {
        await RoleModel.findByIdAndDelete(args._id);
        return args._id;
      }
      default:
        throw new Error('Something went wrong! Please check your Query or Mutation');
    }
  } catch (error) {
    if (error.runThis) {
      await User.findOne();
      await FormModel.findOne();
    }
    const error2 = error;
    throw error2;
  }
};
