import { DB } from '../utils/DB';
import ListType from '../list/utils/listTypeModel';
import ListItem from '../list/utils/listItemModel';
import { User } from '../user/utils/userModel';
import Field from './utils/fieldModel';
import FieldValue from './utils/fieldValueModel';
import { getCurrentUser } from '../utils/authentication';
import { AppSyncEvent } from '../utils/cutomTypes';
import { userPopulate } from '../utils/populate';

const fieldPopulate = [
  userPopulate,
  {
    path: 'typeId',
    select: 'title slug',
  },
];

const fieldValuePopulate = [
  userPopulate,
  {
    path: 'itemId',
    select: 'title slug',
  },
];

export const handler = async (event: AppSyncEvent): Promise<any> => {
  try {
    await DB();
    const { fieldName } = event.info;
    const { identity } = event;
    const user = await getCurrentUser(identity);
    let args = { ...event.arguments };

    if (fieldName.toLocaleLowerCase().includes('create') && user && user._id) {
      args = { ...args, createdBy: user._id };
    } else if (fieldName.toLocaleLowerCase().includes('update') && user && user._id) {
      args = { ...args, updatedBy: user._id };
    }
    switch (fieldName) {
      case 'getField': {
        return await Field.findById(args._id).populate(fieldPopulate);
      }
      case 'getFields': {
        const { sortBy = 'position', search = '', parentId } = args;
        return await Field.find({
          parentId,
          label: { $regex: search, $options: 'i' },
        })
          .populate(fieldPopulate)
          .sort(sortBy);
      }
      case 'createField': {
        let position = 1;
        const tempFields = await Field.find({ parentId: args.parentId })
          .sort({ position: -1 })
          .limit(1);
        if (tempFields && tempFields.length > 0) {
          position = parseInt(tempFields[0].position.toString()) + 1;
        }
        const field = await Field.create({ ...args, position });
        return await field.populate(fieldPopulate).execPopulate();
      }
      case 'getPageMentions': {
        const { page = 1, _id, limit = 20, parentId, field, onlyShowByUser = null } = args;
        const tempFilter: any = {};
        if (onlyShowByUser) {
          tempFilter.createdBy = user._id;
        }
        const data = await FieldValue.find({
          value: { $regex: `data-id="${_id}"`, $options: 'i' },
        })
          .populate(fieldValuePopulate)
          .limit(limit * 1)
          .skip((page - 1) * limit);
        const count = await FieldValue.countDocuments({
          ...tempFilter,
          parentId,
          field,
        });
        return {
          data,
          count,
        };
      }
      case 'updateField': {
        const field: any = await Field.findByIdAndUpdate(args._id, args, {
          new: true,
          runValidators: true,
        });
        return await field.populate(fieldPopulate).execPopulate();
      }
      case 'updateFieldPosition': {
        const field: any = await Field.findByIdAndUpdate(
          args._id,
          { position: args.position },
          {
            new: true,
            runValidators: true,
          },
        );
        return await field.populate(fieldPopulate).execPopulate();
      }
      case 'deleteField': {
        await Field.findByIdAndDelete(args._id);
        return args._id;
      }
      case 'getFieldValue': {
        return await FieldValue.findById(args._id).populate(fieldValuePopulate);
      }
      case 'getFieldValues': {
        const { page = 1, limit = 20, parentId, field, onlyShowByUser = null } = args;
        const tempFilter: any = {};
        if (onlyShowByUser) {
          tempFilter.createdBy = user._id;
        }
        const data = await FieldValue.find({ ...tempFilter, parentId, field })
          .populate(fieldValuePopulate)
          .limit(limit * 1)
          .skip((page - 1) * limit);
        const count = await FieldValue.countDocuments({
          ...tempFilter,
          parentId,
          field,
        });
        return {
          data,
          count,
        };
      }
      case 'createFieldValue': {
        const fieldValue = await FieldValue.create(args);
        return await fieldValue.populate(fieldValuePopulate).execPopulate();
      }
      case 'updateFieldValue': {
        const fieldValue: any = await FieldValue.findByIdAndUpdate(args._id, args, {
          new: true,
          runValidators: true,
        });
        return await fieldValue.populate(fieldValuePopulate).execPopulate();
      }
      case 'deleteFieldValue': {
        await FieldValue.findByIdAndDelete(args._id);
        return args._id;
      }
      default:
        if (args.registerModel) {
          await ListType.findOne();
          await User.findOne();
          await ListItem.findOne();
        }
        throw new Error('Something went wrong! Please check your Query or Mutation');
    }
  } catch (error) {
    const error2 = error;
    throw error2;
  }
};
