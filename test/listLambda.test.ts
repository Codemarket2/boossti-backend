import '../jest/jestSetup';
import { handler } from '../src/list';
import { mockUserId, createMockEvent } from '../jest/defaultArguments';

const mockList = {
  name: 'Doctors',
  items: [
    {
      title: 'Foluso Ademuyiwa, MD, MPH',
      description: 'Washington University, St. Louis',
    },
  ],
};

const updatedMockList = {
  ...mockList,
  name: 'Hospitals',
};

const addListItemPayload = {
  title: 'José Baselga, MD, PhD',
  description: 'Memorial Sloan Kettering Cancer Center, New York',
};

const updateListItemPayload = {
  title: 'José Baselga, MD, PhD',
  description: 'Memorial Sloan Kettering Cancer Center, New York',
};

const getListsEvent = createMockEvent('getLists');
const createListEvent = createMockEvent('createList', mockList);

describe('Admin List Lambda Tests', () => {
  it('getLists test', async () => {
    const res = await handler(getListsEvent);
    expect(res.count).toBe(0);
    expect(res.data.length).toBe(0);
  });

  it('createUser test', async () => {
    const newList = await handler(createListEvent);
    expect(newList._id).toBeDefined();
    expect(newList.name).toBe(mockList.name);
    expect(newList.active).toBe(true);
    expect(newList.inUse).toBe(false);
    expect(newList.createdBy).toBe(mockUserId);
    expect(newList.items[0]._id).toBeDefined();
    expect(newList.items[0].title).toBe(mockList.items[0].title);
    expect(newList.items[0].description).toBe(mockList.items[0].description);
    expect(newList.items[0].active).toBe(true);
  });

  it('getList test', async () => {
    const newList = await handler(createListEvent);
    const list = await handler(
      createMockEvent('getList', { _id: newList._id })
    );
    expect(list._id).toBeDefined();
    expect(list.name).toBe(mockList.name);
    expect(list.active).toBe(true);
    expect(list.inUse).toBe(false);
    expect(list.createdBy).toBe(mockUserId);
    expect(list.items[0]._id).toBeDefined();
    expect(list.items[0].title).toBe(mockList.items[0].title);
    expect(list.items[0].description).toBe(mockList.items[0].description);
    expect(list.items[0].active).toBe(true);
  });

  it('updateList test', async () => {
    const newList = await handler(createListEvent);
    const list = await handler(
      createMockEvent('updateList', {
        ...updatedMockList,
        _id: newList._id,
      })
    );
    expect(list._id).toBeDefined();
    expect(list.name).toBe(updatedMockList.name);
    expect(list.active).toBe(true);
    expect(list.inUse).toBe(false);
    expect(list.createdBy).toBe(mockUserId);
    expect(list.items[0]._id).toBeDefined();
    expect(list.items[0].title).toBe(updatedMockList.items[0].title);
    expect(list.items[0].description).toBe(
      updatedMockList.items[0].description
    );
    expect(list.items[0].active).toBe(true);
  });

  it('deleteList test', async () => {
    const newList = await handler(createListEvent);
    const res = await handler(
      createMockEvent('deleteList', {
        _id: newList._id,
      })
    );
    expect(res).toBe(true);
  });

  it('addListItem test', async () => {
    const newList = await handler(createListEvent);
    const list = await handler(
      createMockEvent('addListItem', {
        ...addListItemPayload,
        listId: newList._id,
      })
    );
    expect(list._id).toBeDefined();
    expect(list.name).toBe(mockList.name);
    expect(list.active).toBe(true);
    expect(list.inUse).toBe(false);
    expect(list.createdBy).toBe(mockUserId);
    expect(list.items[0]._id).toBeDefined();
    expect(list.items[0].title).toBe(mockList.items[0].title);
    expect(list.items[0].description).toBe(mockList.items[0].description);
    expect(list.items[0].active).toBe(true);
    expect(list.items[1]._id).toBeDefined();
    expect(list.items[1].title).toBe(addListItemPayload.title);
    expect(list.items[1].description).toBe(addListItemPayload.description);
    expect(list.items[1].active).toBe(true);
  });

  it('updateListItem test', async () => {
    const newList = await handler(createListEvent);
    const list = await handler(
      createMockEvent('updateListItem', {
        ...updateListItemPayload,
        listId: newList._id,
        _id: newList.items[0]._id,
      })
    );
    expect(list._id).toBeDefined();
    expect(list.name).toBe(mockList.name);
    expect(list.active).toBe(true);
    expect(list.inUse).toBe(false);
    expect(list.createdBy).toBe(mockUserId);
    expect(list.items[0]._id).toBeDefined();
    expect(list.items[0].title).toBe(updateListItemPayload.title);
    expect(list.items[0].description).toBe(updateListItemPayload.description);
    expect(list.items[0].active).toBe(true);
  });

  it('deleteListItem test', async () => {
    const newList = await handler(createListEvent);
    const res = await handler(
      createMockEvent('deleteListItem', {
        listId: newList._id,
        _id: newList.items[0]._id,
      })
    );
    expect(res).toBe(true);
  });
});
