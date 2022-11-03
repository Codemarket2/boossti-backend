import { DB } from '../utils/DB';
import { getCurrentUser } from '../utils/authentication';
import { AppSyncEvent } from '../utils/customTypes';
import { CommentModel, IComment } from './utils/commentModel';
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
          threadId: args.threadId,
        });
        let likedByUser = false;
        if (user?._id) {
          const tempLike = await LikeModel.findOne({
            threadId: args.threadId,
            createdBy: user._id,
          });
          if (tempLike) {
            likedByUser = true;
          }
        }
        return { commentCount, likeCount, likedByUser };
      }
      case 'getCommentsByThreadId': {
        const { page = 1, limit = 10, commentIds = [] } = args;
        const filter = { threadId: args.threadId };
        let data: IComment[] = [];
        if (commentIds?.length > 0) {
          data = await CommentModel.find({ ...filter, _id: { $in: commentIds } }).populate(
            userPopulate,
          );
        }
        const newLimit = limit - data?.length;
        const newData = await CommentModel.find({ ...filter, _id: { $nin: commentIds } })
          .populate(userPopulate)
          .limit(newLimit * 1)
          .skip((page - 1) * newLimit)
          .sort('-createdAt');
        data = [...data, ...newData];
        const count = await CommentModel.countDocuments(filter);
        return {
          data,
          count,
        };
      }
      case 'createComment': {
        // const callback = async (session, comment) => {
        //   await sendCommentNotification(session, comment);
        // };
        const comment = await runInTransaction({
          action: 'CREATE',
          Model: CommentModel,
          args,
          populate: userPopulate,
          user,
        });
        await sendCommentNotification(comment, args?.path);
        return comment;
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
        const callback = async (session, comment) => {
          if (comment?._id) {
            await CommentModel.deleteMany({
              parentIds: { $elemMatch: { $eq: comment?._id } },
            }).session(session);
            await LikeModel.deleteMany({
              threadId: comment?._id,
            }).session(session);
          }
        };
        await runInTransaction(
          {
            action: 'DELETE',
            Model: CommentModel,
            args,
            user,
          },
          callback,
        );
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
