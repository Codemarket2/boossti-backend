import '../jest/jestSetup';
import { handler } from '../src/post';
import { User } from '../src/user/utils/userModel';
import { mockUser, createMockEvent } from '../jest/defaultArguments';

const mockPost = {
  _id: '60fc4d29f11b170008d9ec48',
  body: 'Hello Guys',
  media: [],
};
const updatedMockPost = {
  ...mockPost,
  body: 'Hello Guys, How are you all doing?',
};

const createPostEvent = createMockEvent('createPost', mockPost);

describe('Post Lambda Tests', () => {
  it('getMyPosts test', async () => {
    const res = await handler(createMockEvent('getMyPosts'));
    expect(res.count).toBe(0);
    expect(res.data.length).toBe(0);
  });

  it('getPostsByUserId test', async () => {
    await handler(createPostEvent);
    const user = await User.findOne({ userId: mockUser.userId });
    console.log('getPostsByUserId user', user);
    // const res = await handler(
    //   createMockEvent('getPostsByUserId', { userId: user._id })
    // );
    // expect(res.count).toBe(1);
    // expect(res.data.length).toBe(1);
    // const post = res.data[0];
    // expect(post.body).toBe(mockPost.body);
    // expect(post.media.length).toBe(mockPost.media.length);
    // expect(post.createdBy._id).toBeDefined();
    // expect(post.createdBy.name).toBe(mockUser.name);
    // expect(post.createdBy.picture).toBe(mockUser.picture);
  });

  it('getPosts test', async () => {
    const res = await handler(createMockEvent('getPosts'));
    expect(res.count).toBe(0);
    expect(res.data.length).toBe(0);
  });

  it('getPost test', async () => {
    await handler(createPostEvent);
    const post = await handler(
      createMockEvent('getPost', { _id: mockPost._id })
    );
    console.log('post', post);
    expect(post._id).toBeDefined();
    expect(post.body).toBe(mockPost.body);
    expect(post.media.length).toBe(mockPost.media.length);
    expect(post.createdBy._id).toBeDefined();
    expect(post.createdBy.name).toBe(mockUser.name);
    expect(post.createdBy.picture).toBe(mockUser.picture);
  });

  it('createPost test', async () => {
    const post = await handler(createPostEvent);
    expect(post._id).toBeDefined();
    expect(post.body).toBe(mockPost.body);
    expect(post.media.length).toBe(mockPost.media.length);
    expect(post.createdBy._id).toBeDefined();
    expect(post.createdBy.name).toBe(mockUser.name);
    expect(post.createdBy.picture).toBe(mockUser.picture);
  });

  it('updatePost test', async () => {
    await handler(createPostEvent);
    const post = await handler(createMockEvent('updatePost', updatedMockPost));
    expect(post._id).toBeDefined();
    expect(post.body).toBe(updatedMockPost.body);
    expect(post.media.length).toBe(updatedMockPost.media.length);
    expect(post.createdBy._id).toBeDefined();
    expect(post.createdBy.name).toBe(mockUser.name);
    expect(post.createdBy.picture).toBe(mockUser.picture);
  });

  it('deletePost test', async () => {
    await handler(createPostEvent);
    const res = await handler(
      createMockEvent('deletePost', { _id: mockPost._id })
    );
    expect(res).toBe(true);
  });
});
