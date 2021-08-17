import * as mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
  body: String,
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Post",
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

export const Comment = mongoose.model("Comment", commentSchema);
