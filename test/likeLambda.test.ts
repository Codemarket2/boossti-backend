import "../jest/jestSetup";
import { handler } from "../src/like";
import { mockUser, createMockEvent } from "../jest/defaultArguments";

const mockLike = {
  _id: "60fc4d29f11b170008d92222",
  parentId: "60fc4d29f11b170008d9ec48",
};

const createLikeEvent = createMockEvent("createLike", mockLike);

describe("Like Lambda Tests", () => {
  it("getLike test", async () => {
    await handler(createLikeEvent);
    const like = await handler(
      createMockEvent("getLike", { _id: mockLike._id })
    );
    expect(like._id).toBeDefined();
    expect(like.parentId).toBeDefined();
    expect(like.createdAt).toBeDefined();
    expect(like.like).toBeDefined();
    expect(like.like).toBe(true);
    expect(like.createdBy._id).toStrictEqual(mockUser._id);
    expect(like.createdBy.name).toBe(mockUser.name);
  });

  it("getLikesByParentId test", async () => {
    await handler(createLikeEvent);
    const like = await handler(
      createMockEvent("getLikesByParentId", {
        parentId: mockLike.parentId,
      })
    );
    expect(like.data[0]._id).toBeDefined();
    expect(like.data[0].parentId).toBeDefined();
    expect(like.data[0].createdAt).toBeDefined();
    expect(like.data[0].like).toBeDefined();
    expect(like.data[0].like).toBe(true);
    expect(like.data[0].createdBy._id).toStrictEqual(mockUser._id);
    expect(like.data[0].createdBy.name).toBe(mockUser.name);
  });
  it("createLike test", async () => {
    const like = await handler(createLikeEvent);
    expect(like._id).toBeDefined();
    expect(like.parentId).toBeDefined();
    expect(like.like).toBeDefined();
    expect(like.like).toBe(true);
    expect(like.createdBy._id).toBeDefined();
    expect(like.createdAt).toBeDefined();
  });

  it("updateLike test", async () => {
    await handler(createLikeEvent);
    const like = await handler(
      createMockEvent("updateLike", { _id: mockLike._id })
    );
    expect(like._id).toBeDefined();
    expect(like.parentId).toBeDefined();
    expect(like.like).toBeDefined();
    expect(like.like).toBe(false);
    expect(like.createdBy._id).toBeDefined();
    expect(like.createdAt).toBeDefined();
  });

  it("deleteLike test", async () => {
    await handler(createLikeEvent);
    const res = await handler(
      createMockEvent("deleteLike", { _id: mockLike._id })
    );
    expect(res).toBe(true);
  });
});
