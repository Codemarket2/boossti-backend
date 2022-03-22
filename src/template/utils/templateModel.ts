import { Schema, model } from 'mongoose';
import { ISchema, IMedia } from '../../utils/cutomTypes';
import { fieldSchema } from '../../form/utils/formModel';

export interface ITemplate extends ISchema {
  title: string;
  description: string;
  media: [IMedia];
  active: boolean;
  inUse: boolean;
  showInMenu: boolean;
}

const templateSchema = new Schema<ITemplate>(
  {
    title: String,
    slug: { type: String, unique: true, required: true },
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

const Template = model<ITemplate>('Template', templateSchema);

export default Template;
