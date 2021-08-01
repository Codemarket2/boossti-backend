import { DB } from '../utils/DB';
import { getCurretnUser } from '../utils/authentication';
import { Post } from './utils/postModel';
import { User } from '../user/utils/userModel';
import { AppSyncEvent } from '../utils/cutomTypes';

export const handler = async (event: AppSyncEvent): Promise<any> => {
  try {
    await DB();
    const { fieldName } = event.info;
    const { arguments: args, identity } = event;
    let data: any = [];
    let count = 0;
    const tempFilter: any = {};
    let tempPost: any;
    let user = await getCurretnUser(identity);

    const {
      page = 1,
      limit = 50,
      search = '',
      active = null,
      sortBy = '-createdAt',
    } = args;

    const userSelect = '_id userId name picture';
    const userPopulate = {
      path: 'createdBy',
      select: userSelect,
    };

    switch (fieldName) {
      case 'getPosts': {
        if (active !== null) {
          tempFilter.active = active;
        }
        data = await Post.find({
          ...tempFilter,
          body: { $regex: search, $options: 'i' },
        })
          .populate(userPopulate)
          .limit(limit * 1)
          .skip((page - 1) * limit)
          .sort(sortBy);
        count = await Post.countDocuments({
          ...tempFilter,
          body: { $regex: search, $options: 'i' },
        });
        return {
          data,
          count,
        };
      }
      case 'getPost': {
        return await Post.findById(args._id).populate(userPopulate);
      }
      case 'getMyPosts': {
        await User.findById(user._id);
        data = await Post.find({
          createdBy: user._id,
          body: { $regex: search, $options: 'i' },
        })
          .populate(userPopulate)
          .limit(limit * 1)
          .skip((page - 1) * limit)
          .sort(sortBy);
        count = await Post.countDocuments({
          createdBy: user._id,
          body: { $regex: search, $options: 'i' },
        });
        return {
          data,
          count,
        };
      }
      case 'getPostsByUserId': {
        await User.findById(args.userId);
        data = await Post.find({
          createdBy: args.userId,
          body: { $regex: search, $options: 'i' },
        })
          .populate(userPopulate)
          .limit(limit * 1)
          .skip((page - 1) * limit)
          .sort(sortBy);
        count = await Post.countDocuments({
          createdBy: args.userId,
          body: { $regex: search, $options: 'i' },
        });
        return {
          data,
          count,
        };
      }
      case 'createPost': {
        return {
          ...(
            await Post.create({
              ...args,
              createdBy: user._id,
            })
          ).toJSON(),
          createdBy: user,
        };
      }
      case 'updatePost': {
        tempPost = await Post.findOneAndUpdate(
          { _id: args._id, createdBy: user._id },
          { ...args, updatedAt: new Date(), updatedBy: user._id },
          {
            new: true,
            runValidators: true,
          }
        );
        return {
          ...tempPost.toJSON(),
          createdBy: user,
        };
      }
      case 'deletePost': {
        await Post.findOneAndDelete({ _id: args._id, createdBy: user._id });
        return true;
      }
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
