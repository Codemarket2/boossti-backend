import ListTypeModel from '../src/list/utils/listTypeModel';
import { db } from './db';
import * as fs from 'fs';

const filePath = 'data-migration/listTypes.json';

const exportListTypes = async () => {
  const data = await ListTypeModel.find();
  console.log(data.length);
  fs.writeFileSync(filePath, JSON.stringify(data));
  console.log('All data exported to file');
};

const importListTypes = async () => {
  let oldData: any = await fs.readFileSync(filePath);
  oldData = JSON.parse(oldData);
  const data: any = await ListTypeModel.create(oldData);
  console.log(data.length);
  console.log('All data imported to database');
};

(async () => {
  try {
    await db();
    // Run your function here
    // await exportListTypes();
    // await importListTypes();

    process.exit();
  } catch (error) {
    console.log('Error', error);
    process.exit();
  }
})();
