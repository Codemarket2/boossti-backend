import * as mongoose from 'mongoose';

const bookmarkSchema = new mongoose.Schema({
  parentId: String,
  bookmark: String,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  createdAt: {
    type: Date,
    default: new Date(),
  },
  updatedAt: {
    type: Date,
  },
});

export const Bookmark = mongoose.model('Bookmark', bookmarkSchema);
