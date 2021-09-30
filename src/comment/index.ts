import { DB } from '../utils/DB';
import { getCurretnUser } from '../utils/authentication';
import { AppSyncEvent } from '../utils/cutomTypes';
import { User } from '../user/utils/userModel';
import { Post } from '../post/utils/postModel';
import { Comment } from './utils/commentModel';
import { Like } from '../like/utils/likeModel';

export const handler = async (event: AppSyncEvent): Promise<any> => {
  try {
    await DB();
    const { fieldName } = event.info;
    const { identity } = event;
    let args = { ...event.arguments };
    let data: any = [];
    const count = 0;
    let tempComment: any;
    const tempFilter: any = {};
    const user = await getCurretnUser(identity);
    const { page = 1, limit = 10 } = args;

    const userSelect = 'name picture _id';
    const userPopulate = {
      path: 'createdBy',
      select: userSelect,
    };
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
      case 'createComment': {
        const comment = await Comment.create({
          ...args,
          createdBy: user._id,
        });
        return await comment.populate(userPopulate).execPopulate();
      }
      case 'getComment': {
        return await Comment.findById(args._id).populate(userPopulate);
      }
      case 'getActionCounts': {
        let commentCount = await Comment.countDocuments({
          threadId: args.parentId,
        });
        if (commentCount === 0) {
          commentCount = await Comment.countDocuments({
            parentId: args.parentId,
          });
        }
        const likeCount = await Like.countDocuments({
          parentId: args.parentId,
        });
        let likedByUser = false;
        if (user && user._id) {
          const tempLike = await Like.findOne({
            parentId: args.parentId,
            createdBy: user._id,
          });
          if (tempLike) {
            likedByUser = true;
          }
        }
        return { commentCount, likeCount, likedByUser };
      }
      case 'getCommentsByParentID': {
        await User.findById(args.userId);
        data = await Comment.find({
          parentId: args.parentId,
        })
          .populate(userPopulate)
          .limit(limit * 1)
          .skip((page - 1) * limit);

        const count = await Comment.countDocuments({
          parentId: args.parentId,
        });
        return {
          data,
          count,
        };
      }
      case 'updateComment': {
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
      case 'deleteComment': {
        await Comment.findOneAndDelete({ _id: args._id, createdBy: user._id });
        return true;
      }
      default:
        await Post.findOne();
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
