// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract TipPost {
    uint256 public constant LIKE_COST = 0.001 ether;
    uint256 public postCount;

    struct Post {
        uint256 id;
        address creator;
        string imageUrl;
        string caption;
        uint256 likes;
        uint256 totalEarned;
        uint256 timestamp;
    }

    // All posts keyed by sequential id (1-indexed).
    mapping(uint256 => Post) public posts;

    // Nested mapping prevents double-liking: postId => liker => bool.
    mapping(uint256 => mapping(address => bool)) public hasLiked;

    // Running total of ETH earned per creator address.
    mapping(address => uint256) public totalEarnedByUser;

    event PostCreated(
        uint256 indexed id,
        address indexed creator,
        string imageUrl,
        string caption,
        uint256 timestamp
    );

    event PostLiked(
        uint256 indexed id,
        address indexed liker,
        address indexed creator,
        uint256 totalLikes,
        uint256 tipAmount
    );

    function createPost(string calldata _imageUrl, string calldata _caption) external {
        require(bytes(_imageUrl).length > 0, "Image URL cannot be empty");
        require(bytes(_caption).length > 0, "Caption cannot be empty");

        postCount++;
        posts[postCount] = Post({
            id: postCount,
            creator: msg.sender,
            imageUrl: _imageUrl,
            caption: _caption,
            likes: 0,
            totalEarned: 0,
            timestamp: block.timestamp
        });

        emit PostCreated(postCount, msg.sender, _imageUrl, _caption, block.timestamp);
    }

    function likePost(uint256 _postId) external payable {
        require(_postId > 0 && _postId <= postCount, "Post does not exist");
        require(msg.value >= LIKE_COST, "Insufficient ETH sent");
        require(!hasLiked[_postId][msg.sender], "Already liked this post");

        Post storage post = posts[_postId];
        require(post.creator != msg.sender, "Cannot like your own post");

        hasLiked[_postId][msg.sender] = true;
        post.likes++;
        post.totalEarned += msg.value;
        totalEarnedByUser[post.creator] += msg.value;

        (bool sent, ) = payable(post.creator).call{value: msg.value}("");
        require(sent, "ETH transfer failed");

        emit PostLiked(_postId, msg.sender, post.creator, post.likes, msg.value);
    }

    function getAllPosts() external view returns (Post[] memory) {
        Post[] memory allPosts = new Post[](postCount);
        for (uint256 i = 1; i <= postCount; i++) {
            allPosts[i - 1] = posts[i];
        }
        return allPosts;
    }

    function checkLiked(uint256 _postId, address _user) external view returns (bool) {
        return hasLiked[_postId][_user];
    }
}