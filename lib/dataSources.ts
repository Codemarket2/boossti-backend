export default {
  cognitoLambda: 'src/user/trigger.handler', // only master branch should have this data source
  commentLambda: 'src/comment/index.handler',
  userLambda: 'src/user/index.handler',
  listLambda: 'src/list/index.handler',
  likeLambda: 'src/like/index.handler',
  postLambda: 'src/post/index.handler',
  bookmarkLambda: 'src/bookmark/index.handler',
  fieldLambda: 'src/field/index.handler',
  formLambda: 'src/form/index.handler',
};
