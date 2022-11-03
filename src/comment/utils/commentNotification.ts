import { FormModel } from '../../form/utils/formModel';
import { ResponseModel } from '../../form/utils/responseModel';
import { sendEmail } from '../../utils/email';
import { userPopulate } from '../../utils/populate';
import { CommentModel } from './commentModel';
import { getUserAttributes } from '../../form/utils/actionHelper';
import { createFeed } from '../../form/feed/createFeed';

export const sendCommentNotification = async (comment, path = '') => {
  if (process.env.NODE_ENV === 'test') {
    return;
  }
  let commentLink = path?.split('?')?.[0] || '';
  if (commentLink && comment?.parentIds?.length > 0) {
    comment?.parentIds?.forEach((parentId, index) => {
      if (index === 0) {
        commentLink += `?threadId=${parentId}`;
      } else {
        commentLink += `&childThreadId=${parentId}`;
      }
    });
    commentLink += `&commentId=${comment?._id}`;
  }
  const receivers: any[] = [];
  let response, form;
  for (const [parentIdIndex, parentId] of comment.parentIds?.entries()) {
    try {
      let parentComment;
      if (parentIdIndex === 0) {
        response = await ResponseModel.findOne({ 'values._id': parentId }).populate(userPopulate);
        // .session(session);
        parentComment = response;
        if (response?.formId) {
          form = await FormModel.findById(response?.formId);
          // .session(session);
        }
      } else {
        parentComment = await CommentModel.findById(parentId).populate(userPopulate);
        // .session(session);
      }
      const commentString = comment?.createdBy?._id?.toString();
      const parentCommentString = parentComment?.createdBy?._id?.toString();
      const output = commentString === parentCommentString;
      if (
        commentString &&
        parentCommentString &&
        !output &&
        !receivers?.find((receiver) => receiver?._id == parentComment?.createdBy?._id)?._id
      ) {
        receivers.push(parentComment?.createdBy);
      }
    } catch (error) {
      console.log('Error while getting parentId');
    }
  }
  if (receivers?.length > 0) {
    const userForm = await FormModel.findOne({ slug: process.env.USERS_FORM_SLUG });
    // .session(
    //   session,
    // );
    const to: string[] = [];
    receivers?.map((receiver) => {
      const userEmail = getUserAttributes(userForm, receiver)?.email;
      if (userEmail) to.push(userEmail);
    });
    const createdBy = getUserAttributes(userForm, comment?.createdBy);
    let linkToComment = ``;
    if (form?.slug && response?.count) {
      linkToComment = `<p><a href="${process.env.FRONTEND_URL}${commentLink}"><button>View Comment</button></a></p>`;
    }
    const body = `
      Hi there,<br/>
      <p><b>${createdBy?.name}</b> just 
      ${comment.parentIds?.length > 1 ? 'replied to a comment' : 'commented on your response'}
      </p>
    ${linkToComment}
    Comment Preview
    ${comment.body}
    `;
    const emailPayload = {
      from: `Boossti <${process.env.SENDER_EMAIL}>`,
      to,
      body,
      subject: `New Comment`,
    };
    if (emailPayload?.to?.length > 0 && emailPayload?.from) await sendEmail(emailPayload);
    for (const receiver of receivers) {
      await createFeed({
        message: `${createdBy?.name} just ${
          comment.parentIds?.length > 1 ? 'replied to a comment' : 'commented on your response'
        }`,
        link: `${commentLink}`,
        createdBy: comment?.createdBy?._id,
        receiver: receiver?._id,
      });
    }
  }
};
