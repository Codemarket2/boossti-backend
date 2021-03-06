import * as AWS from 'aws-sdk';

const cognitoidentityserviceprovider = new AWS.CognitoIdentityServiceProvider({
  apiVersion: '2016-04-18',
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
