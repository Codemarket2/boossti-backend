import { sendNotification } from '../../notification/utils/sendNotification';

export const sendResponseNotification = async (ownerId: any, responseId: string) => {
  const payload = {
    userId: ownerId,
    title: 'Form Submission',
    description: 'You have new form submission',
    link: `/response/${responseId}`,
  };
  await sendNotification(payload);
};
