import { TemplateInstanceModel } from '../src/template/utils/templateInstanceModel';
import { db } from './db';
import * as fs from 'fs';

const filePath = 'data-migration/pages.json';

const exportPages = async () => {
  const data = await TemplateInstanceModel.find();
  console.log(data.length);
  fs.writeFileSync(filePath, JSON.stringify(data));
  console.log('All data exported to file');
};

const importPages = async () => {
  let oldData: any = await fs.readFileSync(filePath);
  oldData = JSON.parse(oldData);
  const data: any = await TemplateInstanceModel.create(oldData);
  console.log(data.length);
  console.log('All data imported to database');
};

(async () => {
  try {
    await db();
    // Run your function here
    // await exportPages();
    // await importPages();

    process.exit();
  } catch (error) {
    console.log('Error', error);
    process.exit();
  }
})();
