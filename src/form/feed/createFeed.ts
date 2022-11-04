import { systemForms } from '../permission/systemFormsConfig';
import { createResponse } from '../utils/createResponse';
import { FormModel } from '../utils/formModel';
import { getSystemFormFields } from '../utils/getSystemFormFields';

interface ICreateFeedPayload {
  message: string;
  link: string;
  createdBy: string;
  receiver: string;
}

export const createFeed = async ({ message, link, createdBy, receiver }: ICreateFeedPayload) => {
  try {
    const feedForm = await FormModel.findOne({ slug: systemForms?.feed?.slug }).lean();
    const values: any[] = [];
    if (feedForm?._id) {
      const feedFormFields = getSystemFormFields(systemForms?.feed, feedForm);
      const messageField = feedFormFields?.[systemForms?.feed?.fields?.message];
      const linkField = feedFormFields?.[systemForms?.feed?.fields?.link];
      const statusField = feedFormFields?.[systemForms?.feed?.fields?.status];
      const receiverField = feedFormFields?.[systemForms?.feed?.fields?.receiver];
      if (messageField) {
        values.push({ field: messageField?._id, value: message });
      }
      if (linkField) {
        values.push({ field: linkField?._id, value: link });
      }
      if (statusField) {
        values.push({ field: statusField?._id, value: 'unread' });
      }
      if (receiverField) {
        values.push({ field: receiverField?._id, value: '', response: receiver });
      }
      await createResponse({ formId: feedForm?._id, values, createdBy });
    }
  } catch (error) {
    // debugger
  }
};
