import TemplateModel from '../src/template/utils/templateModel';
import { db } from './db';
import * as fs from 'fs';

const filePath = 'data-migration/templates2.json';

const exportTemplates = async () => {
  const data = await TemplateModel.find();
  console.log(data.length);
  fs.writeFileSync(filePath, JSON.stringify(data));
  console.log('All data exported to file');
};

const importTemplates = async () => {
  let oldData: any = await fs.readFileSync(filePath);
  oldData = JSON.parse(oldData);
  oldData = oldData.map((template, index) => {
    const count = index + 1;
    return { ...template, count, slug: count };
  });
  const data: any = await TemplateModel.create(oldData);
  console.log(data.length);
  console.log('All data imported to database');
};

(async () => {
  try {
    await db();
    // Run your function here
    // await exportTemplates();
    // await importTemplates();

    process.exit();
  } catch (error) {
    console.log('Error', error);
    process.exit();
  }
})();
