export const mockUserId = '7d8ca528-4931-4254-9273-ea5ee853f271';

export const mockEvent = {
  arguments: {},
  identity: {
    claims: {
      sub: mockUserId,
      issuer: 'cognito',
      username: mockUserId,
      claims: mockUserId,
      sourceIp: [],
      defaultAuthStrategy: mockUserId,
      groups: [],
    },
  },
};

export const mockUser = {
  name: 'Mr Robot',
  email: 'mrrobot@domain.com',
  picture:
    'https://codemarket-common-bucket.s3.amazonaws.com/public/defaults/pictures/default.jpg',
  userId: '7d8ca528-4931-4254-9273-ea5ee853f987',
};

export const createMockEvent = (fieldName: string, args: any = {}) => {
  return {
    ...mockEvent,
    info: { fieldName },
    arguments: args,
  };
};
