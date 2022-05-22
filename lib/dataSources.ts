export default {
  cognitoLambda: 'src/user/trigger.handler', // only master branch should have this data source
  commentLambda: 'src/comment/index.handler',
  userLambda: 'src/user/index.handler',
  templateLambda: 'src/template/index.handler',
  roleLambda: 'src/role/index.handler',
  likeLambda: 'src/like/index.handler',
  postLambda: 'src/post/index.handler',
  bookmarkLambda: 'src/bookmark/index.handler',
  formLambda: 'src/form/index.handler',
  notificationLambda: 'src/notification/index.handler',
  emailLambda: 'src/email/index.handler',
  contactLambda: 'src/contact/index.handler',
  starRatingLambda: 'src/starRating/index.handler',
  auditLogLambda: 'src/auditLog/index.handler',
};
