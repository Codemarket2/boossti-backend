import { AppSyncEvent } from '../utils/cutomTypes';
import { notifyUser } from './utils/notify';

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
      await notifyUser(args);
      return args;
    }
    default:
      throw new Error('Something went wrong! Please check your Query or Mutation');
  }
};
