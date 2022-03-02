import { DB } from '../utils/DB';
import { getCurrentUser } from '../utils/authentication';
import { AppSyncEvent } from '../utils/cutomTypes';
import ContactModel from './utils/contactModel';
import { fileParser } from '../form/utils/readCsvFile';

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
        const response = await ContactModel.create(args);
        return response;
      }

      case 'createMailingList': {
        console.log(args);
        const { fileUrl, collectionName, map } = args;
        const filter: any = Object.values(map);
        const fields = Object.keys(map);
        const fileData = await fileParser(fileUrl, filter);
        const responses: any = [];

        fileData?.map((data) => {
          const response = {};
          for (let i = 0; i < fields.length; i++) {
            response[`${fields[i]}`] = data[map[fields[i]]];
          }
          response['groupName'] = collectionName;
          // console.log(response);
          responses.push(response);
        });
        const responseCreated = await ContactModel.create(responses);
        console.log(responseCreated);
        return true;
      }

      case 'getAllContacts': {
        const { page = 1, limit = 50 } = args;

        const data = await ContactModel.find()
          .sort({ createdAt: -1 })
          .limit(limit * 1)
          .skip((page - 1) * limit);
        const count = await ContactModel.countDocuments();
        return {
          data,
          count,
        };
      }
      case 'getAllMailingList': {
        const data = await ContactModel.aggregate([
          {
            $sort: {
              createdAt: -1,
            },
          },
          {
            $group: {
              _id: '$groupName',
              emailCount: { $sum: 1 },
            },
          },
        ]);
        console.log('data', data);
        return data;
      }

      case 'getContact': {
        return await ContactModel.findById(args._id);
      }

      case 'updateContact': {
        //todo update

        break;
      }
      case 'deleteContact': {
        await ContactModel.findByIdAndDelete(args._id);
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
