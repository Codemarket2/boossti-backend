import * as AWS from 'aws-sdk';

const { USER_POOL_ID } = process.env;

const cognitoIdp = new AWS.CognitoIdentityServiceProvider();

export const listUsersByEmail = async ({
  userPoolId,
  email,
}: {
  userPoolId: string;
  email: string;
}) => {
  const params = {
    UserPoolId: userPoolId,
    Filter: `email = "${email}"`,
  };

  return cognitoIdp.listUsers(params).promise();
};

export const adminLinkUserAccounts = async ({
  username,
  userPoolId,
  providerName,
  providerUserId,
}: {
  username: any;
  userPoolId: string;
  providerName: any;
  providerUserId: string;
}) => {
  const params = {
    DestinationUser: {
      ProviderAttributeValue: username,
      ProviderName: 'Cognito',
    },
    SourceUser: {
      ProviderAttributeName: 'Cognito_Subject',
      ProviderAttributeValue: providerUserId,
      ProviderName: providerName,
    },
    UserPoolId: userPoolId,
  };

  return cognitoIdp.adminLinkProviderForUser(params).promise();
};

export const adminCreateUser = async ({
  userPoolId,
  email,
  name,
  picture,
}: {
  userPoolId: string;
  email: string;
  name: string;
  picture: string;
}): Promise<AWS.CognitoIdentityServiceProvider.AdminCreateUserResponse> => {
  const params = {
    UserPoolId: userPoolId,
    // SUPRESS prevents sending an email with the temporary password
    // to the user on account creation
    MessageAction: 'SUPPRESS',
    Username: email,
    UserAttributes: [
      {
        Name: 'name',
        Value: name,
      },
      {
        Name: 'picture',
        Value: picture,
      },
      {
        Name: 'email',
        Value: email,
      },
      {
        Name: 'email_verified',
        Value: 'true',
      },
    ],
  };

  return cognitoIdp.adminCreateUser(params).promise();
};

function generatePassword(): string {
  return `${Math.random() // Generate random number, eg: 0.123456
    .toString(36) // Convert  to base-36 : "0.4fzyo82mvyr"
    .slice(-8)}42`; // Cut off last 8 characters : "yo82mvyr" and add a number, because the cognito password policy requires a number
}

export const adminSetUserPassword = async ({
  userPoolId,
  email,
}: {
  userPoolId: string;
  email: string;
}) => {
  const params = {
    Password: generatePassword(),
    UserPoolId: userPoolId,
    Username: email,
    Permanent: true,
  };

  return cognitoIdp.adminSetUserPassword(params).promise();
};

export const markUserEmailAsVerified = async (
  username: string,
  userPoolId: string
) => {
  const params = {
    UserAttributes: [
      {
        Name: 'email_verified',
        Value: 'true',
      },
    ],
    UserPoolId: userPoolId,
    Username: username,
  };

  return cognitoIdp.adminUpdateUserAttributes(params).promise();
};

export const adminToggleUserStatus = (username: string, status: boolean) => {
  const params: any = {
    UserPoolId: USER_POOL_ID,
    Username: username,
  };
  if (status) {
    return cognitoIdp.adminEnableUser(params).promise();
  }
  return cognitoIdp.adminDisableUser(params).promise();
};
