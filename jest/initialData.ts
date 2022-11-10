import { mock_id } from './defaultArguments';
import { systemForms } from '../src/form/permission/systemFormsConfig';

export const usersForm = {
  _id: '622bc445f256f600095a52fd',
  published: false,
  parentId: null,
  name: 'Users',
  fields: [
    {
      label: 'First Name',
      fieldType: 'text',
      template: null,
      options: { multipleValues: false, required: true, formField: '', hidden: false },
      form: null,
      _id: '622bc45d123b471cf437f8b3',
    },
    {
      label: 'Last Name',
      fieldType: 'text',
      template: null,
      options: { multipleValues: false, required: true, formField: '' },
      form: null,
      _id: '622bc465e01a2c980dc4e3eb',
    },
    {
      label: 'Email',
      fieldType: 'email',
      template: null,
      options: {
        multipleValues: false,
        required: true,
        formField: '',
        unique: true,
        caseInsensitiveUnique: true,
      },
      form: null,
      _id: '622bc46eba2fec53bfda70d2',
    },
    {
      label: 'Roles',
      fieldType: 'select',
      template: null,
      options: {
        multipleValues: true,
        required: false,
        formField: '622bc280ab3639752ccd94fc',
        optionsTemplate: 'response',
        hidden: false,
      },
      form: '622bc1c5f256f600095a529f',
      _id: '629277b8001984b5245b4736',
    },
  ],
  slug: 'users',
  createdBy: '60fc5c20d96c6100092a663c',
};

export const getActivityFormLog = () => {
  return {
    _id: systemForms?.activityLogCard?.formId,
    published: false,
    parentId: null,
    name: systemForms?.activityLogCard?.slug,
    slug: systemForms?.activityLogCard?.slug,
    createdBy: '60fc5c20d96c6100092a663c',
    fields: Object.keys(systemForms?.activityLogCard?.fields)?.map((key) => {
      return {
        label: systemForms?.activityLogCard?.fields[key],
        fieldType: 'text',
        options: { required: true },
      };
    }),
  };
};

export const getModelFormObject = () => {
  return {
    published: false,
    parentId: null,
    name: systemForms?.model?.slug,
    slug: systemForms?.model?.slug,
    createdBy: '60fc5c20d96c6100092a663c',
    fields: Object.keys(systemForms?.model?.fields)?.map((key) => {
      return {
        label: systemForms?.model?.fields[key],
        fieldType: 'text',
        options: { required: true },
      };
    }),
  };
};

export const userResponse = {
  _id: mock_id,
  count: 1,
  formId: usersForm._id,
  values: [
    {
      field: '622bc45d123b471cf437f8b3',
      value: 'Mr',
    },
    {
      field: '622bc465e01a2c980dc4e3eb',
      value: 'Robot',
    },
    {
      value: 'mrrobot@domain.com',
      field: '622bc46eba2fec53bfda70d2',
    },
  ],
  createdBy: null,
};
