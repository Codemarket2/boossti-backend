import { AppSyncEvent } from '../utils/cutomTypes';
import { sendNotification } from './utils/sendNotification';

export const handler = async (event: AppSyncEvent): Promise<any> => {
  const {
    info: { fieldName },
  } = event;
  const args = { ...event.arguments };

  switch (fieldName) {
    case 'sendNotification': {
      return await args;
    }
    case 'callNotification': {
      await sendNotification(args);
      return args;
    }
    default:
      throw new Error('Something went wrong! Please check your Query or Mutation');
  }
};
