import { Schema, model, Model, Document } from 'mongoose';

export interface IListtype extends Document {
  name: string;
  description: string;
  media: [{ url: string; caption: string }];
  active: boolean;
  inUse: boolean;
  createdBy: Schema.Types.ObjectId;
  updatedBy?: Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ListTypeSchema = new Schema(
  {
    name: String,
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

const ListType: Model<IListtype> = model('ListType', ListTypeSchema);

export default ListType;
