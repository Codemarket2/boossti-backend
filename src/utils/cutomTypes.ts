import { AppSyncIdentityCognito } from 'aws-lambda';

export type AppSyncEvent = {
  info: {
    fieldName: string;
  };
  arguments: any;
  identity: {
    claims: AppSyncIdentityCognito;
  };
};
