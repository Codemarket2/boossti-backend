import { DB } from '../utils/DB';
import { Contact, FailedContact } from './utils/contactModel';
import { fileParser } from '../form/utils/readCsvFile';
import { validateEmail } from '../utils/validateEmail';
// import { BulkUploadLog } from './utils/bulkUploadLog';

export const handler = async (event: any): Promise<any> => {
  console.log('csv lambda Function was invoked');
  const start = Date.now();
  try {
    await DB();
    const { fileUrl, collectionName, map, page = 1, createdBy } = event;
    const maxRows = 80000;
    const skipRows = (page - 1) * maxRows;
    const filter: any = Object.values(map);
    const fields = Object.keys(map);
    const fileData = await fileParser(fileUrl, filter, maxRows, skipRows);
    const successContacts: any = [];
    const failedContacts: any = [];
    for (const data of fileData) {
      const response: any = {};
      for (let i = 0; i < fields.length; i++) {
        response[`${fields[i]}`] = data[map[fields[i]]];
      }
      response['groupName'] = collectionName;
      response['createdBy'] = createdBy;
      const validEmail = await validateEmail(response?.email);
      if (validEmail) {
        successContacts.push(response);
      } else {
        failedContacts.push(response);
      }
    }
    if (successContacts.length > 0) {
      await Contact.create(successContacts);
    }
    if (successContacts.length > 0) {
      await FailedContact.create(successContacts);
    }
    const stop = Date.now();
    console.log(`Time Taken write in mongodb = ${(stop - start) / 1000} seconds`);
    return `${successContacts?.length} rows written into database`;
  } catch (error) {
    const stop = Date.now();
    console.log(`In catch block ${(stop - start) / 1000} seconds`);
    if (error.runThis) {
      console.log('error', error);
    }
    const error2 = error;
    throw error2;
  }
};
