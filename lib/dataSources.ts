export default {
  cognitoLambda: 'src/user/trigger.handler', // only master branch should have this data source
  userLambda: 'src/user/index.handler',
  listLambda: 'src/list/index.handler',
};
