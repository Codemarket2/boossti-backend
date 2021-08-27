import * as mongoose from 'mongoose';

const tagSchema = new mongoose.Schema({
  tag: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'tags.tagModel',
  },
  tagModel: {
    type: String,
    required: true,
    enum: ['ListType', 'ListItem'],
  },
});

const postSchema = new mongoose.Schema({
  body: String,
  media: {
    type: [{ url: String, caption: String }],
    default: [],
  },
  // tags: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ListType' }],
  tags: [tagSchema],
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
