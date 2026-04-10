const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("TipPost", function () {
  let tipPost;
  let alice;
  let bob;

  const LIKE_COST = ethers.parseEther("0.0001");

  beforeEach(async function () {
    [, alice, bob] = await ethers.getSigners();
    const Factory = await ethers.getContractFactory("TipPost");
    tipPost = await Factory.deploy();
  });

  it("creates a post and emits PostCreated", async function () {
    const tx = await tipPost
      .connect(alice)
      .createPost("https://example.com/img.jpg", "Hello world");

    await expect(tx).to.emit(tipPost, "PostCreated");

    const posts = await tipPost.getAllPosts();
    expect(posts.length).to.equal(1);
    expect(posts[0].creator).to.equal(alice.address);
  });

  it("likes a post and transfers ETH to the creator", async function () {
    await tipPost.connect(alice).createPost("https://img.jpg", "Nice pic");

    const balanceBefore = await ethers.provider.getBalance(alice.address);
    const tx = await tipPost.connect(bob).likePost(1, { value: LIKE_COST });
    await expect(tx).to.emit(tipPost, "PostLiked");

    const balanceAfter = await ethers.provider.getBalance(alice.address);
    expect(balanceAfter - balanceBefore).to.equal(LIKE_COST);

    const posts = await tipPost.getAllPosts();
    expect(posts[0].likes).to.equal(1);
    expect(posts[0].totalEarned).to.equal(LIKE_COST);
  });

  it("rejects a double like", async function () {
    await tipPost.connect(alice).createPost("https://img.jpg", "Test");
    await tipPost.connect(bob).likePost(1, { value: LIKE_COST });

    await expect(
      tipPost.connect(bob).likePost(1, { value: LIKE_COST })
    ).to.be.revertedWith("Already liked this post");
  });

  it("rejects a self-like", async function () {
    await tipPost.connect(alice).createPost("https://img.jpg", "Mine");

    await expect(
      tipPost.connect(alice).likePost(1, { value: LIKE_COST })
    ).to.be.revertedWith("Cannot like your own post");
  });

  it("rejects insufficient ETH", async function () {
    await tipPost.connect(alice).createPost("https://img.jpg", "Cheap");

    await expect(
      tipPost.connect(bob).likePost(1, { value: ethers.parseEther("0.00001") })
    ).to.be.revertedWith("Insufficient ETH sent");
  });

  it("checkLiked returns correct status", async function () {
    await tipPost.connect(alice).createPost("https://img.jpg", "Check");
    expect(await tipPost.checkLiked(1, bob.address)).to.equal(false);
    await tipPost.connect(bob).likePost(1, { value: LIKE_COST });
    expect(await tipPost.checkLiked(1, bob.address)).to.equal(true);
  });
});