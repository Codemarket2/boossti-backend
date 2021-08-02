import * as mongoose from 'mongoose';
export const mockUserId = 'cd345194-e2bb-4f6f-af12-4669accd2cf2';
export const mock_id = '60fc4d29f11b170008d9ec48';

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
      'custom:_id': mock_id,
      name: 'Mr Robot',
      picture:
        'https://codemarket-common-bucket.s3.amazonaws.com/public/defaults/pictures/default.jpg',
    },
  },
};

export const mockUser = {
  _id: mongoose.Types.ObjectId(mock_id),
  name: 'Mr Robot',
  email: 'mrrobot@domain.com',
  picture:
    'https://codemarket-common-bucket.s3.amazonaws.com/public/defaults/pictures/default.jpg',
  userId: mockUserId + 'z',
  createdBy: mock_id,
};

export const createMockEvent = (fieldName: string, args: any = {}) => {
  return {
    ...mockEvent,
    info: { fieldName },
    arguments: args,
  };
};
