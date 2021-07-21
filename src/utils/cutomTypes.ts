interface AppSyncIdentityCognito {
  sub: string;
  issuer: string;
  username: string;
  claims: any;
  sourceIp: string[];
  defaultAuthStrategy: string;
  groups: string[] | null;
  'custom:_id': string;
  name: string;
  picture: string;
}

export type AppSyncEvent = {
  info: {
    fieldName: string;
  };
  arguments: any;
  identity: {
    claims: AppSyncIdentityCognito;
  };
};
