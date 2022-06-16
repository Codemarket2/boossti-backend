import { Schema, model } from 'mongoose';
import { ISchema } from '../../utils/customTypes';

// const subscriptionSchema = new Schema({
//   active: {
//     type: Boolean,
//     default: false,
//   },
//   subscriptionType: String,
//   description: String,
//   amount: Number,
//   subscribedOn: Date,
//   expiringOn: Date,
// });

interface IUser extends ISchema {
  userId: string;
  name: string;
  email: string;
  picture: string;
  active: boolean;
  confirmed: boolean;
}

const userSchema = new Schema<IUser>({
  userId: { type: String, required: true },
  name: String,
  email: String,
  picture: {
    type: String,
    default:
      'https://codemarket-common-bucket.s3.amazonaws.com/public/defaults/pictures/default.jpg',
  },
  active: {
    type: Boolean,
    default: true,
  },
  confirmed: {
    type: Boolean,
    default: false,
  },
  createdBy: { type: String, default: 'PreSignUp_SignUp' },
  updatedBy: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
  },
  // stripeCustomer: String,
  // stripeAccount: String,
  // subscription: { type: subscriptionSchema },
});

userSchema.index({ userId: 1 });

export const User = model<IUser>('User', userSchema);
