import { DB } from '../utils/DB';
import { getCurrentUser } from '../utils/authentication';
import { AppSyncEvent } from '../utils/customTypes';
import { LikeModel } from './utils/likeModel';
import { runInTransaction } from '../utils/runInTransaction';
import { userPopulate } from '../utils/populate';

export const handler = async (event: AppSyncEvent): Promise<any> => {
  try {
    await DB();
    const { fieldName } = event.info;
    const { identity } = event;
    let args = { ...event.arguments };
    const user = await getCurrentUser(identity);

    if (fieldName.toLocaleLowerCase().includes('create') && user && user._id) {
      args = { ...args, createdBy: user._id };
    }

    switch (fieldName) {
      case 'createLike': {
        return await runInTransaction({
          action: 'CREATE',
          Model: LikeModel,
          args,
          populate: userPopulate,
          user,
        });
      }
      case 'updateLike': {
        return await runInTransaction({
          action: 'UPDATE',
          Model: LikeModel,
          args,
          populate: userPopulate,
          user,
        });
      }
      case 'getLike': {
        return await LikeModel.findById(args._id).populate(userPopulate);
      }
      case 'getLikesByThreadId': {
        const { page = 1, limit = 10 } = args;
        const data = await LikeModel.find({
          threadId: args.threadId,
        })
          .populate(userPopulate)
          .limit(limit * 1)
          .skip((page - 1) * limit);
        const count = await LikeModel.countDocuments({
          threadId: args.threadId,
        });
        return {
          data,
          count,
        };
      }
      case 'deleteLike': {
        const like = await LikeModel.findOne({ createdBy: user?._id, threadId: args?.threadId });
        if (like?._id) {
          await runInTransaction({
            action: 'DELETE',
            Model: LikeModel,
            args: { _id: like?._id },
            user,
          });
          return like._id;
        }
        return null;
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
