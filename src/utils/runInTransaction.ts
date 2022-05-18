import * as mongoose from 'mongoose';
import { ClientSession } from 'mongoose';
import {
  createActionAuditLog,
  deleteActionAuditLog,
  updateAuctionAuditLog,
} from '../auditLog/utils/auditLog';

// type TransactionCallback = (session: ClientSession) => Promise<any>;

interface IOperation {
  action: 'CREATE' | 'UPDATE' | 'DELETE';
  Model: mongoose.Model<any>;
  args: any;
  populate?: any;
}

// callback: TransactionCallback,

export const runInTransaction = async (operation: IOperation) => {
  const session: ClientSession = await mongoose.startSession();

  session.startTransaction();
  let data;
  try {
    const { action, Model, args, populate } = operation;
    const modelName = Model.modelName;
    switch (action) {
      case 'CREATE': {
        data = await Model.create([args], { session: session });
        data = data[0];
        await createActionAuditLog({
          session,
          documentId: data._id,
          model: modelName,
          newDoc: data,
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
        await updateAuctionAuditLog({
          session,
          documentId: data._id,
          model: modelName,
          oldDoc,
          newDoc: data,
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
        await deleteActionAuditLog({
          session,
          documentId: data._id,
          model: modelName,
          oldDoc: data,
        });
        data = data._id;
        break;
      }
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
