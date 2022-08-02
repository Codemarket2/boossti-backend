import * as mongoose from 'mongoose';
import { ISchema } from '../../utils/customTypes';
import { extendSchema } from '../../utils/extendSchema';

interface ILike extends ISchema {
  like: boolean;
  threadId: string;
}

const likeSchema = extendSchema({
  like: {
    type: Boolean,
    default: false,
  },
  threadId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
});

likeSchema.index({ like: 1, threadId: 1, createdBy: 1 }, { unique: true });

export const LikeModel = mongoose.model<ILike>('Like', likeSchema);
