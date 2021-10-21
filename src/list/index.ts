import slugify from "slugify";
import { DB } from "../utils/DB";
import ListType from "./utils/listTypeModel";
import ListItem from "./utils/listItemModel";
import Field from "../field/utils/fieldModel";
import FieldValue from "../field/utils/fieldValueModel";
import { getCurretnUser } from "../utils/authentication";
import { AppSyncEvent } from "../utils/cutomTypes";

export const handler = async (event: AppSyncEvent): Promise<any> => {
  try {
    await DB();
    const { fieldName } = event.info;
    const { identity } = event;
    const user = await getCurretnUser(identity);
    let args = { ...event.arguments };
    if (fieldName.toLocaleLowerCase().includes("create") && user && user._id) {
      args = { ...args, createdBy: user._id };
    } else if (
      fieldName.toLocaleLowerCase().includes("update") &&
      user &&
      user._id
    ) {
      args = { ...args, updatedBy: user._id };
    }

    if (Object.prototype.hasOwnProperty.call(args, "title")) {
      args = { ...args, slug: slugify(args.title, { lower: true }) };
    }

    const itemTypeSelect = "_id title slug";
    const itemTypePopulate = {
      path: "types",
      select: itemTypeSelect,
    };

    switch (fieldName) {
      case "getListTypes": {
        const { page = 1, limit = 20, search = "", active = null } = args;
        const tempFilter: any = {};
        if (active !== null) {
          tempFilter.active = active;
        }
        const data = await ListType.find({
          ...tempFilter,
          title: { $regex: search, $options: "i" },
        })
          .limit(limit * 1)
          .skip((page - 1) * limit);
        const count = await ListType.countDocuments({
          ...tempFilter,
          title: { $regex: search, $options: "i" },
        });
        return {
          data,
          count,
        };
      }
      case "getListItems": {
        const {
          page = 1,
          limit = 20,
          search = "",
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
            { title: { $regex: search, $options: "i" } },
            { description: { $regex: search, $options: "i" } },
          ],
        })
          .populate(itemTypePopulate)
          .limit(limit * 1)
          .skip((page - 1) * limit);
        const count = await ListItem.countDocuments({
          ...tempFilter,
          $or: [
            { title: { $regex: search, $options: "i" } },
            { description: { $regex: search, $options: "i" } },
          ],
        });
        return {
          data,
          count,
        };
      }
      case "getListTypeBySlug": {
        return await ListType.findOne({ slug: args.slug });
      }
      case "getListItemBySlug": {
        return await ListItem.findOne({ slug: args.slug }).populate("types");
      }
      case "getListType": {
        return await ListType.findById(args._id);
      }
      case "getListItem": {
        return await ListItem.findById(args._id).populate("types");
      }
      case "createListType": {
        return await ListType.create(args);
      }
      case "createListItem": {
        const listItem = await ListItem.create(args);
        return await listItem.populate(itemTypePopulate).execPopulate();
      }
      case "updateListItem": {
        const listItem: any = await ListItem.findByIdAndUpdate(args._id, args, {
          new: true,
          runValidators: true,
        });
        return await listItem.populate(itemTypePopulate).execPopulate();
      }
      case "updatePublish": {
        const listItem: any = await ListItem.findByIdAndUpdate(
          { _id: args._id },
          { active: args.publish },
          { new: true, runValidators: true }
        );
        return await listItem.populate(itemTypePopulate).execPopulate();
      }
      case "updateAuthentication": {
        const listItem: any = await ListItem.findByIdAndUpdate(
          { _id: args._id },
          { active: args.authenticateUser },
          { new: true, runValidators: true }
        );
        return await listItem.populate(itemTypePopulate).execPopulate();
      }
      case "updateListType": {
        return await ListType.findByIdAndUpdate(args._id, args, {
          new: true,
          runValidators: true,
        });
      }
      case "deleteListItem": {
        const count = await FieldValue.countDocuments({
          itemId: args._id,
        });
        if (count > 0) {
          throw new Error(
            "This type is being used in dynamic field, first delete that field"
          );
        }
        await ListItem.findByIdAndDelete(args._id);
        return true;
      }
      case "deleteListType": {
        let count = await ListItem.countDocuments({
          types: { $elemMatch: { $in: [args._id] } },
        });
        if (count > 0) {
          throw new Error("First delete the items under this type");
        }
        count = 0;
        count = await Field.countDocuments({
          typeId: args._id,
        });
        if (count > 0) {
          throw new Error(
            "This type is being used in dynamic field, first delete that field"
          );
        }
        await ListType.findByIdAndDelete(args._id);
        return true;
      }
      default:
        throw new Error(
          "Something went wrong! Please check your Query or Mutation"
        );
    }
  } catch (error) {
    const error2 = error;
    throw error2;
  }
};
