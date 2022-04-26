import * as AWS from 'aws-sdk';
AWS.config.apiVersions = {
  cognitoidentityserviceprovider: '2016-04-18',
};
const cognitoidentityserviceprovider = new AWS.CognitoIdentityServiceProvider({
  region: 'us-east-1',
});

interface ICreateCognitoGroup {
  GroupName: string;
  UserPoolId: string;
  Description?: string;
  Precedence?: number;
  RoleArn?: string;
}

interface IDeleteCognitoGroup {
  GroupName: string;
  UserPoolId: string;
}

interface IGetGroupList {
  UserPoolId: string;
  Limit?: number;
  NextToken?: string;
}

interface IGetUserPoolList {
  MaxResults: number;
  NextToken?: string;
}

interface IGetUsersList {
  GroupName: string;
  UserPoolId: string;
  Limit?: number;
  NextToken?: string;
}

interface IAddRemoveUserToGroup {
  GroupName: string;
  UserPoolId: string;
  Username: string;
}

export const createCognitoGroup = async (payload: ICreateCognitoGroup) => {
  const params = {
    GroupName: payload.GroupName,
    UserPoolId: payload.UserPoolId,
    Description: payload.Description,
    Precedence: payload.Precedence,
    RoleArn: payload.RoleArn,
  };
  return cognitoidentityserviceprovider.createGroup(params).promise();
};

export const updateCognitoGroup = async (payload: ICreateCognitoGroup) => {
  const params = {
    GroupName: payload.GroupName,
    UserPoolId: payload.UserPoolId,
    Description: payload.Description,
    Precedence: payload.Precedence,
    RoleArn: payload.RoleArn,
  };
  return cognitoidentityserviceprovider.updateGroup(params).promise();
};

export const deleteCognitoGroup = async (payload: IDeleteCognitoGroup) => {
  const params = {
    GroupName: payload.GroupName,
    UserPoolId: payload.UserPoolId,
  };
  return cognitoidentityserviceprovider.deleteGroup(params).promise();
};

export const getGroupList = async (payload: IGetGroupList) => {
  const params = {
    UserPoolId: payload.UserPoolId,
    Limit: payload.Limit,
    NextToken: payload.NextToken,
  };
  return cognitoidentityserviceprovider.listGroups(params).promise();
};

export const getUserPoolsList = async (payload: IGetUserPoolList) => {
  const params = {
    MaxResults: payload.MaxResults,
    NextToken: payload.NextToken,
  };
  return cognitoidentityserviceprovider.listUserPools(params).promise();
};

export const getGroupUserList = async (payload: IGetUsersList) => {
  const params = {
    GroupName: payload.GroupName,
    UserPoolId: payload.UserPoolId,
    Limit: payload.Limit,
    NextToken: payload.NextToken,
  };
  return cognitoidentityserviceprovider.listUsersInGroup(params).promise();
};

export const addUserToGroup = async (payload: IAddRemoveUserToGroup) => {
  const params = {
    GroupName: payload.GroupName,
    UserPoolId: payload.UserPoolId,
    Username: payload.Username,
  };
  return cognitoidentityserviceprovider.adminAddUserToGroup(params).promise();
};
export const removeUserFromGroup = async (payload: IAddRemoveUserToGroup) => {
  const params = {
    GroupName: payload.GroupName,
    UserPoolId: payload.UserPoolId,
    Username: payload.Username,
  };
  return cognitoidentityserviceprovider.adminRemoveUserFromGroup(params).promise();
};

interface ICreateUser {
  UserPoolId: string;
  Username: string;
  DesiredDeliveryMediums?: any;
  UserAttributes?: { Name: string; value?: string }[];
  TemporaryPassword?: string;
}

export const createUser = async (payload: ICreateUser) => {
  const params = {
    UserPoolId: payload.UserPoolId,
    Username: payload.Username,
    DesiredDeliveryMediums: payload.DesiredDeliveryMediums,
    UserAttributes: payload.UserAttributes,
    TemporaryPassword: payload.TemporaryPassword,
  };

  return cognitoidentityserviceprovider.adminCreateUser(params).promise();
};
