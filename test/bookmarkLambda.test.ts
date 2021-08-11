import '../jest/jestSetup';
import { handler } from '../src/bookmark';
import { createMockEvent } from '../jest/defaultArguments';

const mockBookmark = {
  _id: '60fc4d29f11b170008d9ec48',
  parentId: '1234',
  bookmark: 'Doctor John',
};

const createBookmarkEvent = createMockEvent('createBookmark', mockBookmark);

describe('Bookmark Lambda Tests', () => {
  it('getBookmark test', async () => {
    await handler(createBookmarkEvent);
    const bookmark = await handler(
      createMockEvent('getBookmark', { _id: mockBookmark._id })
    );
    expect(bookmark.parentId).toBe(mockBookmark.parentId);
    expect(bookmark.bookmark).toBe(mockBookmark.bookmark);
  });

  it('getMyBookmarks test', async () => {
    await handler(createBookmarkEvent);
    const res = await handler(createMockEvent('getMyBookmarks'));
    expect(res.count).toBe(1);
    expect(res.data.length).toBe(1);
    const bookmark = res.data[0];
    expect(bookmark.parentId).toBe(mockBookmark.parentId);
    expect(bookmark.bookmark).toBe(mockBookmark.bookmark);
  });

  it('createBookmark test', async () => {
    const bookmark = await handler(createBookmarkEvent);
    expect(bookmark.parentId).toBe(mockBookmark.parentId);
    expect(bookmark.bookmark).toBe(mockBookmark.bookmark);
  });

  it('deleteBookmark test', async () => {
    const bookmark = await handler(createBookmarkEvent);
    const res = await handler(
      createMockEvent('deleteBookmark', { _id: mockBookmark._id })
    );
    expect(res).toBe(true);
  });
});
