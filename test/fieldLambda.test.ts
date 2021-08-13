import '../jest/jestSetup';
import { handler } from '../src/field';
import { handler as lisHandler } from '../src/list';
import { createMockEvent, mockUser } from '../jest/defaultArguments';

export const mockListType = {
  _id: '60fc4d29f11b170008d9ec48',
  title: 'Doctors',
};

export const mockListType2 = {
  _id: '60fc4d29f11b170008d9ec46',
  title: 'Supplements',
};

const mockField = {
  _id: '60fc4d29f11b170008d9ec11',
  parentId: mockListType._id,
  label: 'Brand',
  multipleValues: true,
  fieldType: 'string',
  typeId: null,
};

const mockField2 = {
  ...mockField,
  label: 'Supplements',
  fieldType: 'type',
  typeId: mockListType2._id,
};

const updatedMockField = {
  ...mockField,
  label: 'Brand Name',
};

// yarn test test/fieldLambda.test.ts

const createFieldEvent = createMockEvent('createField', mockField);
const createListTypeEvent = createMockEvent('createListType', mockListType);

describe('Field Lambda Tests', () => {
  it('getFieldsByType test', async () => {
    await lisHandler(createListTypeEvent);
    await handler(createFieldEvent);
    const res = await handler(
      createMockEvent('getFieldsByType', { parentId: mockListType._id })
    );
    expect(res.count).toBe(1);
    expect(res.data.length).toBe(1);
    const field = res.data[0];
    expect(field._id).toBeDefined();
    expect(field.label).toBe(mockField.label);
    expect(field.fieldType).toBe(mockField.fieldType);
    expect(field.typeId).toBe(mockField.typeId);
    expect(field.multipleValues).toBe(mockField.multipleValues);
    expect(field.createdBy._id).toBeDefined();
    expect(field.createdBy.name).toBe(mockUser.name);
    expect(field.createdBy.picture).toBe(mockUser.picture);
  });
  it('createField test', async () => {
    await lisHandler(createListTypeEvent);
    await lisHandler(createMockEvent('createListType', mockListType2));
    const field = await handler(createMockEvent('createField', mockField2));
    expect(field._id).toBeDefined();
    expect(field.label).toBe(mockField2.label);
    expect(field.fieldType).toBe(mockField2.fieldType);
    expect(field.typeId._id).toBeDefined();
    expect(field.typeId.title).toBe(mockListType2.title);
    expect(field.multipleValues).toBe(mockField2.multipleValues);
    expect(field.createdBy._id).toBeDefined();
    expect(field.createdBy.name).toBe(mockUser.name);
    expect(field.createdBy.picture).toBe(mockUser.picture);
  });
  it('updateField test', async () => {
    await lisHandler(createListTypeEvent);
    await handler(createFieldEvent);
    const field = await handler(
      createMockEvent('updateField', updatedMockField)
    );
    expect(field._id).toBeDefined();
    expect(field.label).toBe(updatedMockField.label);
    expect(field.fieldType).toBe(updatedMockField.fieldType);
    expect(field.typeId).toBe(updatedMockField.typeId);
    expect(field.multipleValues).toBe(updatedMockField.multipleValues);
    expect(field.createdBy._id).toBeDefined();
    expect(field.createdBy.name).toBe(mockUser.name);
    expect(field.createdBy.picture).toBe(mockUser.picture);
  });
  it('deleteField test', async () => {
    await lisHandler(createListTypeEvent);
    await handler(createFieldEvent);
    const res = await handler(
      createMockEvent('deleteField', { _id: mockField._id })
    );
    expect(res).toBe(true);
  });
});
