import { Schema, model } from 'mongoose';
import { ISchema } from '../../utils/customTypes';

export interface Role extends ISchema {
  name: string;
  options: any;
  forms: string[];
  users: string[];
}

const roleSchema = new Schema<Role>(
  {
    name: { type: String, unique: true },
    options: {
      type: Schema.Types.Mixed,
      default: { option: false },
    },
    forms: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Form',
      },
    ],
    users: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
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

export const RoleModel = model<Role>('Role', roleSchema);
