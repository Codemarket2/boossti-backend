import { ClientSession } from 'mongoose';
import { AuditLogModel } from './auditLogModel';
import { getDiff } from '../../form/activityLog/getDiff';

interface IPayload {
  documentId: string;
  model: string;
  session: ClientSession;
  createdBy: ClientSession;
}

interface ICreatePayload extends IPayload {
  newDoc: any;
}

export const createActionAuditLog = async ({
  model,
  documentId,
  session,
  newDoc,
  createdBy,
}: ICreatePayload) => {
  await AuditLogModel.create([{ model, documentId, createdBy, action: 'CREATE', diff: newDoc }], {
    session: session,
  });
};

interface IUpdatePayload extends IPayload {
  oldDoc: any;
  newDoc: any;
}

export const updateAuctionAuditLog = async ({
  model,
  documentId,
  oldDoc,
  newDoc,
  session,
  createdBy,
}: IUpdatePayload) => {
  const diff = getDiff(oldDoc?.toObject(), newDoc?.toObject());
  await AuditLogModel.create([{ model, documentId, createdBy, action: 'UPDATE', diff }], {
    session: session,
  });
};

interface IDeletePayload extends IPayload {
  oldDoc: any;
}

export const deleteActionAuditLog = async ({
  model,
  documentId,
  oldDoc,
  session,
  createdBy,
}: IDeletePayload) => {
  await AuditLogModel.create([{ model, documentId, createdBy, action: 'DELETE', diff: oldDoc }], {
    session: session,
  });
};

export const getAuditLog = async (documentId) => {
  return await AuditLogModel.findOne({ documentId }).sort('-createdAt');
};
