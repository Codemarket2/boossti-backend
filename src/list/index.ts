import { DB } from '../utils/DB';
import ListType from './utils/listTypeModel';
import ListItem from './utils/listItemModel';
import { getCurretnUser } from '../utils/authentication';
import { AppSyncEvent } from '../utils/cutomTypes';

export const handler = async (event: AppSyncEvent): Promise<any> => {
  try {
    await DB();
    const { fieldName } = event.info;
    const { identity } = event; // arguments: args
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
    switch (fieldName) {
      case 'getListTypes': {
        const { page = 1, limit = 20, search = '', active = null } = args;
        const tempFilter: any = {};
        if (active !== null) {
          tempFilter.active = active;
        }
        const data = await ListType.find({
          ...tempFilter,
          name: { $regex: search, $options: 'i' },
        })
          .limit(limit * 1)
          .skip((page - 1) * limit);
        const count = await ListType.countDocuments({
          ...tempFilter,
          name: { $regex: search, $options: 'i' },
        });
        return {
          data,
          count,
        };
      }
      case 'getListItems': {
        const {
          page = 1,
          limit = 20,
          search = '',
          active = null,
          types = [],
        } = args;
        const tempFilter: any = {};
        if (active !== null) {
          tempFilter.active = active;
        }
        if (types.length > 0) {
          tempFilter.types = { $elemMatch: { $in: types } };
        }

        const data = await ListItem.find({
          ...tempFilter,
          $or: [
            { title: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } },
          ],
        })
          .limit(limit * 1)
          .skip((page - 1) * limit);
        const count = await ListItem.countDocuments({
          ...tempFilter,
          $or: [
            { title: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } },
          ],
        });
        return {
          data,
          count,
        };
      }
      case 'getList': {
        let data: any = null;
        data = await ListType.findById(args._id);
        if (!data) {
          data = await ListItem.findById(args._id);
        }
        return data;
      }
      case 'createListType': {
        return await ListType.create(args);
      }
      case 'createListItem': {
        return await ListItem.create(args);
      }
      case 'updateListItem': {
        return await ListItem.findByIdAndUpdate(args._id, args, {
          new: true,
          runValidators: true,
        });
      }
      case 'updateListType': {
        return await ListType.findByIdAndUpdate(args._id, args, {
          new: true,
          runValidators: true,
        });
      }
      case 'deleteListItem': {
        await ListItem.findByIdAndDelete(args._id);
        return true;
      }
      case 'deleteListType': {
        await ListType.findByIdAndDelete(args._id);
        return true;
      }
      default:
        throw new Error(
          'Something went wrong! Please check your Query or Mutation'
        );
    }
  } catch (error) {
    const error2 = error;
    throw error2;
  }
};
