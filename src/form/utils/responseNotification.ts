import { sendNotification } from '../../notification/utils/sendNotification';
export const sendResponseNotification = async (form: any, response: any) => {
  if (!(process.env.NODE_ENV === 'test')) {
    const { createdBy } = form;
    let submitedBy = '';
    if (response?.createdBy?.name) {
      submitedBy = response?.createdBy?.name;
    }
    const desc = response?.parentId?.title
      ? `${submitedBy} has submitted form <i>${form?.name}</i> on <b>${response?.parentId?.title}</b> Page.`
      : `${submitedBy} has submitted form <i>${form?.name}</i>`;

    const payload = {
      userId: [`${createdBy?._id}`],
      title: form.name,
      description: desc,
      link: `/forms/${form?.slug}/response/${response?.count}`,
      formId: form._id,
      threadId: form._id,
      parentId: form.parentId,
    };

    await sendNotification(payload);
  }
};
