import { listResolvers } from "../src/list/resolvers";
import { userResolvers } from "../src/user/resolvers";
import { postResolvers } from "../src/post/resolvers";
import { bookmarkResolvers } from "../src/bookmark/resolvers";
import { fieldResolvers } from "../src/field/resolvers";
import { commentResolvers } from "../src/comment/resolvers";
import { likeResolvers } from "../src/like/resolvers";

export default {
  ...userResolvers,
  ...listResolvers,
  ...likeResolvers,
  ...postResolvers,
  ...bookmarkResolvers,
  ...fieldResolvers,
  ...commentResolvers,
};
