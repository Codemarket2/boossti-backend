import { Schema, SchemaDefinition, SchemaOptions } from 'mongoose';
import { baseSchema } from './baseSchema';

export const extendSchema = (definition: SchemaDefinition, options: SchemaOptions = {}) => {
  return new Schema(Object.assign({}, baseSchema.obj, definition), {
    timestamps: true,
    ...options,
  });
};
