import { Schema, model } from 'mongoose';
import { ISchema } from '../../utils/cutomTypes';

export interface IResponse extends ISchema {
  formId: string;
  values: [IValue];
}

export interface IValue {
  field: string;
  value: string;
  valueNumber: number;
  valueBoolean: boolean;
  valueDate: Date;
  itemId: string;
}

const valueSchema = new Schema({
  field: {
    type: String,
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
});

const responseSchema = new Schema<IResponse>(
  {
    formId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    parentId: {
      type: Schema.Types.ObjectId,
      ref: 'ListItem',
    },
    values: [valueSchema],
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

export const ResponseModel = model<IResponse>('Response', responseSchema);
