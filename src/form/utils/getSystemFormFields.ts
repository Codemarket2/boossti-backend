import { getFieldByLabel } from '../permission/fieldHelper';
import { ISystemForm } from '../permission/systemFormsConfig';
import { IForm } from '../types/form';

export const getSystemFormFields = (systemFormStructure: ISystemForm, formObject: IForm) => {
  const fields = {};
  Object?.keys(systemFormStructure?.fields || {})?.forEach((key) => {
    const fieldLabel = systemFormStructure?.fields?.[key];
    const field = getFieldByLabel(fieldLabel, formObject?.fields);
    if (fieldLabel && field?._id) {
      fields[fieldLabel] = field;
    }
  });
  return fields;
};
