import { DB } from '../utils/DB';
import Template from '../template/utils/templateModel';
import Page from '../template/utils/pageModel';
import { getCurrentUser } from '../utils/authentication';
import { Post } from './utils/postModel';
import { getTags } from './utils/getTags';
import { User } from '../user/utils/userModel';
import { AppSyncEvent } from '../utils/customTypes';

export const handler = async (event: AppSyncEvent): Promise<any> => {
  try {
    await DB();
    const { fieldName } = event.info;
    const { arguments: args, identity } = event;
    let data: any = [];
    let count = 0;
    const tempFilter: any = {};
    const user = await getCurrentUser(identity);

    const { page = 1, limit = 50, search = '', active = null, sortBy = '-createdAt' } = args;

    const userSelect = '_id userId name picture';
    const userPopulate = {
      path: 'createdBy',
      select: userSelect,
    };

    const postPopulate = [
      userPopulate,
      {
        path: 'tags.tag',
        select: 'title description media slug types',
        populate: {
          path: 'types',
          model: 'Template',
          select: 'slug',
          strictPopulate: false,
        },
      },
    ];

    switch (fieldName) {
      case 'getPosts': {
        if (active !== null) {
          tempFilter.active = active;
        }
        data = await Post.find({
          ...tempFilter,
          body: { $regex: search, $options: 'i' },
        })
          .populate(postPopulate)
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
        return await Post.findById(args._id).populate(postPopulate);
      }
      case 'getMyPosts': {
        await User.findById(user._id);
        data = await Post.find({
          createdBy: user._id,
          body: { $regex: search, $options: 'i' },
        })
          .populate(postPopulate)
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
          .populate(postPopulate)
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
        const tags = await getTags(args.body);
        const post = await Post.create({
          ...args,
          createdBy: user._id,
          tags,
        });
        return await post.populate(postPopulate); //.execPopulate();
      }
      case 'updatePost': {
        const tags = await getTags(args.body);
        const post: any = await Post.findOneAndUpdate(
          { _id: args._id, createdBy: user._id },
          { ...args, updatedAt: new Date(), updatedBy: user._id, tags },
          {
            new: true,
            runValidators: true,
          },
        );
        return await post.populate(postPopulate); //.execPopulate();
      }
      case 'deletePost': {
        await Post.findOneAndDelete({ _id: args._id, createdBy: user._id });
        return true;
      }
      default:
        if (args.registerModel) {
          await Template.findOne();
          await Page.findOne();
        }
        throw new Error('Something went wrong! Please check your Query or Mutation');
    }
  } catch (error) {
    const error2 = error;
    throw error2;
  }
};
