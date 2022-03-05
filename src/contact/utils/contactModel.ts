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
export interface IMailingList {
  listName: string;
  contacts: [Schema.Types.ObjectId];
}
const contactSchema = new Schema<IContact>(
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

const MailingListSchema = new Schema<IMailingList>(
  {
    listName: {
      type: String,
      unique: true,
      required: true,
    },
    contacts: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Contact',
      },
    ],
  },
  { timestamps: true },
);
export const Contact = model<IContact>('Contact', contactSchema);
export const MailingList = model<IMailingList>('MailingList', MailingListSchema);
