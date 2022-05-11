import { AuditLogModel } from './auditLogModel';
import { getDiff } from './getDiff';

interface IPayload {
  documentId: string;
  model: string;
}

interface IUpdatePayload extends IPayload {
  documentId: string;
  model: string;
  oldData: any;
  newData: any;
}

export const createActionAuditLog = async ({ model, documentId }: IPayload) => {
  await AuditLogModel.create({ model, documentId, action: 'CREATE' });
};

export const updateAuctionAuditLog = async ({
  model,
  documentId,
  oldData,
  newData,
}: IUpdatePayload) => {
  const diff = getDiff(newData, oldData);
  console.log(diff);
  delete diff.updatedAt;
  await AuditLogModel.create({ model, documentId, action: 'UPDATE', diff });
};

export const deleteActionAuditLog = async ({ model, documentId }: IPayload) => {
  await AuditLogModel.create({ model, documentId, action: 'DELETE' });
};
