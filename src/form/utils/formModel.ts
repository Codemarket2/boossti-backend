import { Schema, model } from 'mongoose';
import { ISchema } from '../../utils/cutomTypes';

export interface IForm extends ISchema {
  parentId: string;
  name: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fields: [any];
  published: boolean;
}

const formSchema = new Schema<IForm>(
  {
    parentId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    name: { type: String, required: true },
    fields: [{}],
    published: {
      type: Boolean,
      default: false,
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

export const FormModel = model<IForm>('Form', formSchema);
