import { Schema, model } from 'mongoose';
import { ISchema, IMedia } from '../../utils/cutomTypes';
import { fieldSchema, fieldsPopulate, IField } from '../../form/utils/formModel';
import { valueSchema, IValue, valuesPopulate } from '../../form/utils/responseModel';
import { userPopulate } from '../../utils/populate';

export interface IPage extends ISchema {
  template: string;
  title: string;
  slug: string;
  description: string;
  media: IMedia[];
  fields: IField[];
  active: boolean;
  values: IValue[];
  authenticateUser: boolean;
  options: any;
}

const pageSchema = new Schema<IPage>(
  {
    template: { type: Schema.Types.ObjectId, ref: 'Template' },
    title: String,
    slug: { type: String, unique: true, required: true },
    description: String,
    media: {
      type: [{ url: String, caption: String }],
      default: [],
    },
    fields: { type: [fieldSchema], default: [] },
    values: { type: [valueSchema], default: [] },
    active: {
      type: Boolean,
      default: false,
    },
    authenticateUser: {
      type: Boolean,
      default: false,
    },
    options: {
      type: Schema.Types.Mixed,
      default: { option: false },
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true },
);

const Page = model<IPage>('Page', pageSchema);

export default Page;

export const pagePopulate = [
  userPopulate,
  { path: 'template', select: 'title slug' },
  ...fieldsPopulate,
  ...valuesPopulate,
];
