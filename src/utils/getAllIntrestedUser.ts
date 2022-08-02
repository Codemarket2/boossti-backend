import { CommentModel } from '../comment/utils/commentModel';

export const getAllIntrestedUsers = async (comment) => {
  return await CommentModel.aggregate([
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
