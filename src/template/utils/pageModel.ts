import { Schema, model } from 'mongoose';
import { ISchema, IMedia } from '../../utils/customTypes';
import { fieldSchema, fieldsPopulate } from '../../form/utils/formModel';
import { valueSchema, valuesPopulate } from '../../form/utils/responseModel';
import { userPopulate } from '../../utils/populate';
import { IField } from '../../form/utils/formType';
import { IValue } from '../../form/utils/responseType';

export interface IPage extends ISchema {
  template: Schema.Types.ObjectId;
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
