import { Schema } from 'mongoose';
import { ISchema } from './cutomTypes';

export const baseSchema = new Schema<ISchema>(
  {
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'Response',
      // required: true,
    },
  },
  { timestamps: true },
);
