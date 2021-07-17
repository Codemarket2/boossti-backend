/* eslint-disable no-case-declarations */
import { DB } from '../utils/DB';
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
    let createdBy;
    let updatedBy;
    const tempPost: any = null;
    let tempUser: any = null;

    if (identity && identity.claims && identity.claims.sub) {
      createdBy = identity.claims.sub;
      updatedBy = identity.claims.sub;
    }

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
      case 'getPosts':
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
      case 'getPost':
        return await Post.findById(args._id).populate(userPopulate);
      case 'getMyPosts':
        tempUser = await User.findOne({
          userId: createdBy,
        });
        data = await Post.find({
          createdBy: tempUser._id,
          body: { $regex: search, $options: 'i' },
        })
          .populate(userPopulate)
          .limit(limit * 1)
          .skip((page - 1) * limit)
          .sort(sortBy);
        count = await Post.countDocuments({
          createdBy: tempUser._id,
          body: { $regex: search, $options: 'i' },
        });
        return {
          data,
          count,
        };
      case 'createPost':
        tempUser = await User.findOne({
          userId: createdBy,
        }).select(userSelect);
        return {
          ...(await Post.create({
            ...args,
            createdBy: tempUser._id,
          })),
          createdBy: tempUser,
        };
      case 'updatePost':
        tempUser = await User.findOne({
          userId: createdBy,
        }).select(userSelect);
        return {
          ...(await Post.findByIdAndUpdate(
            args._id,
            { ...args, updatedAt: new Date(), updatedBy: tempUser._id },
            {
              new: true,
              runValidators: true,
            }
          )),
          createdBy: tempUser,
        };
      case 'deletePost':
        await Post.findByIdAndDelete(args._id);
        return true;
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
