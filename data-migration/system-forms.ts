import { FormModel } from '../src/form/utils/formModel';
import { db } from './db';

const userForm = {
  name: 'Users',
  slug: 'users',
  fields: [
    { fieldType: 'email', label: 'Email', options: { default: true, required: true } },
    { fieldType: 'text', label: 'First name' },
    { fieldType: 'text', label: 'Last name' },
  ],
};

const createSystemForm = async () => {
  const form = await FormModel.create(userForm);
  console.log(form);
};

(async () => {
  await db();
  await createSystemForm();
})();
