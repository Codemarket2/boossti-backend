import { Schema, model, Model } from 'mongoose';
import { ISchema } from '../../utils/cutomTypes';

interface IField extends ISchema {
  label: string;
  multipleValues: boolean;
  oneUserMultipleValues: boolean;
  fieldType: string;
  typeId: string;
  position: number;
}

const FieldSchema = new Schema(
  {
    position: { type: Number, required: true },
    parentId: {
      type: Schema.Types.ObjectId,
      ref: 'ListType',
      required: true,
    },
    label: { type: String, required: true },
    fieldType: { type: String, required: true },
    typeId: {
      type: Schema.Types.ObjectId,
      ref: 'ListType',
    },
    multipleValues: {
      type: Boolean,
      default: true,
    },
    oneUserMultipleValues: {
      type: Boolean,
      default: true,
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

FieldSchema.index({ parentId: 1, label: 1 }, { unique: true });

const Field: Model<IField> = model('Field', FieldSchema);

export default Field;
