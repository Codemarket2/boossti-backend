import { DB } from '../utils/DB';
import { getCurrentUser } from '../utils/authentication';
import { AppSyncEvent } from '../utils/customTypes';
import { CommentModel } from './utils/commentModel';
import { LikeModel } from '../like/utils/likeModel';
// import { sendCommentNotification } from './utils/commentNotification';
import { userPopulate } from '../utils/populate';
import { runInTransaction } from '../utils/runInTransaction';
import { sendCommentNotification } from './utils/commentNotification';

export const handler = async (event: AppSyncEvent): Promise<any> => {
  try {
    await DB();
    const { fieldName } = event.info;
    const { identity } = event;
    let args = { ...event.arguments };

    const user = await getCurrentUser(identity);

    if (fieldName.toLocaleLowerCase().includes('create') && user?._id) {
      args = { ...args, createdBy: user._id };
    }

    switch (fieldName) {
      case 'getComment': {
        return await CommentModel.findById(args._id).populate(userPopulate);
      }
      case 'getActionCounts': {
        const commentCount = await CommentModel.countDocuments({
          $or: [
            {
              threadId: args.threadId,
            },
            {
              parentIds: { $elemMatch: { $eq: args.threadId } },
            },
          ],
        });
        const likeCount = await LikeModel.countDocuments({
          parentId: args.threadId,
        });
        let likedByUser = false;
        if (user?._id) {
          const tempLike = await LikeModel.findOne({
            parentId: args.threadId,
            createdBy: user._id,
          });
          if (tempLike) {
            likedByUser = true;
          }
        }
        return { commentCount, likeCount, likedByUser };
      }
      case 'getCommentsByThreadId': {
        const { page = 1, limit = 10 } = args;
        const data = await CommentModel.find({
          threadId: args.threadId,
        })
          .populate(userPopulate)
          .limit(limit * 1)
          .skip((page - 1) * limit);
        const count = await CommentModel.countDocuments({
          threadId: args.threadId,
        });
        return {
          data,
          count,
        };
      }
      case 'createComment': {
        const callback = async (session, comment) => {
          await sendCommentNotification(session, comment);
        };
        return await runInTransaction(
          {
            action: 'CREATE',
            Model: CommentModel,
            args,
            populate: userPopulate,
            user,
          },
          callback,
        );
      }
      case 'updateComment': {
        return await runInTransaction({
          action: 'UPDATE',
          Model: CommentModel,
          args,
          populate: userPopulate,
          user,
        });
      }
      case 'deleteComment': {
        await runInTransaction({
          action: 'DELETE',
          Model: CommentModel,
          args,
          user,
        });
        return args?._id;
      }
      default: {
        throw new Error('Something went wrong! Please check your Query or Mutation');
      }
    }
  } catch (error) {
    const error2 = error;
    throw error2;
  }
};
