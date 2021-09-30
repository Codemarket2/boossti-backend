import * as mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
  body: String,
  threadId: { type: mongoose.Schema.Types.ObjectId, required: true },
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
  },
});

export const Comment = mongoose.model('Comment', commentSchema);
