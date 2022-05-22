import { DB } from '../utils/DB';
import { getCurrentUser } from '../utils/authentication';
import { AppSyncEvent } from '../utils/cutomTypes';
import { Contact, MailingList } from './utils/contactModel';
import { invokeCsvLambda } from './utils/invokeLambda';

export const handler = async (event: AppSyncEvent): Promise<any> => {
  try {
    await DB();
    const {
      info: { fieldName },
      identity,
    } = event;
    const user = await getCurrentUser(identity);
    let args = { ...event.arguments };

    if (fieldName.toLocaleLowerCase().includes('create') && user && user._id) {
      args = { ...args, createdBy: user._id };
    } else if (fieldName.toLocaleLowerCase().includes('update') && user && user._id) {
      args = { ...args, updatedBy: user._id };
    }

    switch (fieldName) {
      case 'createContact': {
        const response = await Contact.create(args);
        return response;
      }
      case 'createMailingList': {
        const { fileUrl, collectionName, map, createdBy } = args;
        // const fileName = fileUrl?.split('/')?.pop()?.split('name-')?.pop();
        await invokeCsvLambda({ fileUrl, collectionName, map, page: 1, createdBy });
        return true;
      }
      case 'createMailingListFromContact': {
        const { listName, selectedContact, createdBy } = args;
        console.log(args);
        const createdList = await MailingList.create({
          listName,
          contacts: selectedContact,
          createdBy,
        });
        console.log(createdList);
        return true;
      }
      case 'getAllContacts': {
        const { page = 1, limit = 50 } = args;
        // debugger;
        const data = await Contact.find()
          .sort({ createdAt: -1 })
          .limit(limit * 1)
          .skip((page - 1) * limit);
        const count = await Contact.countDocuments();

        return {
          data,
          count,
        };
      }
      case 'getAllMailingList': {
        // const data = await Contact.aggregate([
        //   {
        //     $sort: {
        //       createdAt: -1,
        //     },
        //   },
        //   {
        //     $group: {
        //       _id: '$groupName',
        //       emailCount: { $sum: 1 },
        //     },
        //   },
        // ]);
        // console.log('data', data);
        const list = await MailingList.find();
        console.log(list);
        return list;
      }

      case 'getContact': {
        return await Contact.findById(args._id);
      }

      case 'updateContact': {
        //todo update

        break;
      }
      case 'deleteContact': {
        await Contact.findByIdAndDelete(args._id);
        return args._id;
      }
      default:
        throw new Error('Something went wrong! Please check your Query or Mutation');
    }
  } catch (error) {
    if (error.runThis) {
      console.log('error', error);
    }
    const error2 = error;
    throw error2;
  }
};
