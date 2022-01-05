import { AppSyncEvent } from '../utils/cutomTypes';
import { NotificationModel } from './utils/notificationSchema';
import { sendNotification } from './utils/sendNotification';
import { DB } from '../utils/DB';
import { getCurrentUser } from '../utils/authentication';

export const handler = async (event: AppSyncEvent): Promise<any> => {
  const {
    info: { fieldName },
    identity,
  } = event;
  const args = { ...event.arguments };
  await DB();
  const user = await getCurrentUser(identity);

  switch (fieldName) {
    case 'sendNotification': {
      return await args;
    }
    case 'callNotification': {
      await sendNotification(args);
      return args;
    }
    case 'getMyNotifications': {
      const data = await NotificationModel.find({ userId: user._id }).sort({ createdAt: -1 });
      const count = await NotificationModel.countDocuments({ userId: user._id });
      return {
        data,
        count,
      };
    }
    default:
      throw new Error('Something went wrong! Please check your Query or Mutation');
  }
};
