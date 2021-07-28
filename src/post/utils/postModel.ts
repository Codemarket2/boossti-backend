import * as mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
  body: String,
  media: {
    type: [{ url: String, caption: String }],
    default: [],
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
  },
});

export const Post = mongoose.model('Post', postSchema);
