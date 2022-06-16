import { Schema, model } from 'mongoose';
import { ISchema } from '../../utils/customTypes';
import { fieldSchema, fieldsPopulate } from '../../form/utils/formModel';
import { valueSchema, valuesPopulate } from '../../form/utils/responseModel';
import { userPopulate } from '../../utils/populate';
import { IField } from '../../form/utils/formType';
import { IValue } from '../../form/utils/responseType';
import { extendSchema } from '../../utils/extendSchema';

export interface ITemplateInstance extends ISchema {
  template: string;
  // title: string;
  // slug: string;
  // description: string;
  // media: IMedia[];
  fields: IField[];
  active: boolean;
  values: IValue[];
  authenticateUser: boolean;
  options: any;
}

const templateInstanceSchema = extendSchema({
  template: { type: Schema.Types.ObjectId, ref: 'Template' },
  // count: { type: Number, required: true },
  // title: String,
  // slug: { type: String, unique: true, required: true },
  // description: String,
  // media: {
  //   type: [{ url: String, caption: String }],
  //   default: [],
  // },
  fields: { type: [fieldSchema], default: [] },
  values: { type: [valueSchema], default: [] },
  active: {
    type: Boolean,
    default: false,
  },
  authenticateUser: {
    type: Boolean,
    default: false,
  },
  options: {
    type: Schema.Types.Mixed,
    default: { option: false },
  },
});

export const TemplateInstanceModel = model<ITemplateInstance>(
  'TemplateInstance',
  templateInstanceSchema,
);

export const templateInstancePopulate = [
  userPopulate,
  { path: 'template', select: 'title slug' },
  ...fieldsPopulate,
  ...valuesPopulate,
];
