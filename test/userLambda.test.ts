import '../jest/jestSetup';
import { handler } from '../src/user';
import { mockUserId, mock_id, createMockEvent } from '../jest/defaultArguments';

export const newMockUser = {
  name: 'Mr Robot',
  email: 'mrrobot@domain.com',
  picture:
    'https://codemarket-common-bucket.s3.amazonaws.com/public/defaults/pictures/default.jpg',
  userId: mockUserId + 'z',
};

const updatedMockUser = {
  ...newMockUser,
  name: 'Elliot',
  email: 'elliot@domain.com',
};

const createUserEvent = createMockEvent('createUser', newMockUser);
const getUsersEvent = createMockEvent('getUsers');
const getUserByCognitoUserIdEvent = createMockEvent('getUserByCognitoUserId', {
  userId: newMockUser.userId,
});
const updateUserEvent = createMockEvent('updateUser', updatedMockUser);
const updateUserStatusEvent = createMockEvent('updateUserStatus', {
  ...newMockUser,
  status: false,
});

jest.mock('../src/user/utils/helper', () => {
  const adminToggleUserStatus = () => console.log('adminToggleUserStatus mock');
  return { adminToggleUserStatus };
});

describe('User Lambda Tests', () => {
  it('getUsers test', async () => {
    const users = await handler(getUsersEvent);
    expect(users.count).toBeGreaterThanOrEqual(0);
    expect(users.users.length).toBeGreaterThanOrEqual(0);
  });

  it('createUser test', async () => {
    const user = await handler(createUserEvent);
    expect(user._id).toBeDefined();
    expect(user.name).toBe(newMockUser.name);
    expect(user.email).toBe(newMockUser.email);
    expect(user.picture).toBe(newMockUser.picture);
    expect(user.userId).toBe(newMockUser.userId);
    expect(user.createdBy).toBe(mock_id);
    expect(user.active).toBe(true);
  });

  it('getUserByCognitoUserId test', async () => {
    await handler(createUserEvent);
    const user = await handler(getUserByCognitoUserIdEvent);
    expect(user._id).toBeDefined();
    expect(user.name).toBe(newMockUser.name);
    expect(user.email).toBe(newMockUser.email);
    expect(user.picture).toBe(newMockUser.picture);
    expect(user.userId).toBe(newMockUser.userId);
    expect(user.createdBy).toBe(mock_id);
    expect(user.active).toBe(true);
  });

  it('updateUser test', async () => {
    await handler(createUserEvent);
    const user = await handler(updateUserEvent);
    expect(user._id).toBeDefined();
    expect(user.name).toBe(updatedMockUser.name);
    expect(user.email).toBe(updatedMockUser.email);
    expect(user.picture).toBe(updatedMockUser.picture);
    expect(user.userId).toBe(updatedMockUser.userId);
    expect(user.createdBy).toBe(mock_id);
    expect(user.active).toBe(true);
  });

  it('updateUserStatus test', async () => {
    await handler(createUserEvent);
    const user = await handler(updateUserStatusEvent);
    expect(user._id).toBeDefined();
    expect(user.name).toBe(newMockUser.name);
    expect(user.email).toBe(newMockUser.email);
    expect(user.picture).toBe(newMockUser.picture);
    expect(user.userId).toBe(newMockUser.userId);
    expect(user.createdBy).toBe(mock_id);
    expect(user.active).toBe(false);
  });
});
