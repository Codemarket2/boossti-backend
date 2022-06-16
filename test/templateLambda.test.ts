import '../jest/jestSetup';
import { handler } from '../src/template';
import { mockUser, createMockEvent } from '../jest/defaultArguments';

export const mockTemplate = {
  _id: '60fc4d29f11b170008d9ec48',
  title: 'Doctors',
  media: [],
};
const updatedMockTemplate = {
  ...mockTemplate,
  title: 'Hospital',
};

const mockTemplateInstance = {
  _id: '60fc4d29f11b170008d9ec46',
  template: '60fc4d29f11b170008d9ec48',
  title: 'Dr John',
  description: 'NYC',
  media: [],
};
const updatedMockTemplateInstance = {
  ...mockTemplateInstance,
  title: 'Health Center',
};

const createTemplateEvent = createMockEvent('createTemplate', mockTemplate);
const createTemplateInstanceEvent = createMockEvent('createTemplateInstance', mockTemplateInstance);

describe('List Lambda Tests', () => {
  it('getTemplates test', async () => {
    const res = await handler(createMockEvent('getTemplates'));
    expect(res.count).toBe(0);
    expect(res.data.length).toBe(0);
  });

  it('getTemplate test', async () => {
    await handler(createTemplateEvent);
    const template = await handler(createMockEvent('getTemplate', { _id: mockTemplate._id }));
    expect(template._id).toBeDefined();
    expect(template.title).toBe(mockTemplate.title);
    expect(template.createdBy._id?.toString()).toStrictEqual(mockUser._id);
    expect(template.createdAt).toBeDefined();
    expect(template.updatedAt).toBeDefined();
  });

  it('getTemplateBySlug test', async () => {
    await handler(createTemplateEvent);
    const template = await handler(
      createMockEvent('getTemplateBySlug', {
        slug: 'doctors',
      }),
    );
    expect(template._id).toBeDefined();
    expect(template.title).toBe(mockTemplate.title);
    expect(template.createdBy._id?.toString()).toStrictEqual(mockUser._id);
    expect(template.createdAt).toBeDefined();
    expect(template.updatedAt).toBeDefined();
  });

  it('createTemplate test', async () => {
    const template = await handler(createTemplateEvent);
    expect(template._id).toBeDefined();
    expect(template.title).toBe(mockTemplate.title);
    expect(template.createdBy._id?.toString()).toStrictEqual(mockUser._id);
    expect(template.createdAt).toBeDefined();
    expect(template.updatedAt).toBeDefined();
  });

  it('updateTemplate test', async () => {
    await handler(createTemplateEvent);
    const template = await handler(createMockEvent('updateTemplate', updatedMockTemplate));
    expect(template._id).toBeDefined();
    expect(template.title).toBe(updatedMockTemplate.title);
    expect(template.createdBy._id?.toString()).toStrictEqual(mockUser._id);
    expect(template.createdAt).toBeDefined();
    expect(template.updatedAt).toBeDefined();
  });

  it('deleteTemplate test', async () => {
    await handler(createTemplateEvent);
    const res = await handler(createMockEvent('deleteTemplate', { _id: mockTemplate._id }));
    expect(res).toBe(mockTemplate._id);
  });

  it('getTemplateInstances test', async () => {
    await handler(createTemplateEvent);
    await handler(createTemplateInstanceEvent);
    let res = await handler(createMockEvent('getTemplateInstances'));
    expect(res.count).toBe(1);
    expect(res.data.length).toBe(1);
    res = await handler(createMockEvent('getTemplateInstances', { template: [mockTemplate._id] }));
    expect(res.count).toBe(1);
    expect(res.data.length).toBe(1);
    const item = res.data[0];
    expect(item._id).toBeDefined();
    // expect(item.title).toBe(mockTemplateInstance.title);
    // expect(item.description).toBe(mockTemplateInstance.description);
    expect(item.template._id.toString()).toBe(mockTemplate._id);
    expect(item.createdBy._id?.toString()).toStrictEqual(mockUser._id);
    expect(item.createdAt).toBeDefined();
    expect(item.updatedAt).toBeDefined();
  });

  it('getTemplateInstance test', async () => {
    await handler(createTemplateEvent);
    await handler(createTemplateInstanceEvent);
    const templateInstance = await handler(
      createMockEvent('getTemplateInstance', { _id: mockTemplateInstance._id }),
    );
    expect(templateInstance._id).toBeDefined();
    // expect(templateInstance.title).toBe(mockTemplateInstance.title);
    // expect(templateInstance.description).toBe(mockTemplateInstance.description);
    expect(templateInstance.template._id.toString()).toBe(mockTemplate._id);
    expect(templateInstance.createdBy._id?.toString()).toStrictEqual(mockUser._id);
    expect(templateInstance.createdAt).toBeDefined();
    expect(templateInstance.updatedAt).toBeDefined();
  });

  it('getTemplateInstanceBySlug test', async () => {
    await handler(createTemplateEvent);
    await handler(createTemplateInstanceEvent);
    const templateInstance = await handler(
      createMockEvent('getTemplateInstanceBySlug', {
        slug: 'dr-john',
      }),
    );
    // console.log('templateInstance', templateInstance);
    expect(templateInstance._id).toBeDefined();
    // expect(templateInstance.title).toBe(mockTemplateInstance.title);
    // expect(templateInstance.description).toBe(mockTemplateInstance.description);
    expect(templateInstance.template._id.toString()).toBe(mockTemplate._id);
    expect(templateInstance.createdBy._id?.toString()).toStrictEqual(mockUser._id);
    expect(templateInstance.createdAt).toBeDefined();
    expect(templateInstance.updatedAt).toBeDefined();
  });

  it('createTemplateInstance test', async () => {
    await handler(createTemplateEvent);
    const templateInstance = await handler(createTemplateInstanceEvent);
    // console.log('templateInstance', templateInstance);
    expect(templateInstance._id).toBeDefined();
    // expect(templateInstance.title).toBe(mockTemplateInstance.title);
    // expect(templateInstance.description).toBe(mockTemplateInstance.description);
    expect(templateInstance.template._id.toString()).toBe(mockTemplate._id);
    expect(templateInstance.createdBy._id?.toString()).toStrictEqual(mockUser._id);
    expect(templateInstance.createdAt).toBeDefined();
    expect(templateInstance.updatedAt).toBeDefined();
  });

  it('updateTemplateInstance test', async () => {
    await handler(createTemplateEvent);
    await handler(createTemplateInstanceEvent);
    const templateInstance = await handler(
      createMockEvent('updateTemplateInstance', updatedMockTemplateInstance),
    );
    expect(templateInstance._id).toBeDefined();
    // expect(templateInstance.title).toBe(updatedMockTemplateInstance.title);
    // expect(templateInstance.description).toBe(updatedMockTemplateInstance.description);
    expect(templateInstance.template._id.toString()).toBe(mockTemplate._id);
    expect(templateInstance.createdBy._id?.toString()).toStrictEqual(mockUser._id);
    expect(templateInstance.createdAt).toBeDefined();
    expect(templateInstance.updatedAt).toBeDefined();
  });

  it('deleteTemplateInstance test', async () => {
    await handler(createTemplateEvent);
    await handler(createTemplateInstanceEvent);
    const res = await handler(
      createMockEvent('deleteTemplateInstance', { _id: mockTemplateInstance._id }),
    );
    expect(res).toBe(mockTemplateInstance._id);
  });
});
