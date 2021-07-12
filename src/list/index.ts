/* eslint-disable no-case-declarations */
import { DB } from '../utils/DB';
import { List } from './utils/listModel';
import { AppSyncEvent } from '../utils/cutomTypes';

export const handler = async (event: AppSyncEvent): Promise<any> => {
  try {
    await DB();
    const { fieldName } = event.info;
    const { arguments: args, identity } = event;
    let data: any = [];
    let count = 0;
    const tempFilter: any = {};
    let createdBy;
    let updatedBy;
    let tempList: any = null;

    if (identity && identity.claims && identity.claims.sub) {
      createdBy = identity.claims.sub;
      updatedBy = identity.claims.sub;
    }

    switch (fieldName) {
      case 'getLists':
        const { page = 1, limit = 50, search = '', active = null } = args;

        if (active !== null) {
          tempFilter.active = active;
        }

        data = await List.find({
          ...tempFilter,
          name: { $regex: search, $options: 'i' },
        })
          .limit(limit * 1)
          .skip((page - 1) * limit)
          .exec();

        count = await List.countDocuments({
          ...tempFilter,
          name: { $regex: search, $options: 'i' },
        });

        return {
          data,
          count,
        };
      case 'getList':
        return await List.findById(args._id);
      case 'createList':
        return await List.create({
          ...args,
          createdBy,
        });
      case 'updateList':
        return await List.findByIdAndUpdate(
          args._id,
          { ...args, updatedAt: new Date(), updatedBy },
          {
            new: true,
            runValidators: true,
          }
        );
      case 'addListItem':
        tempList = await List.findById(args.listId);
        tempList.items.push({ ...args });
        await tempList.save();
        return tempList;
      case 'updateListItem':
        return await List.findOneAndUpdate(
          { _id: args.listId, 'items._id': args._id },
          {
            $set: {
              'items.$': { ...args },
            },
          },
          {
            new: true,
            runValidators: true,
          }
        );
      case 'deleteListItem':
        tempList = await List.findById(args.listId);
        tempList.items.pull(args._id);
        await tempList.save();
        return true;
      case 'deleteList':
        await List.findByIdAndDelete(args._id);
        return true;
      default:
        throw new Error(
          'Something went wrong! Please check your Query or Mutation'
        );
    }
  } catch (error) {
    // console.log('error', error);
    const error2 = error;
    throw error2;
  }
};
