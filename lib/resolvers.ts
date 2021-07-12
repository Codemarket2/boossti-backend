import { listResolvers } from '../src/list/resolvers';
import { userResolvers } from '../src/user/resolvers';

export default {
  ...userResolvers,
  ...listResolvers,
};
