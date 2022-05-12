import { ClientSession } from 'mongoose';
import { AuditLogModel } from './auditLogModel';
import { getDiff } from './getDiff';

interface IPayload {
  documentId: string;
  model: string;
  session: ClientSession;
}

interface ICreatePayload extends IPayload {
  newDoc: any;
}

export const createActionAuditLog = async ({
  model,
  documentId,
  session,
  newDoc,
}: ICreatePayload) => {
  // throw new Error('something went wrong');
  await AuditLogModel.create([{ model, documentId, action: 'CREATE', diff: newDoc }], {
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
}: IUpdatePayload) => {
  // throw new Error('something went wrong');
  const diff = getDiff(oldDoc, newDoc);
  await AuditLogModel.create([{ model, documentId, action: 'UPDATE', diff }], { session: session });
};

interface IDeletePayload extends IPayload {
  oldDoc: any;
}

export const deleteActionAuditLog = async ({
  model,
  documentId,
  oldDoc,
  session,
}: IDeletePayload) => {
  // throw new Error('something went wrong');
  await AuditLogModel.create([{ model, documentId, action: 'DELETE', diff: oldDoc }], {
    session: session,
  });
};
