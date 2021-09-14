import '../jest/jestSetup';
import { handler } from '../src/comment';
import { mockUser, createMockEvent } from '../jest/defaultArguments';

const mockComment = {
  _id: '60fc4d29f11b170008d92222',
  parentId: '60fc4d29f11b170008d9ec48',
  body: 'Hello comment',
};
const updatedMockComment = {
  ...mockComment,
  body: 'Hello Guys, How are you all doing?',
};

const createCommentEvent = createMockEvent('createComment', mockComment);

describe('Comment Lambda Tests', () => {
  it('getComment test', async () => {
    await handler(createCommentEvent);
    const comment = await handler(
      createMockEvent('getComment', { _id: mockComment._id })
    );
    expect(comment._id).toBeDefined();
    expect(comment.parentId).toBeDefined();
    expect(comment.createdAt).toBeDefined();
    expect(comment.body).toBe(mockComment.body);
    expect(comment.createdBy._id).toStrictEqual(mockUser._id);
    expect(comment.createdBy.name).toBe(mockUser.name);
  });
  it('getCommentsByParentID test', async () => {
    await handler(createCommentEvent);
    const comment = await handler(
      createMockEvent('getCommentsByParentID', {
        parentId: mockComment.parentId,
      })
    );
    expect(comment.data[0]._id).toBeDefined();
    expect(comment.data[0].parentId).toBeDefined();
    expect(comment.data[0].createdAt).toBeDefined();
    expect(comment.data[0].body).toBe(mockComment.body);
    expect(comment.data[0].createdBy._id).toStrictEqual(mockUser._id);
    expect(comment.data[0].createdBy.name).toBe(mockUser.name);
  });

  it('createComment test', async () => {
    const comment = await handler(createCommentEvent);
    expect(comment._id).toBeDefined();
    expect(comment.parentId).toBeDefined();
    expect(comment.body).toBe(mockComment.body);
    expect(comment.createdBy._id).toBeDefined();
    expect(comment.createdAt).toBeDefined();
  });

  it('updateComment test', async () => {
    await handler(createCommentEvent);
    const comment = await handler(
      createMockEvent('updateComment', updatedMockComment)
    );
    expect(comment._id).toBeDefined();
    expect(comment.parentId).toBeDefined();
    expect(comment.body).toBe(updatedMockComment.body);
    expect(comment.createdBy._id).toBeDefined();
    expect(comment.createdAt).toBeDefined();
  });
  it('deleteComment test', async () => {
    await handler(createCommentEvent);
    const res = await handler(
      createMockEvent('deleteComment', { _id: mockComment._id })
    );
    expect(res).toBe(true);
  });
});
