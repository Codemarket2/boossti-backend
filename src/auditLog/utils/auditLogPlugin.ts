// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import * as _ from 'lodash';
import { createActionAuditLog, updateAuctionAuditLog, deleteActionAuditLog } from './auditLog';

export const auditLogPlugin = function (schema) {
  schema.pre('save', function (next) {
    this.wasNew = this.isNew;
    next();
  });

  schema.post('save', async function (doc, next) {
    const model = this.constructor.modelName;
    const documentId = this._id;
    if (this.wasNew) {
      await createActionAuditLog({ model, documentId });
    }
    next();
  });

  schema.pre('findOneAndUpdate', async function () {
    const oldDoc = await this.model.findOne(this.getQuery());
    this.oldDoc = oldDoc;
  });

  schema.post('findOneAndUpdate', async function () {
    const newDoc = await this.model.findOne(this.getQuery());
    const model = newDoc.constructor.modelName;
    const documentId = newDoc._id;
    await updateAuctionAuditLog({
      model,
      documentId,
      oldData: this.oldDoc.toObject(),
      newData: newDoc.toObject(),
    });
  });

  schema.pre('findOneAndDelete', async function () {
    const oldDoc = await this.model.findOne(this.getQuery());
    this.oldDoc = oldDoc;
  });

  schema.post('findOneAndDelete', async function () {
    const model = this.oldDoc.constructor.modelName;
    const documentId = this.oldDoc._id;
    await deleteActionAuditLog({
      model,
      documentId,
      oldDoc: this.oldDoc,
    });
  });
};
