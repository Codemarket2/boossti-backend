import * as mongoose from 'mongoose';
import { ISchema } from '../../utils/customTypes';
import { extendSchema } from '../../utils/extendSchema';

export interface IComment extends ISchema {
  body: string;
  threadId: string;
  parentIds: string[];
}

const commentSchema = extendSchema({
  body: { type: String, required: true },
  threadId: { type: mongoose.Schema.Types.ObjectId, required: true },
  parentIds: {
    type: [mongoose.Schema.Types.ObjectId],
    required: true,
    default: [],
  },
});

export const CommentModel = mongoose.model<IComment>('Comment', commentSchema);
