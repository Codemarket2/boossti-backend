import { DB } from '../utils/DB';
import { Contact } from './utils/contactModel';
import { fileParser } from '../form/utils/readCsvFile';

export const handler = async (event: any): Promise<any> => {
  console.log('csv lambda Function was invoked');
  const start = Date.now();
  try {
    await DB();
    const { fileUrl, collectionName, map, page = 1 } = event;
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
      await Contact.create(responses);
      const stop = Date.now();
      console.log(`Time Taken write in mongodb = ${(stop - start) / 1000} seconds`);
      return `${responses?.length} rows written into database`;
    }
    return `no rows found in csv file`;
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
