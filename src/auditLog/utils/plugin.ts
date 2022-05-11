// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import * as _ from 'lodash';
import { createActionAuditLog, updateAuctionAuditLog } from './auditLog';

export const auditLogPlugin = function (schema) {
  schema.post('save', async function (next) {
    const model = this.constructor.modelName;
    const documentId = this._id;
    if (this.isNew) {
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
};
