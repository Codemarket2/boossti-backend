import FieldValueModel from '../../field/utils/fieldValueModel';
import { Comment } from './commentModel';
import { sendNotification } from '../../notification/utils/sendNotification';

export const sendCommentNotification = async (comment) => {
  const fieldValue = await FieldValueModel.findById(comment.threadId);
  if (fieldValue && fieldValue?.createdBy.toString() !== comment.createdBy?._id.toString()) {
    const payload = {
      userId: `${fieldValue.createdBy}`,
      title: 'New Comment',
      description: `${comment.createdBy?.name} commented on your post`,
      // link: `/response/${responseId}`,
    };
    await sendNotification(payload);
  }
  if (comment.threadId.toString() !== comment.parentId.toString()) {
    const parentComment = await Comment.findById(comment.parentId);
    if (
      parentComment &&
      parentComment?.createdBy.toString() !== comment.createdBy?._id.toString()
    ) {
      const payload = {
        userId: `${parentComment.createdBy}`,
        title: 'New Comment',
        description: `${comment.createdBy?.name} replied to your comment`,
        // link: `/response/${responseId}`,
      };
      await sendNotification(payload);
    }
  }
};
