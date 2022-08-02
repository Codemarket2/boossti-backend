import '../jest/jestSetup';
import { handler } from '../src/like';
import { mockUser, createMockEvent } from '../jest/defaultArguments';

const mockLike = {
  _id: '60fc4d29f11b170008d92222',
  threadId: '60fc4d29f11b170008d9ec48',
  like: true,
};

const createLikeEvent = createMockEvent('createLike', mockLike);

describe('Like Lambda Tests', () => {
  it('getLike test', async () => {
    await handler(createLikeEvent);
    const like = await handler(createMockEvent('getLike', { _id: mockLike._id }));
    expect(like._id).toBeDefined();
    expect(like.threadId).toBeDefined();
    expect(like.createdAt).toBeDefined();
    expect(like.like).toBeDefined();
    expect(like.like).toBe(true);
    expect(like.createdBy._id?.toString()).toStrictEqual(mockUser._id);
  });

  it('getLikesByThreadId test', async () => {
    await handler(createLikeEvent);
    const like = await handler(
      createMockEvent('getLikesByThreadId', {
        threadId: mockLike.threadId,
      }),
    );
    expect(like.data[0]._id).toBeDefined();
    expect(like.data[0].threadId).toBeDefined();
    expect(like.data[0].createdAt).toBeDefined();
    expect(like.data[0].like).toBeDefined();
    expect(like.data[0].like).toBe(true);
    expect(like.data[0].createdBy._id?.toString()).toStrictEqual(mockUser._id);
  });
  it('createLike test', async () => {
    const like = await handler(createLikeEvent);
    expect(like._id).toBeDefined();
    expect(like.threadId).toBeDefined();
    expect(like.like).toBeDefined();
    expect(like.like).toBe(true);
    expect(like.createdBy._id).toBeDefined();
    expect(like.createdAt).toBeDefined();
  });

  it('updateLike test', async () => {
    await handler(createLikeEvent);
    const like = await handler(createMockEvent('updateLike', { _id: mockLike._id, like: false }));
    expect(like._id).toBeDefined();
    expect(like.threadId).toBeDefined();
    expect(like.like).toBeDefined();
    expect(like.like).toBe(false);
    expect(like.createdBy._id).toBeDefined();
    expect(like.createdAt).toBeDefined();
  });

  it('deleteLike test', async () => {
    await handler(createLikeEvent);
    const res = await handler(createMockEvent('deleteLike', { threadId: mockLike.threadId }));
    expect(res?.toString()).toBe(mockLike._id);
  });
});
