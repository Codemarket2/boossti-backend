import { Schema, model, Model } from 'mongoose';
import { ISchema, IMedia } from '../../utils/cutomTypes';

export interface IListtype extends ISchema {
  title: string;
  description: string;
  media: [IMedia];
  active: boolean;
  inUse: boolean;
}

const ListTypeSchema = new Schema(
  {
    title: { type: String, unique: true },
    slug: String,
    description: String,
    media: {
      type: [{ url: String, caption: String }],
      default: [],
    },
    active: {
      type: Boolean,
      default: true,
    },
    inUse: {
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
  { timestamps: true }
);

ListTypeSchema.index({ slug: 1 });

const ListType: Model<IListtype> = model('ListType', ListTypeSchema);

export default ListType;
