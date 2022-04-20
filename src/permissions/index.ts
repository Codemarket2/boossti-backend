import { getCurrentUser } from '../utils/authentication';
import { AppSyncEvent } from '../utils/cutomTypes';
import { DB } from '../utils/DB';

export const handler = async (event: AppSyncEvent): Promise<any> => {
  const {
    info: { fieldName },
    identity,
  } = event;
  const args = { ...event.arguments };
  await DB();
  const user = await getCurrentUser(identity);
  switch (fieldName) {
    case '':
      break;

    default:
      break;
  }
};
