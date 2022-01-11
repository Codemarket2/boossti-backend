import { Schema, model } from 'mongoose';
import { ISchema } from '../../utils/cutomTypes';

interface IField extends ISchema {
  label: string;
  multipleValues: boolean;
  oneUserMultipleValues: boolean;
  fieldType: string;
  typeId: string;
  position: number;
}

const fieldSchema = new Schema<IField>(
  {
    position: { type: Number, required: true },
    parentId: {
      type: Schema.Types.ObjectId,
      ref: 'ListType',
      required: true,
    },
    relationId: {
      type: Schema.Types.ObjectId,
      ref: 'Field',
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
    options: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true },
);

fieldSchema.index({ parentId: 1, label: 1 }, { unique: true });

const Field = model<IField>('Field', fieldSchema);

export default Field;
