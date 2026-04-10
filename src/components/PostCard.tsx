import React, { useState } from "react";
import { formatEther } from "ethers";
import type { Post } from "../types";

interface Props {
  post: Post;
  isOwner: boolean;
  isLiked: boolean;
  onLike: (postId: bigint) => Promise<void>;
}

function getTimeAgo(ms: number): string {
  const s = Math.floor((Date.now() - ms) / 1000);
  if (s < 60) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export const PostCard: React.FC<Props> = ({ post, isOwner, isLiked, onLike }) => {
  const [imgError, setImgError] = useState(false);
  const [isLiking, setIsLiking] = useState(false);

  const handleLike = async () => {
    setIsLiking(true);
    await onLike(post.id);
    setIsLiking(false);
  };

  const earned = parseFloat(formatEther(post.totalEarned)).toFixed(4);
  const creator = `${post.creator.slice(0, 6)}...${post.creator.slice(-4)}`;
  const time = getTimeAgo(Number(post.timestamp) * 1000);

  return (
    <article className="post-card">
      <div className="post-image-wrapper">
        {imgError ? (
          <div className="post-image-fallback">Image unavailable</div>
        ) : (
          <img src={post.imageUrl} alt={post.caption} className="post-image" onError={() => setImgError(true)} loading="lazy" />
        )}
      </div>
      <div className="post-body">
        <p className="post-caption">{post.caption}</p>
        <div className="post-meta">
          <span className="post-creator" title={post.creator}>{creator}</span>
          <span className="post-time">{time}</span>
        </div>
        <div className="post-actions">
          <button
            className={`btn-like ${isLiked ? "liked" : ""} ${isOwner ? "disabled-owner" : ""}`}
            onClick={handleLike}
            disabled={isOwner || isLiked || isLiking}
            title={isOwner ? "Can't like your own post" : isLiked ? "Already liked" : "Like & tip 0.0001 ETH"}
            aria-label={`Like post by ${creator}`}
          >
            {isLiking ? "..." : isLiked ? "❤️" : "🤍"} {post.likes.toString()}
          </button>
          <span className="post-earned">{earned} ETH earned</span>
        </div>
      </div>
    </article>
  );
};