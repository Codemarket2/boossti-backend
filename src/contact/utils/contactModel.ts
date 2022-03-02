import { model, Schema } from 'mongoose';
import { valueSchema } from '../../form/utils/responseModel';
import { ISchema } from '../../utils/cutomTypes';

export interface IContact {
  firstName: string;
  lastName: string;
  title: string;
  businessName: string;
  email: string;
  phone: number;
  groupName: string;
  website: string;
  city: string;
}

export const contactSchema = new Schema<IContact>(
  {
    firstName: {
      type: String,
    },
    lastName: {
      type: String,
    },
    title: {
      type: String,
    },
    businessName: {
      type: String,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    phone: {
      type: String,
    },
    groupName: {
      type: String,
      required: true,
    },
    website: {
      type: String,
    },
    city: {
      type: String,
    },
  },
  { timestamps: true },
);
const ContactModel = model<IContact>('Contact', contactSchema);
export default ContactModel;
