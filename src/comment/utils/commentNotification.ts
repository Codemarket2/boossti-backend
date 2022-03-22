// import { Comment } from './commentModel';
// import { Post } from '../../post/utils/postModel';
// import { getAllIntrestedUsers } from '../../utils/getAllIntrestedUser';
export const sendCommentNotification = async (comment) => {
  console.log('sendCommentNotification');
};
/* export const sendCommentNotification = async (comment) => {
  const fieldValue = await FieldValueModel.findById(comment.threadId);
  if (fieldValue && fieldValue?.createdBy.toString() !== comment.createdBy?._id.toString()) {
    const payload = {
      userId: [`${fieldValue.createdBy}`],
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
        userId: [`${parentComment.createdBy}`],
        title: 'New Comment',
        description: `${comment.createdBy?.name} replied to your comment`,
        // link: `/response/${responseId}`,
      };
      await sendNotification(payload);
    }
  }

  //implemented by sonu for feed post notifications
  try {
    const post = await Post.findById(comment.parentId);
    const users = await getAllIntrestedUsers(comment);
    const intrestedUser = users?.map((e) => `${e?._id}`);

    if (post?.createdBy?.toString() !== comment?.createdBy?._id.toString()) {
      const parentComment = await Comment.findById(comment.parentId);
      if (
        parentComment &&
        parentComment?.createdBy.toString() !== comment?.createdBy?._id.toString()
      ) {
        !intrestedUser.includes(`${parentComment?.createdBy}`) &&
          intrestedUser.push(`${parentComment?.createdBy}`);
        const payload = {
          userId: intrestedUser,
          title: `New Reply on your comment.`,
          description: `${comment?.createdBy?.name} replied to your comment`,
          threadId: parentComment?.threadId,
        };
        await sendNotification(payload);
      }
      if (!parentComment && post) {
        !intrestedUser.includes(`${post?.createdBy?._id}`) &&
          intrestedUser.push(`${post?.createdBy?._id}`);
        const payload = {
          userId: intrestedUser,
          title: 'New Comment on Your Post',
          description: `${comment?.createdBy?.name} commented on your post`,
          threadId: comment?.threadId,
        };
        await sendNotification(payload);
      }
    }
  } catch (e) {
    console.log(e.message);
  }
}; */
