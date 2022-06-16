import { DB } from '../utils/DB';
import { Bookmark } from './utils/bookmarkModel';
// import { User } from '../user/utils/userModel';
import { AppSyncEvent } from '../utils/customTypes';
import { getCurrentUser } from '../utils/authentication';

export const handler = async (event: AppSyncEvent): Promise<any> => {
  try {
    await DB();
    const { fieldName } = event.info;
    const { arguments: args, identity } = event;
    let data: any = [];
    let count = 0;
    // const tempFilter: any = {};
    // let createdBy;
    // let tempUser: any = null;

    const user = await getCurrentUser(identity);

    // if (identity && identity.claims && identity.claims.sub) {
    //   createdBy = identity.claims.sub;
    // }

    const { page = 1, limit = 50, search = '', active = null, sortBy = '-createdAt' } = args;

    switch (fieldName) {
      case 'getBookmark': {
        return await Bookmark.findById(args._id);
      }
      case 'getMyBookmarks': {
        // tempUser = await User.findOne({
        //   userId: createdBy,
        // });
        data = await Bookmark.find({
          createdBy: user._id,
          bookmark: { $regex: search, $options: 'i' },
        })
          .limit(limit * 1)
          .skip((page - 1) * limit)
          .sort(sortBy);
        count = await Bookmark.countDocuments({
          createdBy: user._id,
          bookmark: { $regex: search, $options: 'i' },
        });
        return {
          data,
          count,
        };
      }
      case 'createBookmark': {
        // tempUser = await User.findOne({
        //   userId: createdBy,
        // });
        return await Bookmark.create({
          ...args,
          createdBy: user._id,
        });
      }
      case 'updateBookmark': {
        // tempUser = await User.findOne({
        //   userId: createdBy,
        // });
        return await Bookmark.findByIdAndUpdate(
          args._id,
          { ...args, updatedAt: new Date(), updatedBy: user._id },
          {
            new: true,
            runValidators: true,
          },
        );
      }
      case 'deleteBookmark': {
        await Bookmark.findOneAndDelete({ _id: args._id, createdBy: user._id });
        return true;
      }
      default:
        throw new Error('Something went wrong! Please check your Query or Mutation');
    }
  } catch (error) {
    const error2 = error;
    throw error2;
  }
};
