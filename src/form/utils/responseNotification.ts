import { sendNotification } from '../../notification/utils/sendNotification';

export const sendResponseNotification = async (form: any, response: any) => {
  const { createdBy } = form;
  let submitedBy = '';
  if (response?.createdBy?.name) {
    submitedBy = response?.createdBy?.name;
  }
  const payload = {
    userId: createdBy,
    title: form.name,
    description: `${submitedBy} has submitted a new response on ${form?.name} From ${response?.parentId?.title} Page.`,
    link: `/response/${response?._id}`,
  };
  await sendNotification(payload);
};
