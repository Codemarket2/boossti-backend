import { Schema, model } from 'mongoose';
import { ISchema } from '../../utils/cutomTypes';

interface IFieldValue extends ISchema {
  field: string;
  parentId: string;
  value: string;
  valueNumber: number;
  valueBoolean: boolean;
  valueDate: Date;
  itemId: string;
  relationId: string;
}

const fieldValueSchema = new Schema<IFieldValue>(
  {
    parentId: {
      type: Schema.Types.ObjectId,
      ref: 'ListItem',
      required: true,
    },
    relationId: { type: Schema.Types.ObjectId },
    field: {
      type: Schema.Types.ObjectId,
      ref: 'Field',
      required: true,
    },
    value: { type: String },
    valueDate: Date,
    valueNumber: Number,
    valueBoolean: Boolean,
    media: {
      type: [{ url: String, caption: String }],
      default: [],
    },
    itemId: {
      type: Schema.Types.ObjectId,
      ref: 'ListItem',
    },
    active: {
      type: Boolean,
      default: true,
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

const FieldValue = model<IFieldValue>('FieldValue', fieldValueSchema);

export default FieldValue;
