import PageModel from '../src/template/utils/pageModel';
import { db } from './db';
import * as fs from 'fs';

const filePath = 'data-migration/listItems.json';

const exportPages = async () => {
  const data = await PageModel.find();
  console.log(data.length);
  fs.writeFileSync(filePath, JSON.stringify(data));
  console.log('All data exported to file');
};

const importPages = async () => {
  let oldData: any = await fs.readFileSync(filePath);
  oldData = JSON.parse(oldData);
  const data: any = await PageModel.create(oldData);
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
