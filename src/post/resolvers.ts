export const postResolvers = {
  'Query  getPosts': 'postLambda',
  'Query  getPost': 'postLambda',
  'Query getMyPosts': 'postLambda',
  'Mutation createPost': 'postLambda',
  'Mutation updatePost': 'postLambda',
  'Mutation deletePost': 'postLambda',
};
