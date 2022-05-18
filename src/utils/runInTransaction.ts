import * as mongoose from 'mongoose';
import { ClientSession } from 'mongoose';
import {
  createActionAuditLog,
  deleteActionAuditLog,
  updateAuctionAuditLog,
} from '../auditLog/utils/auditLog';

type TransactionCallback = (session: ClientSession) => Promise<any>;

interface IOperation {
  action: 'CREATE' | 'UPDATE' | 'DELETE';
  model: mongoose.Model<any>;
}

export const runInTransaction = async (callback: TransactionCallback, operation: IOperation) => {
  const session: ClientSession = await mongoose.startSession();

  session.startTransaction();

  try {
    const data = await callback(session);
    if (!data._id) {
      throw new Error('Something went wrong, please try again');
    }
    const modelName = operation.model.modelName;
    switch (operation.action) {
      case 'CREATE': {
        await createActionAuditLog({
          session,
          documentId: data._id,
          model: modelName,
          newDoc: data,
        });
        break;
      }
      case 'UPDATE': {
        // const newDoc = {};
        const newDoc = await operation.model.findById(data._id).session(session);
        await updateAuctionAuditLog({
          session,
          documentId: data._id,
          model: modelName,
          oldDoc: data,
          newDoc,
        });
        break;
      }
      case 'DELETE': {
        await deleteActionAuditLog({
          session,
          documentId: data._id,
          model: modelName,
          oldDoc: data,
        });
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
};
