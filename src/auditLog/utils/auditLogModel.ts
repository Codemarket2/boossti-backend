import { Schema, model } from 'mongoose';
import { ISchema } from '../../utils/cutomTypes';
import { userPopulate } from '../../utils/populate';

export interface IAuditLog extends ISchema {
  action: string;
  model: string;
  documentId: string;
  diff: string;
  message: string;
}

const auditLogSchema = new Schema<IAuditLog>(
  {
    action: { type: String, required: true },
    model: { type: String, required: true },
    documentId: { type: Schema.Types.ObjectId, required: true },
    diff: { type: Schema.Types.Mixed },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true },
);

export const AuditLogModel = model<IAuditLog>('AuditLog', auditLogSchema);

export const auditLogPopulate = [userPopulate];
