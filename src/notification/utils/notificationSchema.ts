import { Schema, model } from 'mongoose';
import { ISchema } from '../../utils/cutomTypes';

export interface INotification extends ISchema {
  userId: string;
  title: string;
  description?: string;
  link?: string;
}

const notificationSchema = new Schema<INotification>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    title: String,
    description: String,
    link: String,
  },
  { timestamps: true },
);

export const NotificationModel = model<INotification>('NotificationModel', notificationSchema);
