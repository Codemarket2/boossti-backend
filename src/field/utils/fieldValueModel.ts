import { Schema, model, Model } from 'mongoose';
import { ISchema } from '../../utils/cutomTypes';

interface IFieldValue extends ISchema {
  field: string;
  value: string;
  itemId: string;
}

const FieldValueSchema = new Schema(
  {
    field: {
      type: Schema.Types.ObjectId,
      ref: 'Field',
      required: true,
    },
    value: { type: String },
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
  { timestamps: true }
);

const FieldValue: Model<IFieldValue> = model('FieldValue', FieldValueSchema);

export default FieldValue;
