import ListType from '../src/list/utils/listTypeModel';
import Field from '../src/field/utils/fieldModel';

// await Field.updateMany({}, { position: 1 });

export const updatAllFieldPosition = async () => {
  const listTypes = await ListType.find();
  console.log('listTypes.length', listTypes.length);
  listTypes.forEach(async (listType, i) => {
    await updatePosition(listType._id);
  });
};

const updatePosition = async (parentId) => {
  const fields = await Field.find({ parentId });
  fields.forEach(async (field, i) => {
    console.log(`${i}) ${field.label} - ${i + 1}`);
    await Field.findByIdAndUpdate(field._id, { position: i + 1 });
  });
};
