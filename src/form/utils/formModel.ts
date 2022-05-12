import { Schema, model } from 'mongoose';
import { ISchema } from '../../utils/cutomTypes';
import { userPopulate } from '../../utils/populate';
import { extendSchema } from '../../utils/extendSchema';

export interface IForm extends ISchema {
  parentId: string;
  name: string;
  slug: string;
  fields: [IField];
  settings: any;
  published: boolean;
}

export interface IField {
  _id: string;
  label: string;
  fieldType: string;
  options: any;
  template: any;
  form: any;
}

export const fieldSchema = new Schema({
  label: { type: String, required: true },
  fieldType: { type: String, required: true },
  template: {
    type: Schema.Types.ObjectId,
    ref: 'Template',
  },
  options: {
    type: Schema.Types.Mixed,
    default: { mutipleValues: false },
  },
  form: {
    type: Schema.Types.ObjectId,
    ref: 'Form',
  },
});

const formSchema = extendSchema({
  parentId: {
    type: Schema.Types.ObjectId,
  },
  name: { type: String, unique: true },
  slug: { type: String },
  fields: [fieldSchema],
  settings: {
    type: Schema.Types.Mixed,
    default: { mutipleResponses: false },
  },
  published: {
    type: Boolean,
    default: false,
  },
  virtualForm: {
    type: Boolean,
    default: false,
  },
});

export const FormModel = model<IForm>('Form', formSchema);

export const fieldsPopulate = [
  {
    path: 'fields.template',
    select: 'title description media slug',
  },
  {
    path: 'fields.form',
    select: 'name',
  },
];

export const formPopulate = [userPopulate, ...fieldsPopulate];
