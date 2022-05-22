import { DB } from '../utils/DB';
import { AuditLogModel, auditLogPopulate } from './utils/auditLogModel';
// import { getCurrentUser } from '../utils/authentication';
import { AppSyncEvent } from '../utils/cutomTypes';
import { Types } from 'mongoose';

export const handler = async (event: AppSyncEvent): Promise<any> => {
  try {
    await DB();
    const {
      info: { fieldName },
      identity,
    } = event;
    // const user = await getCurrentUser(identity);
    const args = { ...event.arguments };

    switch (fieldName) {
      case 'getAuditLogs': {
        const { page = 1, limit = 20, sortBy = '-createdAt', documentId, formId } = args;
        let filter: any = {};
        if (documentId && formId) {
          filter = {
            ...filter,
            $or: [{ documentId }, { 'diff.formId': new Types.ObjectId(formId) }],
          };
        } else if (documentId) {
          filter = { ...filter, documentId };
        }

        const data = await AuditLogModel.find(filter)
          .populate(auditLogPopulate)
          .sort(sortBy)
          .limit(limit * 1)
          .skip((page - 1) * limit);
        const count = await AuditLogModel.countDocuments(filter);
        return {
          data,
          count,
        };
      }
      default:
        throw new Error('Something went wrong! Please check your Query or Mutation');
    }
  } catch (error) {
    const error2 = error;
    throw error2;
  }
};
