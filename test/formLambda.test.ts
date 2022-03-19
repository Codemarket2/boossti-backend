import '../jest/jestSetup';
import { handler } from '../src/form';
import { handler as listHandler } from '../src/template';
import { mockUser, createMockEvent } from '../jest/defaultArguments';

// yarn test test/formLambda.test.ts

export const mockTemplate = {
  _id: '60fc4d29f11b170008d9ec48',
  title: 'Doctors',
  media: [],
};

const mockPage = {
  _id: '60fc4d29f11b170008d9ec46',
  types: [mockTemplate._id],
  title: 'Dr John',
  description: 'NYC',
  media: [],
};

const mockFields = [
  { label: 'Doctor', fieldType: 'type', options: {}, typeId: mockTemplate._id },
  { label: 'Email', fieldType: 'email', options: {}, typeId: null },
  { label: 'Message', fieldType: 'textarea', options: {}, typeId: null },
];

const mockForm = {
  _id: '60fc4d29f11b170008d9ec55',
  //   parentId: 'String',
  name: 'Contact Form',
  fields: mockFields,
  settings: {},
  published: false,
};

const updatedMockForm = {
  ...mockForm,
  name: 'Event Form',
  published: true,
};

const mockValues = [
  {
    _id: '618e782f5fe52d17c3824dc5',
    field: 'Doctor',
    value: null,
    valueNumber: null,
    valueBoolean: null,
    valueDate: null,
    itemId: mockPage._id,
  },
  {
    field: 'Email',
    value: 'contact@codemarket.io',
    valueNumber: null,
    valueBoolean: null,
    valueDate: null,
    itemId: null,
  },
];

const mockResponse = {
  _id: '60fc4d29f11b170008d9ec99',
  parentId: mockPage._id,
  formId: mockForm._id,
  values: mockValues,
};

const updatedMockResponse = {
  ...mockResponse,
  values: [
    ...mockResponse.values,
    {
      field: 'Message',
      value: 'Hello, How are you?',
      valueNumber: null,
      valueBoolean: null,
      valueDate: null,
      itemId: null,
    },
  ],
};

const createFormEvent = createMockEvent('createForm', mockForm);
const createResponseEvent = createMockEvent('createResponse', mockResponse);
const createTemplateEvent = createMockEvent('createTemplate', mockTemplate);
const createPageEvent = createMockEvent('createPage', mockPage);

describe('List Lambda Tests', () => {
  it('createForm test', async () => {
    await listHandler(createTemplateEvent);
    const form = await handler(createFormEvent);
    expect(form._id).toBeDefined();
    expect(form.name).toBe(mockForm.name);
    expect(form.fields.length).toBe(mockForm.fields.length);
    expect(form.fields[0].label).toBe(mockForm.fields[0].label);
    expect(form.fields[0].fieldType).toBe(mockForm.fields[0].fieldType);
    expect(form.fields[0].typeId._id.toString()).toBe(mockForm.fields[0].typeId);
    expect(form.published).toBe(false);
    expect(form.createdBy._id).toMatchObject(mockUser._id);
    expect(form.createdAt).toBeDefined();
    expect(form.updatedAt).toBeDefined();
  });

  it('updateForm test', async () => {
    await listHandler(createTemplateEvent);
    await handler(createFormEvent);
    const form = await handler(createMockEvent('updateForm', updatedMockForm));
    expect(form._id).toBeDefined();
    expect(form.name).toBe(updatedMockForm.name);
    expect(form.fields.length).toBe(updatedMockForm.fields.length);
    expect(form.fields[0].label).toBe(updatedMockForm.fields[0].label);
    expect(form.fields[0].fieldType).toBe(updatedMockForm.fields[0].fieldType);
    expect(form.fields[0].typeId._id.toString()).toBe(updatedMockForm.fields[0].typeId);
    expect(form.published).toBe(updatedMockForm.published);
    expect(form.createdBy._id).toMatchObject(mockUser._id);
    expect(form.createdAt).toBeDefined();
    expect(form.updatedAt).toBeDefined();
  });

  it('getForm test', async () => {
    await listHandler(createTemplateEvent);
    await handler(createFormEvent);
    const form = await handler(createMockEvent('getForm', { _id: mockForm._id }));
    expect(form._id).toBeDefined();
    expect(form.name).toBe(mockForm.name);
    expect(form.fields.length).toBe(mockForm.fields.length);
    expect(form.fields[0].label).toBe(mockForm.fields[0].label);
    expect(form.fields[0].fieldType).toBe(mockForm.fields[0].fieldType);
    expect(form.fields[0].typeId._id.toString()).toBe(mockForm.fields[0].typeId);
    expect(form.published).toBe(false);
    expect(form.createdBy._id).toMatchObject(mockUser._id);
    expect(form.createdAt).toBeDefined();
    expect(form.updatedAt).toBeDefined();
  });

  it('getForms test', async () => {
    await listHandler(createTemplateEvent);
    await handler(createFormEvent);
    const forms = await handler(createMockEvent('getForms'));
    expect(forms.data.length).toBe(1);
    expect(forms.count).toBe(1);
    const form = forms.data[0];
    expect(form._id).toBeDefined();
    expect(form.name).toBe(mockForm.name);
    expect(form.fields.length).toBe(mockForm.fields.length);
    expect(form.fields[0].label).toBe(mockForm.fields[0].label);
    expect(form.fields[0].fieldType).toBe(mockForm.fields[0].fieldType);
    expect(form.fields[0].typeId._id.toString()).toBe(mockForm.fields[0].typeId);
    expect(form.published).toBe(false);
    expect(form.createdBy._id).toMatchObject(mockUser._id);
    expect(form.createdAt).toBeDefined();
    expect(form.updatedAt).toBeDefined();
  });

  it('getForms test', async () => {
    await listHandler(createTemplateEvent);
    await handler(createFormEvent);
    const formId = await handler(createMockEvent('deleteForm', { _id: mockForm._id }));
    expect(formId.toString()).toBe(mockForm._id);
  });

  it('createResponse test', async () => {
    await listHandler(createTemplateEvent);
    await listHandler(createPageEvent);
    await handler(createFormEvent);
    const response = await handler(createResponseEvent);
    const response2 = await handler(
      createMockEvent('createResponse', { ...mockResponse, _id: '60fc4d29f11b170008d9ec52' }),
    );
    expect(response._id).toBeDefined();
    expect(response.formId.toString()).toBe(mockResponse.formId);
    expect(response.parentId._id.toString()).toBe(mockResponse.parentId);
    expect(response.values.length).toBe(mockResponse.values.length);
    expect(response.values[0].field).toBe(mockResponse.values[0].field);
    expect(response.values[0].itemId._id.toString()).toBe(mockResponse.values[0].itemId);
    expect(response.createdBy._id).toMatchObject(mockUser._id);
    expect(response.createdAt).toBeDefined();
    expect(response.updatedAt).toBeDefined();
  });

  it('updateResponse test', async () => {
    await listHandler(createTemplateEvent);
    await listHandler(createPageEvent);
    await handler(createFormEvent);
    await handler(createResponseEvent);
    const response = await handler(createMockEvent('updateResponse', updatedMockResponse));
    expect(response._id).toBeDefined();
    expect(response.formId.toString()).toBe(updatedMockResponse.formId);
    expect(response.parentId._id.toString()).toBe(updatedMockResponse.parentId);
    expect(response.values.length).toBe(updatedMockResponse.values.length);
    expect(response.values[0].field).toBe(updatedMockResponse.values[0].field);
    expect(response.values[0].itemId._id.toString()).toBe(updatedMockResponse.values[0].itemId);
    expect(response.createdBy._id).toMatchObject(mockUser._id);
    expect(response.createdAt).toBeDefined();
    expect(response.updatedAt).toBeDefined();
  });

  it('getResponse test', async () => {
    await listHandler(createTemplateEvent);
    await listHandler(createPageEvent);
    await handler(createFormEvent);
    await handler(createResponseEvent);
    const response = await handler(createMockEvent('getResponse', { _id: mockResponse._id }));
    expect(response._id).toBeDefined();
    expect(response.formId.toString()).toBe(mockResponse.formId);
    expect(response.parentId._id.toString()).toBe(mockResponse.parentId);
    expect(response.values.length).toBe(mockResponse.values.length);
    expect(response.values[0].field).toBe(mockResponse.values[0].field);
    expect(response.values[0].itemId._id.toString()).toBe(mockResponse.values[0].itemId);
    expect(response.createdBy._id).toMatchObject(mockUser._id);
    expect(response.createdAt).toBeDefined();
    expect(response.updatedAt).toBeDefined();
  });

  it('getResponses test', async () => {
    await listHandler(createTemplateEvent);
    await listHandler(createPageEvent);
    await handler(createFormEvent);
    await handler(createResponseEvent);
    const responses = await handler(
      createMockEvent('getResponses', { formId: mockResponse.formId }),
    );
    expect(responses.data.length).toBe(1);
    expect(responses.count).toBe(1);
    const response = responses.data[0];
    expect(response._id).toBeDefined();
    expect(response.formId.toString()).toBe(mockResponse.formId);
    expect(response.parentId._id.toString()).toBe(mockResponse.parentId);
    expect(response.values.length).toBe(mockResponse.values.length);
    expect(response.values[0].field).toBe(mockResponse.values[0].field);
    expect(response.values[0].itemId._id.toString()).toBe(mockResponse.values[0].itemId);
    expect(response.createdBy._id).toMatchObject(mockUser._id);
    expect(response.createdAt).toBeDefined();
    expect(response.updatedAt).toBeDefined();
  });

  it('getMyResponses test', async () => {
    await listHandler(createTemplateEvent);
    await listHandler(createPageEvent);
    await handler(createFormEvent);
    await handler(createResponseEvent);
    const responses = await handler(createMockEvent('getMyResponses'));
    expect(responses.data.length).toBe(1);
    expect(responses.count).toBe(1);
    const response = responses.data[0];
    expect(response._id).toBeDefined();
    expect(response.parentId._id.toString()).toBe(mockResponse.parentId);
    expect(response.values.length).toBe(mockResponse.values.length);
    expect(response.values[0].field).toBe(mockResponse.values[0].field);
    expect(response.values[0].itemId._id.toString()).toBe(mockResponse.values[0].itemId);
    expect(response.createdBy._id).toMatchObject(mockUser._id);
    expect(response.createdAt).toBeDefined();
    expect(response.updatedAt).toBeDefined();
  });

  it('deleteResponse test', async () => {
    await listHandler(createTemplateEvent);
    await listHandler(createPageEvent);
    await handler(createFormEvent);
    await handler(createResponseEvent);
    const responseId = await handler(createMockEvent('deleteResponse', { _id: mockResponse._id }));
    expect(responseId.toString()).toBe(mockResponse._id);
  });

  it('getSection test', async () => {
    await listHandler(createTemplateEvent);
    await listHandler(createPageEvent);
    const form = await handler(createFormEvent);
    const section = await handler(createMockEvent('getSection', { _id: form._id }));
    console.log({ section });
    // expect(responseId.toString()).toBe(mockResponse._id);
  });

  it('updateSection test', async () => {
    await listHandler(createTemplateEvent);
    await listHandler(createPageEvent);
    const form = await handler(createFormEvent);
    const section = await handler(createMockEvent('updateSection', { _id: form._id }));
    console.log({ section });
    // expect(responseId.toString()).toBe(mockResponse._id);
  });
});
