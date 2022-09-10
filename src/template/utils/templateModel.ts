import { Schema, model } from 'mongoose';
import { ISchema, IMedia } from '../../utils/customTypes';
import { fieldSchema, fieldsPopulate } from '../../form/utils/formModel';
import { userPopulate } from '../../utils/populate';
import { extendSchema } from '../../utils/extendSchema';
import { IField } from '../../form/types/form';

export interface ITemplate extends ISchema {
  title: string;
  slug: string;
  description: string;
  media: IMedia[];
  active: boolean;
  inUse: boolean;
  showInMenu: boolean;
  count: number;
  fields: IField[];
  options: any;
}

const templateSchema = extendSchema({
  title: String,
  slug: { type: String, unique: true, required: true },
  count: { type: Number, unique: true, required: true },
  description: String,
  media: {
    type: [{ url: String, caption: String }],
    default: [],
  },
  fields: { type: [fieldSchema], default: [] },
  active: {
    type: Boolean,
    default: true,
  },
  inUse: {
    type: Boolean,
    default: false,
  },
  showInMenu: {
    type: Boolean,
    default: false,
  },
  options: {
    type: Schema.Types.Mixed,
    default: { option: false },
  },
});

const Template = model<ITemplate>('Template', templateSchema);

export const templatePopulate = [userPopulate, ...fieldsPopulate];

export default Template;
