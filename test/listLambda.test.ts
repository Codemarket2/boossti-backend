import '../jest/jestSetup';
import { handler } from '../src/list';
import { mockUser, createMockEvent } from '../jest/defaultArguments';

const mockListType = {
  _id: '60fc4d29f11b170008d9ec48',
  name: 'Doctors',
  media: [],
};
const updatedMockListType = {
  ...mockListType,
  name: 'Hospital',
};

const mockListItem = {
  _id: '60fc4d29f11b170008d9ec46',
  types: ['60fc4d29f11b170008d9ec48'],
  title: 'Dr John',
  description: 'NYC',
  media: [],
};
const updatedMockListItem = {
  ...mockListItem,
  title: 'Health Center',
};

const createListTypeEvent = createMockEvent('createListType', mockListType);
const createListItemEvent = createMockEvent('createListItem', mockListItem);

describe('List Lambda Tests', () => {
  it('getListTypes test', async () => {
    const res = await handler(createMockEvent('getListTypes'));
    expect(res.count).toBe(0);
    expect(res.data.length).toBe(0);
  });

  it('getListItems test', async () => {
    await handler(createListTypeEvent);
    await handler(createListItemEvent);
    let res = await handler(createMockEvent('getListItems'));
    expect(res.count).toBe(1);
    expect(res.data.length).toBe(1);
    res = await handler(
      createMockEvent('getListItems', { types: [mockListType._id] })
    );
    expect(res.count).toBe(1);
    expect(res.data.length).toBe(1);
    const item = res.data[0];
    expect(item._id).toBeDefined();
    expect(item.title).toBe(mockListItem.title);
    expect(item.description).toBe(mockListItem.description);
    expect(item.types[0]._id.toString()).toBe(mockListType._id);
    expect(item.createdBy).toMatchObject(mockUser._id);
    expect(item.createdAt).toBeDefined();
    expect(item.updatedAt).toBeDefined();
  });

  it('getList test', async () => {
    await handler(createListTypeEvent);
    await handler(createListItemEvent);
    const listType = await handler(
      createMockEvent('getList', { _id: mockListType._id })
    );

    expect(listType._id).toBeDefined();
    expect(listType.name).toBe(mockListType.name);
    expect(listType.createdBy).toMatchObject(mockUser._id);
    expect(listType.createdAt).toBeDefined();
    expect(listType.updatedAt).toBeDefined();
    const listItem = await handler(
      createMockEvent('getList', { _id: mockListItem._id })
    );

    expect(listItem._id).toBeDefined();
    expect(listItem.title).toBe(mockListItem.title);
    expect(listItem.description).toBe(mockListItem.description);
    expect(listItem.types[0]._id.toString()).toBe(mockListType._id);
    expect(listItem.createdBy).toMatchObject(mockUser._id);
    expect(listItem.createdAt).toBeDefined();
    expect(listItem.updatedAt).toBeDefined();
  });

  it('createListType test', async () => {
    const listType = await handler(createListTypeEvent);
    expect(listType._id).toBeDefined();
    expect(listType.name).toBe(mockListType.name);
    expect(listType.createdBy).toMatchObject(mockUser._id);
    expect(listType.createdAt).toBeDefined();
    expect(listType.updatedAt).toBeDefined();
  });

  it('createListItem test', async () => {
    await handler(createListTypeEvent);
    const listItem = await handler(createListItemEvent);
    // console.log('listItem', listItem);
    expect(listItem._id).toBeDefined();
    expect(listItem.title).toBe(mockListItem.title);
    expect(listItem.description).toBe(mockListItem.description);
    expect(listItem.types[0]._id.toString()).toBe(mockListType._id);
    expect(listItem.createdBy).toMatchObject(mockUser._id);
    expect(listItem.createdAt).toBeDefined();
    expect(listItem.updatedAt).toBeDefined();
  });

  it('updateListType test', async () => {
    await handler(createListTypeEvent);
    const listType = await handler(
      createMockEvent('updateListType', updatedMockListType)
    );
    expect(listType._id).toBeDefined();
    expect(listType.name).toBe(updatedMockListType.name);
    expect(listType.createdBy).toMatchObject(mockUser._id);
    expect(listType.createdAt).toBeDefined();
    expect(listType.updatedAt).toBeDefined();
  });

  it('updateListItem test', async () => {
    await handler(createListTypeEvent);
    await handler(createListItemEvent);
    const listItem = await handler(
      createMockEvent('updateListItem', updatedMockListItem)
    );
    expect(listItem._id).toBeDefined();
    expect(listItem.title).toBe(updatedMockListItem.title);
    expect(listItem.description).toBe(updatedMockListItem.description);
    expect(listItem.types[0]._id.toString()).toBe(mockListType._id);
    expect(listItem.createdBy).toMatchObject(mockUser._id);
    expect(listItem.createdAt).toBeDefined();
    expect(listItem.updatedAt).toBeDefined();
  });

  it('deleteListType test', async () => {
    await handler(createListTypeEvent);
    const res = await handler(
      createMockEvent('deleteListType', { _id: mockListType._id })
    );
    expect(res).toBe(true);
  });

  it('deleteListItem test', async () => {
    await handler(createListTypeEvent);
    await handler(createListItemEvent);
    const res = await handler(
      createMockEvent('deleteListItem', { _id: mockListItem._id })
    );
    expect(res).toBe(true);
  });
});
