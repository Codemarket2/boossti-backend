import { Schema, model } from 'mongoose';
import { ISchema, IMedia } from '../../utils/cutomTypes';
import { fieldSchema } from '../../form/utils/formModel';

export interface IListType extends ISchema {
  title: string;
  description: string;
  media: [IMedia];
  active: boolean;
  inUse: boolean;
  showInMenu: boolean;
}

const listTypeSchema = new Schema<IListType>(
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

const ListType = model<IListType>('ListType', listTypeSchema);

export default ListType;
