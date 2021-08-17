import { DB } from "../utils/DB";
import { getCurretnUser } from "../utils/authentication";
import { AppSyncEvent } from "../utils/cutomTypes";
import { User } from "../user/utils/userModel";
import { Post } from "../post/utils/postModel";
import { Comment } from "./utils/commentModel";

export const handler = async (event: AppSyncEvent): Promise<any> => {
  try {
    await DB();
    const { fieldName } = event.info;
    const { identity } = event;
    const user = await getCurretnUser(identity);
    let tempComment: any;
    const userSelect = "name picture";
    const userPopulate = {
      path: "createdBy",
      select: userSelect,
    };
    let data: any = [];
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

    switch (fieldName) {
      case "createComment": {
        const comment = await Comment.create({
          ...args,
          createdBy: user._id,
        });
        return await comment.populate(userPopulate).execPopulate();
      }
      case "getComment": {
        const getComment = await Comment.findById(args._id).populate(
          userPopulate
        );

        return await getComment;
      }

      case "getCommentsByParentID": {
        data = await Comment.find({ parentId: args.parentId }).populate(
          userPopulate
        );
        return { data };
      }
      case "updateComment": {
        tempComment = await Comment.findOneAndUpdate(
          { _id: args._id, createdBy: user._id },
          { ...args, updatedAt: new Date(), updatedBy: user._id },
          {
            new: true,
            runValidators: true,
          }
        );
        return await tempComment.populate(userPopulate).execPopulate();
      }
      case "deleteComment": {
        await Comment.findOneAndDelete({ _id: args._id, createdBy: user._id });
        return true;
      }
      default:
        await Post.findOne();
        await User.findOne();
        throw new Error(
          "Something went wrong! Please check your Query or Mutation"
        );
    }
  } catch (error) {
    const error2 = error;
    throw error2;
  }
};
