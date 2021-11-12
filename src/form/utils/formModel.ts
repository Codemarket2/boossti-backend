import { Schema, model } from 'mongoose';
import { ISchema } from '../../utils/cutomTypes';

export interface IForm extends ISchema {
  parentId: string;
  name: string;
  fields: [IField];
  settings: any;
  published: boolean;
}

interface IField {
  label: string;
  fieldType: string;
  typeId: any;
  options: any;
}

const fieldSchema = new Schema({
  label: { type: String, required: true },
  fieldType: { type: String, required: true },
  typeId: {
    type: Schema.Types.ObjectId,
    ref: 'ListType',
  },
  options: Schema.Types.Mixed,
});

const formSchema = new Schema<IForm>(
  {
    parentId: {
      type: Schema.Types.ObjectId,
    },
    name: { type: String, required: true },
    fields: [fieldSchema],
    settings: Schema.Types.Mixed,
    published: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true },
);

export const FormModel = model<IForm>('Form', formSchema);
