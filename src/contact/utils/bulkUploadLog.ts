import { model, Schema } from 'mongoose';

import { ISchema } from '../../utils/cutomTypes';

interface IBulkUploadLog extends ISchema {
  fileName: string;
  status: string;
  progress: number;
  success: number;
  failed: number;
  completedOn: Date;
}

const bulkUploadLogSchema = new Schema<IBulkUploadLog>(
  {
    fileName: { required: true, type: String },
    status: { required: true, type: String, default: 'started' },
    progress: { required: true, type: Number, default: 0 },
    success: { required: true, type: Number, default: 0 },
    failed: { required: true, type: Number, default: 0 },
    createdBy: {
      required: true,
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    completedOn: Date,
  },
  { timestamps: true },
);

export const BulkUploadLog = model<IBulkUploadLog>('BulkUploadLog', bulkUploadLogSchema);
