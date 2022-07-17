import { Schema, model } from 'mongoose';
import { userPopulate } from '../../utils/populate';
import { extendSchema } from '../../utils/extendSchema';
import { IResponse, IValue } from './responseType';

export const valueSchema = new Schema<IValue>({
  field: {
    type: String,
    required: true,
  },
  value: String,
  valueDate: Date,
  valueNumber: Number,
  valueBoolean: Boolean,
  media: {
    type: [{ url: String, caption: String }],
    default: [],
  },
  values: {
    type: [String],
    default: [],
  },
  template: {
    type: Schema.Types.ObjectId,
    ref: 'Template',
  },
  page: {
    type: Schema.Types.ObjectId,
    ref: 'Page',
  },
  form: {
    type: Schema.Types.ObjectId,
    ref: 'Form',
  },
  response: {
    type: Schema.Types.ObjectId,
    ref: 'Response',
  },
  options: { type: Schema.Types.Mixed, default: { option: false } },
});

export const responseSchema = extendSchema({
  formId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'Form',
  },
  appId: {
    type: Schema.Types.ObjectId,
    ref: 'Response',
  },
  installId: {
    type: Schema.Types.ObjectId,
    ref: 'Response',
  },
  count: {
    type: Number,
    required: true,
  },
  workFlowFormResponseParentId: {
    type: Schema.Types.ObjectId,
    default: null,
  },
  values: [valueSchema],
  options: { type: Schema.Types.Mixed, default: { option: false } },
});

responseSchema.index({ formId: 1, count: 1 }, { unique: true });

export const ResponseModel = model<IResponse>('Response', responseSchema);

export const valuesPopulate = [
  {
    path: 'values.template',
    select: 'title slug media',
  },
  {
    path: 'values.page',
    select: 'types title media slug',
  },
  {
    path: 'values.form',
    select: 'name',
  },
  {
    path: 'values.response',
    select: 'values',
  },
];

export const responsePopulate = [userPopulate, ...valuesPopulate];

export const myResponsePopulate = [
  ...responsePopulate,
  {
    path: 'formId',
    select: 'name',
  },
];
