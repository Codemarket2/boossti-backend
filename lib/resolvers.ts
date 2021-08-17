import { listResolvers } from "../src/list/resolvers";
import { userResolvers } from "../src/user/resolvers";
import { postResolvers } from "../src/post/resolvers";
import { bookmarkResolvers } from "../src/bookmark/resolvers";
import { fieldResolvers } from "../src/field/resolvers";
import { commentResolvers } from "../src/comment/resolvers";

export default {
  ...userResolvers,
  ...listResolvers,
  ...postResolvers,
  ...bookmarkResolvers,
  ...fieldResolvers,
  ...commentResolvers,
};
