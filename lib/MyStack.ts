import * as sst from '@serverless-stack/resources';
import { StringParameter } from '@aws-cdk/aws-ssm';
import { AuthorizationType, UserPoolDefaultAction } from 'aws-cdk-lib/aws-appsync';
import { UserPool } from 'aws-cdk-lib/aws-cognito';
import { Expiration, Duration } from '@aws-cdk/core';
import dataSources from './dataSources';
import resolvers from './resolvers';
import schemas from './schemas';

export default class MyStack extends sst.Stack {
  constructor(scope: sst.App, id: string, props?: sst.StackProps) {
    super(scope, id, props);

    const SENDER_EMAIL = StringParameter.valueForStringParameter(this, '/boossti/sender-email');
    // const GRAPHQL_API_URL = StringParameter.valueForStringParameter(
    //   this,
    //   `/boossti/graphql-api-url/${scope.stage}`,
    // );
    // const GRAPHQL_API_KEY = StringParameter.valueForStringParameter(
    //   this,
    //   `/boossti/graphql-api-key/${scope.stage}`,
    // );
    const DISTRIBUTION_ID = StringParameter.valueForStringParameter(
      this,
      `/boossti/frontend/master/distribution-id`,
    );
    const FRONTEND_URL = StringParameter.valueForStringParameter(this, '/boossti/frontend-url');
    const EMAIL_VERIFICATION_API = StringParameter.valueForStringParameter(
      this,
      '/boossti/emailverification/apiKey',
    );
    const SNS_ORIGINAL_NUMBER = StringParameter.valueForStringParameter(
      this,
      '/codemarket/sns/originalNumber',
    );
    const USERS_FORM_SLUG = StringParameter.valueForStringParameter(
      this,
      '/boossti/form-slug/users',
    );
    const USER_POOL_ID = StringParameter.valueForStringParameter(this, '/boossti/userpool-id');
    const userPol = UserPool.fromUserPoolId(this, 'UserPool', USER_POOL_ID);

    // Create the AppSync GraphQL API
    const api = new sst.AppSyncApi(this, 'graphql', {
      graphqlApi: {
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
        timeout: 60,
        environment: {
          SENDER_EMAIL: SENDER_EMAIL || '',
          DATABASE: `mongodb+srv://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@codemarket-staging.k16z7.mongodb.net/${scope.stage}?retryWrites=true&w=majority`,
          USER_POOL_ID: USER_POOL_ID,
          SNS_ORIGINAL_NUMBER: SNS_ORIGINAL_NUMBER,
          GRAPHQL_API_URL: process.env.GRAPHQL_API_URL || '',
          GRAPHQL_API_KEY: process.env.GRAPHQL_API_KEY || '',
          ONESIGNAL_API_KEY: process.env.ONESIGNAL_API_KEY || '',
          ONESIGNAL_APP_ID: process.env.ONESIGNAL_APP_ID || '',
          DISTRIBUTION_ID: DISTRIBUTION_ID || '',
          FRONTEND_URL,
          STAGE: scope.stage,
          USERS_FORM_SLUG,
        },
      },
      dataSources: dataSources,
      resolvers: { ...resolvers },
    });

    const csvFunction = new sst.Function(this, 'MyApiLambda', {
      functionName: `${scope.stage}-write-csv-to-mongodb`,
      handler: 'src/contact/csvFileLambda.handler',
      memorySize: 4096,
      timeout: 900,
      environment: {
        EMAIL_VERIFICATION_API: EMAIL_VERIFICATION_API,
        DATABASE: `mongodb+srv://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@codemarket-staging.k16z7.mongodb.net/${scope.stage}?retryWrites=false&w=majority`,
      },
    });

    // // Enable the AppSync API to access the DynamoDB table
    api.attachPermissions(sst.PermissionType.ALL);
    csvFunction.attachPermissions(sst.PermissionType.ALL);

    // const graphqlApiUrl = new StringParameter(this, scope.stage, {
    //   parameterName: `/boossti/graphql-api-url/${scope.stage}`,
    //   stringValue: api.graphqlApi.graphqlUrl,
    //   description: 'Graphql api url',
    //   type: ParameterType.STRING,
    //   tier: ParameterTier.STANDARD,
    // });

    // const graphqlApiKey = new StringParameter(this, scope.stage, {
    //   parameterName: `/boossti/graphql-api-key/${scope.stage}`,
    //   stringValue: api.graphqlApi.graphqlUrl,
    //   description: 'Graphql api key',
    //   type: ParameterType.STRING,
    //   tier: ParameterTier.STANDARD,
    // });

    // Show the AppSync API Id in the output
    this.addOutputs({
      ApiId: api.graphqlApi.apiId,
      GraphqlUrl: api.graphqlApi.graphqlUrl,
      // @ts-expect-error because some api will not have apiKey
      ApiKey: api.graphqlApi.apiKey,
      FunctionName: csvFunction.functionName,
      // graphqlURL: graphqlURL.stringValue,
    });
  }
}
