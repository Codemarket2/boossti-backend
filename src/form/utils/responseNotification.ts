import { sendNotification } from '../../notification/utils/sendNotification';
import { getUserAttributes } from './actionHelper';
import { FormModel } from './formModel';

export const sendResponseNotification = async (form: any, response: any) => {
  if (!(process.env.NODE_ENV === 'test')) {
    const { createdBy } = form;
    const userForm = FormModel.findOne({ slug: process.env.USERS_FORM_SLUG });
    const { name } = getUserAttributes(userForm, createdBy);
    const submittedBy = name || 'UnAuthenticated user';

    const description = `${submittedBy} has submitted form <i>${form?.name}</i>`;

    const payload = {
      userIds: [createdBy?._id],
      title: form.name,
      description,
      link: `/forms/${form?.slug}/response/${response?.count}`,
      formId: form._id,
      threadId: form._id,
      parentId: form.parentId,
    };

    if (payload?.userIds?.length > 0) {
      await sendNotification(payload);
    }
  }
};
