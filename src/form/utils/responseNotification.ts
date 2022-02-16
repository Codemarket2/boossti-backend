import { sendNotification } from '../../notification/utils/sendNotification';
export const sendResponseNotification = async (form: any, response: any) => {
  const { createdBy } = form;
  let submitedBy = '';
  if (response?.createdBy?.name) {
    submitedBy = response?.createdBy?.name;
  }
  const desc = response?.parentId?.title
    ? `${submitedBy} has submitted a new response on ${form?.name} From ${response?.parentId?.title} Page.`
    : `${submitedBy} has submitted a new response on ${form?.name}`;

  const payload = {
    userId: [`${createdBy}`],
    title: form.name,
    description: desc,
    link: `/forms/${form?.slug}/response/${response?.count}`,
    formId: form._id,
    threadId: form._id,
    parentId: form.parentId,
  };

  await sendNotification(payload);
};
