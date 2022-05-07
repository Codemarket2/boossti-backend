import { DB } from '../utils/DB';
import { AppSyncEvent } from '../utils/cutomTypes';
import { Contact, MailingList } from './utils/contactModel';
import { fileParser } from '../form/utils/readCsvFile';

export const handler = async (event: AppSyncEvent): Promise<any> => {
  try {
    await DB();
    const { fileUrl, collectionName, map, page = 1 } = event.arguments;
    const maxRows = 80000;
    const skipRows = (page - 1) * maxRows;
    const filter: any = Object.values(map);
    const fields = Object.keys(map);
    const fileData = await fileParser(fileUrl, filter, maxRows, skipRows);
    const responses: any = [];
    fileData?.forEach((data) => {
      const response = {};
      for (let i = 0; i < fields.length; i++) {
        response[`${fields[i]}`] = data[map[fields[i]]];
      }
      response['groupName'] = collectionName;
      responses.push(response);
    });
    if (responses.length > 0) {
      await Contact.insertMany(responses);
      return `${responses?.length} rows written into database`;
    }
    return `no rows found in csv file`;
  } catch (error) {
    if (error.runThis) {
      console.log('error', error);
    }
    const error2 = error;
    throw error2;
  }
};
