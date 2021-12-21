import { sendNotification } from '../../notification/utils/sendNotification';

export const sendResponseNotification = async (ownerId: any, response: any) => {
  let submitedBy = '';
  if (response?.createdBy?.name) {
    submitedBy = `by ${response?.createdBy?.name}`;
  }
  const payload = {
    userId: ownerId,
    title: 'Form Submission',
    description: `You have new form submission ${submitedBy}`,
    link: `/response/${response?._id}`,
  };
  await sendNotification(payload);
};
