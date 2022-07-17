import { Schema, model } from 'mongoose';
import { ISchema } from '../../utils/customTypes';
import { extendSchema } from '../../utils/extendSchema';
import { userPopulate } from '../../utils/populate';

export interface IAuditLog extends ISchema {
  action: string;
  model: string;
  documentId: string;
  diff: string;
  message: string;
}

const auditLogSchema = extendSchema({
  action: { type: String, required: true },
  model: { type: String, required: true },
  documentId: { type: Schema.Types.ObjectId, required: true },
  diff: { type: Schema.Types.Mixed },
});

export const AuditLogModel = model<IAuditLog>('AuditLog', auditLogSchema);

export const auditLogPopulate = [userPopulate];
