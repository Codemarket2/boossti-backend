import { listResolvers } from '../src/list/resolvers';
import { userResolvers } from '../src/user/resolvers';
import { postResolvers } from '../src/post/resolvers';
import { bookmarkResolvers } from '../src/bookmark/resolvers';

export default {
  ...userResolvers,
  ...listResolvers,
  ...postResolvers,
  ...bookmarkResolvers,
};
