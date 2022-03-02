import { Schema, model } from 'mongoose';

interface IEmail {
  senderEmail: string;
  receiverEmail: string[];
  subject: string;
  body: string;
}

const emailSchema = new Schema<IEmail>(
  {
    senderEmail: {
      type: String,
      required: true,
    },
    receiverEmail: [
      {
        type: String,
        required: true,
      },
    ],
    subject: {
      type: String,
      required: true,
    },
    body: {
      type: String,
      required: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true },
);

const emailTemplateSchema = new Schema({
  userId: {
    type: String,
    required: [true, 'User Id is required'],
  },
  templateName: String,
  htmlPart: String,
  subjectPart: String,
  textPart: String,
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

const emailCampaignSchema = new Schema({
  userId: {
    type: String,
    required: [true, 'User Id is required'],
  },
  campaignName: String,
  campaignRes: {},
  mailingList: String,
  templateName: String,
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

const EmailModel = model<IEmail>('Email', emailSchema);
export const EmailTemplate = model('EmailTemplate', emailTemplateSchema);

export const EmailCampaign = model('EmailCampaign', emailCampaignSchema);

export default EmailModel;
