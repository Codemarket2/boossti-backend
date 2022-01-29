import { FormModel } from '../src/form/utils/formModel';
import { db } from './db';
import * as fs from 'fs';
import slugify from 'slugify';

const filePath = 'data-migration/forms.json';

const exportForms = async () => {
  const forms = await FormModel.find();
  console.log(forms.length);
  fs.writeFileSync(filePath, JSON.stringify(forms));
  console.log('All forms exported to file');
};

const importForms = async () => {
  let oldForms: any = await fs.readFileSync(filePath);
  oldForms = JSON.parse(oldForms);
  const formNames: any[] = [];
  const newForms = oldForms.map((element) => {
    if (formNames.includes(element.name)) {
      console.log('duplicate', element.name);
      element.name = `${element.name} ${Math.floor(1000 + Math.random() * 9000)}`;
      console.log('new name', element.name);
    }
    element.slug = slugify(element.name, { lower: true });
    formNames.push(element?.name);
    return element;
  });

  const forms: any = await FormModel.create(newForms);
  console.log(forms.length);
  console.log('All forms imported to database');
};

(async () => {
  try {
    await db();
    // Run your function here
    // await exportForms();
    // await importForms();

    process.exit();
  } catch (error) {
    console.log('Error', error);
    process.exit();
  }
})();
