import { Schema, model } from 'mongoose';
import { ISchema } from '../../utils/cutomTypes';
import { fieldSchema, fieldsPopulate, IField } from '../../form/utils/formModel';
import { valueSchema, IValue, valuesPopulate } from '../../form/utils/responseModel';

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
