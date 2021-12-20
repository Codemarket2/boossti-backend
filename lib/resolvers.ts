import { listResolvers } from '../src/list/resolvers';
import { userResolvers } from '../src/user/resolvers';
import { postResolvers } from '../src/post/resolvers';
import { bookmarkResolvers } from '../src/bookmark/resolvers';
import { fieldResolvers } from '../src/field/resolvers';
import { commentResolvers } from '../src/comment/resolvers';
import { likeResolvers } from '../src/like/resolvers';
import { formResolvers } from '../src/form/resolvers';
import { notificationResolvers } from '../src/notification/resolvers';

export default {
  ...userResolvers,
  ...listResolvers,
  ...likeResolvers,
  ...postResolvers,
  ...bookmarkResolvers,
  ...fieldResolvers,
  ...commentResolvers,
  ...formResolvers,
  ...notificationResolvers,
};
