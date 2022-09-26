import { Schema, model } from 'mongoose';
import { ISchema } from '../../utils/customTypes';
import { fieldSchema, fieldsPopulate } from '../../form/utils/formModel';
import { valueSchema, valuesPopulate } from '../../form/utils/responseModel';
import { IValue } from '../types/response';
import { IField } from '../types/form';

export interface Section extends ISchema {
  fields: IField[];
  values: IValue[];
  options: any;
}

const sectionSchema = new Schema<Section>(
  {
    fields: { type: [fieldSchema], default: [] },
    values: { type: [valueSchema], default: [] },
    options: {
      type: Schema.Types.Mixed,
      default: { option: false },
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

export const SectionModel = model<Section>('Section', sectionSchema);

export const sectionPopulate = [...fieldsPopulate, ...valuesPopulate];
