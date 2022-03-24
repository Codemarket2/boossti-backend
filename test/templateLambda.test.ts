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

const mockPage = {
  _id: '60fc4d29f11b170008d9ec46',
  template: '60fc4d29f11b170008d9ec48',
  title: 'Dr John',
  description: 'NYC',
  media: [],
};
const updatedMockPage = {
  ...mockPage,
  title: 'Health Center',
};

const createTemplateEvent = createMockEvent('createTemplate', mockTemplate);
const createPageEvent = createMockEvent('createPage', mockPage);

describe('List Lambda Tests', () => {
  it('getTemplates test', async () => {
    const res = await handler(createMockEvent('getTemplates'));
    expect(res.count).toBe(0);
    expect(res.data.length).toBe(0);
  });

  it('getPages test', async () => {
    await handler(createTemplateEvent);
    await handler(createPageEvent);
    let res = await handler(createMockEvent('getPages'));
    expect(res.count).toBe(1);
    expect(res.data.length).toBe(1);
    res = await handler(createMockEvent('getPages', { template: [mockTemplate._id] }));
    expect(res.count).toBe(1);
    expect(res.data.length).toBe(1);
    const item = res.data[0];
    expect(item._id).toBeDefined();
    expect(item.title).toBe(mockPage.title);
    expect(item.description).toBe(mockPage.description);
    expect(item.template._id.toString()).toBe(mockTemplate._id);
    expect(item.createdBy._id).toMatchObject(mockUser._id);
    expect(item.createdAt).toBeDefined();
    expect(item.updatedAt).toBeDefined();
  });

  it('getTemplate test', async () => {
    await handler(createTemplateEvent);
    const template = await handler(createMockEvent('getTemplate', { _id: mockTemplate._id }));
    expect(template._id).toBeDefined();
    expect(template.title).toBe(mockTemplate.title);
    expect(template.createdBy._id).toMatchObject(mockUser._id);
    expect(template.createdAt).toBeDefined();
    expect(template.updatedAt).toBeDefined();
  });

  it('getPage test', async () => {
    await handler(createTemplateEvent);
    await handler(createPageEvent);
    const page = await handler(createMockEvent('getPage', { _id: mockPage._id }));
    expect(page._id).toBeDefined();
    expect(page.title).toBe(mockPage.title);
    expect(page.description).toBe(mockPage.description);
    expect(page.template._id.toString()).toBe(mockTemplate._id);
    expect(page.createdBy._id).toMatchObject(mockUser._id);
    expect(page.createdAt).toBeDefined();
    expect(page.updatedAt).toBeDefined();
  });

  it('getTemplateBySlug test', async () => {
    await handler(createTemplateEvent);
    const template = await handler(
      createMockEvent('getTemplateBySlug', {
        slug: 1,
      }),
    );
    expect(template._id).toBeDefined();
    expect(template.title).toBe(mockTemplate.title);
    expect(template.createdBy._id).toMatchObject(mockUser._id);
    expect(template.createdAt).toBeDefined();
    expect(template.updatedAt).toBeDefined();
  });

  it('getPageBySlug test', async () => {
    await handler(createTemplateEvent);
    await handler(createPageEvent);
    const page = await handler(
      createMockEvent('getPageBySlug', {
        slug: 'dr-john',
      }),
    );
    // console.log('page', page);
    expect(page._id).toBeDefined();
    expect(page.title).toBe(mockPage.title);
    expect(page.description).toBe(mockPage.description);
    expect(page.template._id.toString()).toBe(mockTemplate._id);
    expect(page.createdBy._id).toMatchObject(mockUser._id);
    expect(page.createdAt).toBeDefined();
    expect(page.updatedAt).toBeDefined();
  });

  it('createTemplate test', async () => {
    const template = await handler(createTemplateEvent);
    expect(template._id).toBeDefined();
    expect(template.title).toBe(mockTemplate.title);
    expect(template.createdBy._id).toMatchObject(mockUser._id);
    expect(template.createdAt).toBeDefined();
    expect(template.updatedAt).toBeDefined();
  });

  it('createPage test', async () => {
    await handler(createTemplateEvent);
    const page = await handler(createPageEvent);
    // console.log('page', page);
    expect(page._id).toBeDefined();
    expect(page.title).toBe(mockPage.title);
    expect(page.description).toBe(mockPage.description);
    expect(page.template._id.toString()).toBe(mockTemplate._id);
    expect(page.createdBy._id).toMatchObject(mockUser._id);
    expect(page.createdAt).toBeDefined();
    expect(page.updatedAt).toBeDefined();
  });

  it('updateTemplate test', async () => {
    await handler(createTemplateEvent);
    const template = await handler(createMockEvent('updateTemplate', updatedMockTemplate));
    expect(template._id).toBeDefined();
    expect(template.title).toBe(updatedMockTemplate.title);
    expect(template.createdBy._id).toMatchObject(mockUser._id);
    expect(template.createdAt).toBeDefined();
    expect(template.updatedAt).toBeDefined();
  });

  it('updatePage test', async () => {
    await handler(createTemplateEvent);
    await handler(createPageEvent);
    const page = await handler(createMockEvent('updatePage', updatedMockPage));
    expect(page._id).toBeDefined();
    expect(page.title).toBe(updatedMockPage.title);
    expect(page.description).toBe(updatedMockPage.description);
    expect(page.template._id.toString()).toBe(mockTemplate._id);
    expect(page.createdBy._id).toMatchObject(mockUser._id);
    expect(page.createdAt).toBeDefined();
    expect(page.updatedAt).toBeDefined();
  });

  it('deleteTemplate test', async () => {
    await handler(createTemplateEvent);
    const res = await handler(createMockEvent('deleteTemplate', { _id: mockTemplate._id }));
    expect(res).toBe(mockTemplate._id);
  });

  it('deletePage test', async () => {
    await handler(createTemplateEvent);
    await handler(createPageEvent);
    const res = await handler(createMockEvent('deletePage', { _id: mockPage._id }));
    expect(res).toBe(mockPage._id);
  });
});
