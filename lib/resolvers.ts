import { templateResolvers } from '../src/template/resolvers';
import { userResolvers } from '../src/user/resolvers';
import { postResolvers } from '../src/post/resolvers';
import { bookmarkResolvers } from '../src/bookmark/resolvers';
import { commentResolvers } from '../src/comment/resolvers';
import { likeResolvers } from '../src/like/resolvers';
import { starRatingResolver } from '../src/starRating/resolvers';
import { formResolvers } from '../src/form/resolvers';
import { notificationResolvers } from '../src/notification/resolvers';
import { emailResolvers } from '../src/email/resolvers';
import { contactResolvers } from '../src/contact/resolvers';
import { roleResolvers } from '../src/role/resolvers';

export default {
  ...userResolvers,
  ...templateResolvers,
  ...likeResolvers,
  ...starRatingResolver,
  ...postResolvers,
  ...bookmarkResolvers,
  ...commentResolvers,
  ...formResolvers,
  ...notificationResolvers,
  ...emailResolvers,
  ...contactResolvers,
  ...roleResolvers,
};
