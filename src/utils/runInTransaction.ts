import * as mongoose from 'mongoose';
import { ClientSession } from 'mongoose';
// import { getDiff } from '../form/activityLog/getDiff';
import { createActivityLog } from '../form/activityLog/createActivityLog';

type TransactionCallback = (session: ClientSession, payload: any) => Promise<any>;

interface IOperation {
  action: 'CREATE' | 'UPDATE' | 'DELETE';
  Model: mongoose.Model<any>;
  args: any;
  populate?: any;
  user: any;
}

export const runInTransaction = async (operation: IOperation, callback?: TransactionCallback) => {
  const session: ClientSession = await mongoose.startSession();

  session.startTransaction();
  let data;

  try {
    const { action, Model, args, populate, user } = operation;
    const modelName = Model.modelName;
    switch (action) {
      case 'CREATE': {
        data = await Model.create([args], { session: session });
        data = data[0];
        await createActivityLog({
          session,
          documentId: data._id,
          model: modelName,
          difference: data,
          createdBy: user?._id,
          action,
        });
        if (populate) {
          data = await Model.findById(data._id).populate(populate).session(session);
        }
        break;
      }
      case 'UPDATE': {
        const oldDoc = await Model.findByIdAndUpdate(args._id, args, {
          runValidators: true,
          session: session,
        });
        data = await Model.findById(args._id).session(session);
        // const diff = getDiff(oldDoc?.toObject(), data?.toObject());
        await createActivityLog({
          session,
          documentId: data._id,
          model: modelName,
          difference: data,
          createdBy: user?._id,
          action,
        });
        if (populate) {
          data = await Model.findById(data._id).populate(populate).session(session);
        }
        break;
      }
      case 'DELETE': {
        data = await Model.findByIdAndDelete(args._id, {
          session: session,
        });
        await createActivityLog({
          session,
          documentId: data._id,
          model: modelName,
          difference: data,
          createdBy: user?._id,
          action,
        });
        break;
      }
    }

    if (callback) {
      await callback(session, data);
    }

    // Commit the changes
    await session.commitTransaction();
  } catch (error) {
    // Rollback any changes made in the database
    await session.abortTransaction();

    // logging the error
    console.error(error);

    // Rethrow the error
    throw error;
  } finally {
    // Ending the session
    session.endSession();
  }
  return data;
};
