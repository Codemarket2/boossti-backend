import { FormModel } from '../src/form/utils/formModel';
import { ResponseModel } from '../src/form/utils/responseModel';
import { db } from './db';

const userForm = {
  name: 'Users',
  slug: 'users',
  fields: [
    { fieldType: 'email', label: 'Email', options: { default: true, required: true } },
    { fieldType: 'text', label: 'First name', options: { required: true } },
    { fieldType: 'text', label: 'Last name', options: { required: true } },
  ],
  settings: { system: true },
};

const createSystemForm = async () => {
  const form = await FormModel.create(userForm);
  console.log(form);
};

const createUser = async ({ firstName, lastName, email }) => {
  const form = await FormModel.findOne({ slug: 'users' });
  if (form?._id) {
    const userResponse: any = {
      formId: form?._id,
      values: [],
      count: 2,
    };
    form?.fields?.forEach((field) => {
      if (field?.label?.toLowerCase() === 'first name') {
        userResponse.values.push({ value: firstName, field: field?._id });
      } else if (field?.label?.toLowerCase() === 'last name') {
        userResponse.values.push({ value: lastName, field: field?._id });
      } else if (field?.label?.toLowerCase() === 'email') {
        userResponse.values.push({ value: email, field: field?._id });
      }
    });
    const response = await ResponseModel.create(userResponse);
    console.log({ response });
  }
};

(async () => {
  await db();
  // await createUser({ firstName: '', lastName: '', email: '' });
  // await createSystemForm();
})();
