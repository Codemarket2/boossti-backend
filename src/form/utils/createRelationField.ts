import { IField } from '../types/form';
import { FormModel } from './formModel';

export const createRelationField = async (session, updatedForm, setForm) => {
  const form = { ...updatedForm.toJSON() };
  const childFields: IField[] = [];
  const newFields = form?.fields?.map((field) => {
    if (
      field?.options?.createRelationField ||
      field?.options?.updateRelationField ||
      field?.options?.deleteRelationField
    ) {
      childFields.push(JSON.parse(JSON.stringify(field)));
      const newField = { ...field };
      delete newField?.options?.createRelationField;
      delete newField?.options?.updateRelationField;
      delete newField?.options?.deleteRelationField;
      return newField;
    }
    return field;
  });
  if (childFields?.length > 0) {
    for (let i = 0; i < childFields.length; i++) {
      const field = childFields[i];
      if (field?.options?.createRelationField) {
        await FormModel.findOneAndUpdate(
          { _id: field?.form?._id },
          {
            $push: {
              fields: {
                label: `${form?.name}_parent`,
                fieldType: 'response',
                form: form?._id,
                options: { relationField: true, parentFormFieldId: field?._id },
              },
            },
          },
        ).session(session);
      } else if (field?.options?.deleteRelationField) {
        const childForm = await FormModel.findById(field?.options?.oldFormId).session(session);
        if (childForm?._id) {
          childForm.fields = childForm?.fields?.filter(
            (f) => f?.options?.parentFormFieldId?.toString() !== field?._id?.toString(),
          );
          await childForm.save();
        }
      } else if (field?.options?.updateRelationField) {
        const oldChildForm = await FormModel.findById(field?.options?.oldFormId).session(session);
        if (oldChildForm?._id) {
          oldChildForm.fields = oldChildForm?.fields?.filter(
            (f) => f?.options?.parentFormFieldId?.toString() !== field?._id?.toString(),
          );
          await oldChildForm.save();
        }
        await FormModel.findOneAndUpdate(
          { _id: field?.form?._id },
          {
            $push: {
              fields: {
                label: `${form?.name}_parent`,
                fieldType: 'response',
                form: form?._id,
                options: { relationField: true, parentFormFieldId: field?._id },
              },
            },
          },
        ).session(session);
      }
    }
    await FormModel.findOneAndUpdate(
      { _id: updatedForm?._id },
      {
        fields: newFields,
      },
    ).session(session);
    form.fields = newFields;
  }
  setForm(form);
};
