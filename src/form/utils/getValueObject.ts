import { IField } from '../types/form';
import { IValue } from '../types/response';
import { Schema } from 'mongoose';
const defaultValue: IValue = {
  value: '',
  valueBoolean: null,
  valueDate: null,
  media: [],
  values: [],
  template: null,
  page: null,
  form: null,
  response: null,
  options: { option: false },
  field: '',
  valueNumber: null,
  _id: null,
};
export const getValueObject = (stringValue: any, field: IField, fields: string) => {
  const valueObject = { ...defaultValue };
  const id = field?._id;
  valueObject._id = id;
  valueObject.field = fields;

  if (field?.fieldType === 'number') {
    valueObject.valueNumber = Number(stringValue);
  } else if (field?.fieldType === 'boolean') {
    valueObject.valueBoolean = stringValue;
  } else if (field?.fieldType == 'phoneNumber') {
    valueObject.valueNumber = Number(stringValue);
  } else {
    valueObject.value = stringValue;
  }

  // you can do this for all the types
  return valueObject;
};
