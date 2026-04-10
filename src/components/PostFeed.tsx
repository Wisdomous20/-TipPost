import React from "react";
import { PostCard } from "./PostCard";
import type { Post } from "../types";

interface Props {
  posts: Post[];
  userAddress: string | null;
  likedMap: Record<string, boolean>;
  isLoading: boolean;
  onLike: (postId: bigint) => Promise<void>;
}

export const PostFeed: React.FC<Props> = ({ posts, userAddress, likedMap, isLoading, onLike }) => {
  if (isLoading && posts.length === 0) {
    return (
      <div className="feed-status">
        <div className="spinner" />
        <p>Loading posts...</p>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="feed-status">
        <p className="feed-empty">No posts yet. Be the first to post!</p>
      </div>
    );
  }

  return (
    <section className="post-feed">
      {posts.map((post) => (
        <PostCard
          key={post.id.toString()}
          post={post}
          isOwner={userAddress?.toLowerCase() === post.creator.toLowerCase()}
          isLiked={likedMap[post.id.toString()] ?? false}
          onLike={onLike}
        />
      ))}
    </section>
  );
};