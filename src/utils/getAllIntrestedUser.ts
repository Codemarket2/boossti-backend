import { Comment } from '../comment/utils/commentModel';

export const getAllIntrestedUsers = async (comment) => {
  return await Comment.aggregate([
    {
      $match: {
        threadId: comment.threadId,
        createdBy: {
          $ne: comment.createdBy._id,
        },
      },
    },
    {
      $group: {
        _id: '$createdBy',
      },
    },
  ]);
};
