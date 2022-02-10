import ListItemModel from '../src/list/utils/listItemModel';
import { db } from './db';
import * as fs from 'fs';

const filePath = 'data-migration/listItems.json';

const exportListItems = async () => {
  const data = await ListItemModel.find();
  console.log(data.length);
  fs.writeFileSync(filePath, JSON.stringify(data));
  console.log('All data exported to file');
};

const importListItems = async () => {
  let oldData: any = await fs.readFileSync(filePath);
  oldData = JSON.parse(oldData);
  const data: any = await ListItemModel.create(oldData);
  console.log(data.length);
  console.log('All data imported to database');
};

(async () => {
  try {
    await db();
    // Run your function here
    // await exportListItems();
    // await importListItems();

    process.exit();
  } catch (error) {
    console.log('Error', error);
    process.exit();
  }
})();
