import * as mongoose from "mongoose";

const likeSchema = new mongoose.Schema({
  like: {
    type: Boolean,
    default: false,
  },
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
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

export const Like = mongoose.model("Like", likeSchema);
