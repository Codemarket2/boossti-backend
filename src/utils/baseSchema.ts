import { Schema } from 'mongoose';
import { ISchema } from './cutomTypes';

export const baseSchema = new Schema<ISchema>(
  {
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
