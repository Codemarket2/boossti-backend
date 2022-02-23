import slugify from 'slugify';
import { DB } from '../utils/DB';
import ListType from './utils/listTypeModel';
import ListItem from './utils/listItemModel';
import Field from '../field/utils/fieldModel';
import FieldValue from '../field/utils/fieldValueModel';
import { getCurrentUser } from '../utils/authentication';
import { AppSyncEvent } from '../utils/cutomTypes';
// import getAdminFilter from '../utils/adminFilter';
import { userPopulate } from '../utils/populate';
import { User } from '../user/utils/userModel';

const listItemPopulate = [
  userPopulate,
  { path: 'types', select: 'title slug' },
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
    select: 'types title media slug',
  },
  {
    path: 'values.response',
    select: 'values',
  },
];
const listTypePopulate = [
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

    if (
      Object.prototype.hasOwnProperty.call(args, 'title') &&
      fieldName.toLocaleLowerCase().includes('create')
    ) {
      args = { ...args, slug: slugify(args.title, { lower: true }) };
    }

    if (
      Object.prototype.hasOwnProperty.call(args, 'slug') &&
      fieldName.toLocaleLowerCase().includes('update')
    ) {
      args = { ...args, slug: slugify(args.slug, { lower: true }) };
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
          title: { $regex: search, $options: 'i' },
        })
          .populate(listTypePopulate)
          .limit(limit * 1)
          .skip((page - 1) * limit);
        const count = await ListType.countDocuments({
          ...tempFilter,
          title: { $regex: search, $options: 'i' },
        });
        return {
          data,
          count,
        };
      }
      case 'getMenuListTypes': {
        return await ListType.find({
          showInMenu: true,
          active: true,
        }).select('title slug');
      }
      case 'getMentionItems': {
        const { search = '' } = args;
        let listItems: any = await ListItem.find({
          $or: [
            { title: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } },
          ],
        })
          .populate(listItemPopulate)
          .limit(5);

        listItems = listItems.map(
          (val) =>
            (val = {
              title: val.title,
              _id: val._id,
              category: val.types[0].title,
              type: 'listitem',
            }),
        );

        let users: any = await User.find({
          $or: [
            { name: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } },
          ],
        }).limit(5);

        users = users.map(
          (val) => (val = { title: val.name, _id: val._id, category: val.email, type: 'user' }),
        );
        const combinedItems = listItems.concat(users);
        return combinedItems;
      }
      case 'getListPageMentions': {
        const { page = 1, _id, limit = 20, parentId, field, onlyShowByUser = null } = args;
        const tempFilter: any = {};
        if (onlyShowByUser) {
          tempFilter.createdBy = user._id;
        }
        const data = await ListItem.find({
          'fields.options.values.value': { $regex: `data-id="${_id}"`, $options: 'i' },
        })
          .populate(listItemPopulate)
          .limit(limit * 1)
          .skip((page - 1) * limit);
        const count = await ListItem.countDocuments({
          ...tempFilter,
          parentId,
          field,
        });
        return {
          data,
          count,
        };
      }
      case 'getListTypeBySlug': {
        return await ListType.findOne({ slug: args.slug }).populate(listTypePopulate);
      }
      case 'getListType': {
        return await ListType.findById(args._id).populate(listTypePopulate);
      }
      case 'createListType': {
        const listType = await ListType.create(args);
        return await listType.populate(listTypePopulate).execPopulate();
      }
      case 'updateListType': {
        const listType: any = await ListType.findByIdAndUpdate(args._id, args, {
          new: true,
          runValidators: true,
        });
        return await listType.populate(listTypePopulate).execPopulate();
      }
      case 'deleteListType': {
        let count = await ListItem.countDocuments({
          types: { $elemMatch: { $in: [args._id] } },
        });
        if (count > 0) {
          throw new Error('First delete the items under this type');
        }
        count = 0;
        count = await Field.countDocuments({
          typeId: args._id,
        });
        if (count > 0) {
          throw new Error('This type is being used in dynamic field, first delete that field');
        }
        await ListType.findByIdAndDelete(args._id);
        return args._id;
      }
      case 'getListItems': {
        const { page = 1, limit = 20, search = '', active = null, types = [] } = args;
        const tempFilter: any = {};
        if (active !== null) {
          tempFilter.active = active;
        }
        if (types.length > 0) {
          tempFilter.types = { $elemMatch: { $in: types } };
        }
        // const adminFilter = getAdminFilter(identity, user);
        const data = await ListItem.find({
          ...tempFilter,
          // ...adminFilter,
          $or: [
            { title: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } },
          ],
        })
          .populate(listItemPopulate)
          .limit(limit * 1)
          .skip((page - 1) * limit);
        const count = await ListItem.countDocuments({
          ...tempFilter,
          // ...adminFilter,
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
      case 'getListItemBySlug': {
        return await ListItem.findOne({ slug: args.slug }).populate(listItemPopulate);
      }
      case 'getListItem': {
        return await ListItem.findById(args._id).populate(listItemPopulate);
      }
      case 'createListItem': {
        const listItem = await ListItem.create(args);
        return await listItem.populate(listItemPopulate).execPopulate();
      }
      case 'updateListItem': {
        const listItem: any = await ListItem.findByIdAndUpdate(args._id, args, {
          new: true,
          runValidators: true,
        });
        return await listItem.populate(listItemPopulate).execPopulate();
      }
      case 'deleteListItem': {
        const count = await FieldValue.countDocuments({
          itemId: args._id,
        });
        if (count > 0) {
          throw new Error('This type is being used in dynamic field, first delete that field');
        }
        await ListItem.findByIdAndDelete(args._id);
        return args._id;
      }
      default:
        throw new Error('Something went wrong! Please check your Query or Mutation');
    }
  } catch (error) {
    const error2 = error;
    throw error2;
  }
};
