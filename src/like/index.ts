import { DB } from '../utils/DB';
import { getCurrentUser } from '../utils/authentication';
import { AppSyncEvent } from '../utils/customTypes';
import { User } from '../user/utils/userModel';
import { LookoutMetrics } from 'aws-sdk';
import { Like } from './utils/likeModel';

export const handler = async (event: AppSyncEvent): Promise<any> => {
  try {
    await DB();
    const { fieldName } = event.info;
    const { identity } = event;
    let args = { ...event.arguments };
    const user = await getCurrentUser(identity);
    const userSelect = 'name picture _id';
    let data: any = [];
    const { page = 1, limit = 10 } = args;
    let tempLikes: any;
    const userPopulate = {
      path: 'createdBy',
      select: userSelect,
    };
    if (fieldName.toLocaleLowerCase().includes('create') && user && user._id) {
      args = { ...args, createdBy: user._id };
    } else if (fieldName.toLocaleLowerCase().includes('update') && user && user._id) {
      args = { ...args, updatedBy: user._id };
    }

    switch (fieldName) {
      case 'createLike': {
        const like = await Like.create({
          ...args,
          like: true,
        });
        return await like.populate(userPopulate); //.execPopulate();
      }
      case 'updateLike': {
        tempLikes = await Like.findOneAndUpdate(
          { _id: args._id, createdBy: user._id },
          { like: false, updatedAt: new Date(), updatedBy: user._id },
          {
            new: true,
            runValidators: true,
          },
        );
        return await tempLikes.populate(userPopulate); //.execPopulate();
      }
      case 'getLike': {
        const getLike = await Like.findById(args._id).populate(userPopulate);

        return await getLike;
      }
      case 'getLikesByParentId': {
        await User.findById(args.userId);
        data = await Like.find({
          parentId: args.parentId,
        })
          .populate(userPopulate)
          .limit(limit * 1)
          .skip((page - 1) * limit);
        const count = await Like.countDocuments({
          parentId: args.parentId,
        });
        return {
          data,
          count,
        };
      }
      case 'deleteLike': {
        await Like.findOneAndDelete({
          parentId: args.parentId,
          createdBy: user._id,
        });
        return true;
      }
      default:
        await Like.findOne();
        await User.findOne();
        throw new Error('Something went wrong! Please check your Query or Mutation');
    }
  } catch (error) {
    const error2 = error;
    throw error2;
  }
};
