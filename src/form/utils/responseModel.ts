import { Schema, model } from 'mongoose';
import { ISchema } from '../../utils/cutomTypes';

export interface IResponse extends ISchema {
  formId: any;
  parentId: string[];
  count: number;
  values: [IValue];
}

export interface IValue {
  field: string;
  value: string;
  valueNumber: number;
  valueBoolean: boolean;
  valueDate: Date;
  itemId: string;
  values: [string];
}

export const valueSchema = new Schema({
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
  response: {
    type: Schema.Types.ObjectId,
    ref: 'Response',
  },
  values: {
    type: [String],
    default: [],
  },
});

export const responseSchema = new Schema<IResponse>(
  {
    formId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Form',
    },
    count: {
      type: Number,
      required: true,
    },
    parentId: {
      type: Schema.Types.ObjectId,
      ref: 'ListItem',
    },
    responseId: {
      type: Schema.Types.ObjectId,
      default: null,
    },
    values: [valueSchema],
    options: { type: Schema.Types.Mixed, default: { option: false } },
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

responseSchema.index({ formId: 1, count: 1 }, { unique: true });

export const ResponseModel = model<IResponse>('Response', responseSchema);
