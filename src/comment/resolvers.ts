export const commentResolvers = {
  'Query getComment': 'commentLambda',
  'Query getCommentsByThreadId': 'commentLambda',
  'Query getActionCounts': 'commentLambda',
  'Mutation createComment': 'commentLambda',
  'Mutation updateComment': 'commentLambda',
  'Mutation deleteComment': 'commentLambda',
};
