import * as sst from '@serverless-stack/resources';
import { StringParameter } from '@aws-cdk/aws-ssm';
import { AuthorizationType, UserPoolDefaultAction } from '@aws-cdk/aws-appsync';
import { UserPool } from '@aws-cdk/aws-cognito';
import { Expiration, Duration } from '@aws-cdk/core';
import dataSources from './dataSources';
import resolvers from './resolvers';
import schemas from './schemas';

export default class MyStack extends sst.Stack {
  constructor(scope: sst.App, id: string, props?: sst.StackProps) {
    super(scope, id, props);

    const SENDER_EMAIL = StringParameter.valueForStringParameter(
      this,
      '/codemarket/default/senderEmail',
    );
    const USER_POOL_ID = StringParameter.valueForStringParameter(this, '/vijaa/userpoolId');
    const userPol = UserPool.fromUserPoolId(this, 'UserPool', USER_POOL_ID);

    // Create the AppSync GraphQL API
    const api = new sst.AppSyncApi(this, 'graphql', {
      graphqlApi: {
        // schema: ['src/schema.graphql', 'src/schema2.graphql'],
        // schema: ['schema.graphql', 'src/form/form.graphql'],
        schema: schemas,
        authorizationConfig: {
          defaultAuthorization: {
            authorizationType: AuthorizationType.USER_POOL,
            userPoolConfig: {
              userPool: userPol,
              defaultAction: UserPoolDefaultAction.ALLOW,
            },
          },
          additionalAuthorizationModes: [
            {
              authorizationType: AuthorizationType.API_KEY,
              apiKeyConfig: {
                expires: Expiration.after(Duration.days(365)),
              },
            },
          ],
        },
      },
      defaultFunctionProps: {
        timeout: 20,
        environment: {
          SENDER_EMAIL: SENDER_EMAIL,
          DATABASE: `mongodb+srv://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@codemarket-staging.k16z7.mongodb.net/${scope.stage}?retryWrites=true&w=majority`,
          USER_POOL_ID: USER_POOL_ID,
        },
      },
      dataSources: dataSources,
      resolvers: { ...resolvers },
    });

    // // Enable the AppSync API to access the DynamoDB table
    api.attachPermissions(sst.PermissionType.ALL);

    // Show the AppSync API Id in the output
    this.addOutputs({
      ApiId: api.graphqlApi.apiId,
      GraphqlUrl: api.graphqlApi.graphqlUrl,
      // @ts-expect-error because some api will not have apiKey
      ApiKey: api.graphqlApi.apiKey,
    });
  }
}
