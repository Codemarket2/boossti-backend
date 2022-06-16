import { DB } from '../utils/DB';
import { getCurrentUser } from '../utils/authentication';
import { AppSyncEvent } from '../utils/customTypes';
import EmailModel, { EmailCampaign, EmailTemplate } from './utils/emailModel';
import { userPopulate } from '../utils/populate';
import { createTemplate, deleteTemplate, updateTemplate } from './utils/sesCreateEmailTemplate';
import { sendBulkEmails, sendBulkTemplatedEmail } from './utils/sesTemplateEmail';
import { MailingList } from '../contact/utils/contactModel';
import { sendOneByOneEmail } from './utils/sesOneEmail';
import { replaceVariables } from './utils/variables';

export const handler = async (event: AppSyncEvent): Promise<any> => {
  try {
    await DB();
    const {
      info: { fieldName },
      identity,
    } = event;
    const user = await getCurrentUser(identity);
    let args = { ...event.arguments };
    // const { page = 1, limit = 20, search = '', active = null, sortBy = '-createdAt' } = args;
    if (fieldName.toLocaleLowerCase().includes('create') && user && user._id) {
      args = { ...args, createdBy: user._id };
    } else if (fieldName.toLocaleLowerCase().includes('update') && user && user._id) {
      args = { ...args, updatedBy: user._id };
    }

    // sendEmail: process.env.SENDER_EMAIL,
    switch (fieldName) {
      case 'createSendEmail':
        {
          const { senderEmail, receiverEmail, body, subject, mailingList, sendIndividual } = args;
          let response, findReceiverEmail;
          if (mailingList && receiverEmail.length === 0) {
            const mList = await MailingList.findOne({ listName: mailingList })
              .populate('contacts')
              .exec();

            findReceiverEmail = mList?.contacts;
          } else {
            findReceiverEmail = receiverEmail;
          }

          response = await EmailModel.create({
            senderEmail,
            receiverEmail: findReceiverEmail,
            body,
            subject,
          });
          response = await response.populate(userPopulate); //.execPopulate();
          if (sendIndividual === true) {
            await Promise.all(
              findReceiverEmail.map(async (contact) => {
                const newBody = replaceVariables(body, contact);
                const newSubject = replaceVariables(subject, contact);
                const newSenderEmail = replaceVariables(senderEmail, contact);
                await sendOneByOneEmail({
                  from: newSenderEmail,
                  to: [contact.email],
                  body: newBody,
                  subject: newSubject,
                })
                  .then(() => console.log('Email Sent'))
                  .catch((e) => console.error(e.message));
              }),
            );
          } else {
            await sendBulkEmails({
              from: senderEmail,
              to: findReceiverEmail,
              body: body,
              subject: subject,
            })
              .then(() => console.log('Email Sent'))
              .catch((e) => console.error(e.message));
          }
          return response;
        }
        break;
      case 'getAllEmails':
        {
          const data = await EmailModel.find().populate(userPopulate);
          const count = await EmailModel.countDocuments();
          return {
            data,
            count,
          };
        }
        break;
      case 'getOneEmailTemplate':
        {
          return await EmailTemplate.findById(event.arguments.id);
        }
        break;
      case 'getAllEmailTemplatesByUserId':
        {
          return await EmailTemplate.find({ userId: event.arguments.userId });
        }
        break;
      case 'getAllEmailTemplates':
        {
          return await EmailTemplate.find();
        }
        break;
      case 'createOneEmailTemplate':
        {
          await createTemplate(event.arguments);
          return await EmailTemplate.create(event.arguments);
        }
        break;
      case 'updateOneEmailTemplate':
        {
          await updateTemplate(event.arguments);
          return await EmailTemplate.findByIdAndUpdate(event.arguments.id, event.arguments, {
            new: true,
            runValidators: true,
          });
        }
        break;
      case 'deleteOneEmailTemplate':
        {
          await deleteTemplate(event.arguments);
          return await EmailTemplate.findByIdAndDelete(event.arguments.id);
        }
        break;
      case 'getOneEmailCampaign':
        {
          return await EmailCampaign.findById(event.arguments.id);
        }
        break;
      case 'getAllEmailCampaignsByUserId':
        {
          return await EmailCampaign.find({ userId: event.arguments.userId });
        }
        break;
      case 'getAllEmailCampaigns':
        {
          return await EmailCampaign.find();
        }
        break;
      case 'createOneEmailCampaign':
        {
          const cRes = await sendBulkTemplatedEmail(event.arguments);
          return await EmailCampaign.create({
            campaignRes: cRes,
            ...event.arguments,
          });
        }
        break;
      case 'updateOneEmailCampaign':
        {
          return await EmailCampaign.findByIdAndUpdate(event.arguments.id, event.arguments, {
            new: true,
            runValidators: true,
          });
        }
        break;
      case 'deleteOneEmailCampaign':
        {
          return await EmailCampaign.findByIdAndDelete(event.arguments.id);
        }
        break;
      default:
        throw new Error(
          'Something went wrong in backend src/email/index.ts! Please check your Query or Mutation',
        );
    }
  } catch (error) {
    if (error.runThis) {
      console.log('error', error);
    }
    const error2 = error;
    throw error2;
  }
};
