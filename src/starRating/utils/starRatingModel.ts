import * as mongoose from 'mongoose';

const starRatingSchema = new mongoose.Schema({
  starRating: {
    type: Number,
    required: true,
  },
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

export const StarRating = mongoose.model('StarRating', starRatingSchema);
