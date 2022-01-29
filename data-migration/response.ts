import { ResponseModel } from '../src/form/utils/responseModel';
import { FormModel } from '../src/form/utils/formModel';
import { db } from './db';
import * as fs from 'fs';

const filePath = 'data-migration/responses.json';

const exportResponses = async () => {
  const responses = await ResponseModel.find();
  console.log(responses.length);
  fs.writeFileSync(filePath, JSON.stringify(responses));
  console.log('All responses exported to file');
};

const importResponses = async () => {
  let oldResponses: any = fs.readFileSync(filePath);
  oldResponses = JSON.parse(oldResponses);

  for (let i = 0; i < oldResponses.length; i++) {
    let args = oldResponses[i];
    args = { ...args, count: 1 };
    const lastResponse = await ResponseModel.findOne({ formId: args.formId }).sort('-count');
    if (lastResponse) {
      args = { ...args, count: lastResponse?.count + 1 };
    }
    const newResponse = await ResponseModel.create(args);
    console.log({ i });
  }
  console.log('All responses imported to database');
};

(async () => {
  try {
    await db();
    // Run your function here
    await exportResponses();
    // await importResponses();
    process.exit();
  } catch (error) {
    console.log('Error', error);
    process.exit();
  }
})();
