import { useState, useEffect, useCallback } from "react";
import { Contract, BrowserProvider, formatEther, parseEther } from "ethers";
import ABI from "../abi/TipPost.json";
import type { Post, TxState } from "../types";

const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || "";
const LIKE_COST = parseEther("0.0001");

export function useContract(
  provider: BrowserProvider | null,
  userAddress: string | null
) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [earnings, setEarnings] = useState("0");
  const [likedMap, setLikedMap] = useState<Record<string, boolean>>({});
  const [txState, setTxState] = useState<TxState>({ status: "idle", message: "" });
  const [isLoading, setIsLoading] = useState(false);

  const getReadContract = useCallback(() => {
    if (!provider) return null;
    return new Contract(CONTRACT_ADDRESS, ABI, provider);
  }, [provider]);

  const getWriteContract = useCallback(async () => {
    if (!provider) return null;
    const signer = await provider.getSigner();
    return new Contract(CONTRACT_ADDRESS, ABI, signer);
  }, [provider]);

  const fetchPosts = useCallback(async () => {
    const contract = getReadContract();
    if (!contract) return;
    setIsLoading(true);
    try {
      const rawPosts: Post[] = await contract.getAllPosts();
      setPosts([...rawPosts].reverse());

      if (userAddress) {
        const liked: Record<string, boolean> = {};
        for (const post of rawPosts) {
          liked[post.id.toString()] = await contract.checkLiked(post.id, userAddress);
        }
        setLikedMap(liked);
      }
    } catch (err) {
      console.error("Error fetching posts:", err);
    } finally {
      setIsLoading(false);
    }
  }, [getReadContract, userAddress]);

  const fetchEarnings = useCallback(async () => {
    const contract = getReadContract();
    if (!contract || !userAddress) return;
    try {
      const earned = await contract.totalEarnedByUser(userAddress);
      setEarnings(formatEther(earned));
    } catch (err) {
      console.error("Error fetching earnings:", err);
    }
  }, [getReadContract, userAddress]);

  const handleTxError = useCallback((err: unknown) => {
    const msg = err instanceof Error ? err.message : "Transaction failed";
    if (msg.includes("user rejected")) {
      setTxState({ status: "error", message: "Transaction cancelled by user." });
    } else if (msg.includes("Already liked")) {
      setTxState({ status: "error", message: "You already liked this post." });
    } else if (msg.includes("Cannot like your own")) {
      setTxState({ status: "error", message: "You can't like your own post." });
    } else {
      setTxState({ status: "error", message: msg.slice(0, 120) });
    }
  }, []);

  const createPost = useCallback(
    async (imageUrl: string, caption: string) => {
      const contract = await getWriteContract();
      if (!contract) return;
      setTxState({ status: "pending", message: "Creating post..." });
      try {
        const tx = await contract.createPost(imageUrl, caption);
        await tx.wait();
        setTxState({ status: "success", message: "Post created!" });
      } catch (err) {
        handleTxError(err);
      }
    },
    [getWriteContract, handleTxError]
  );

  const likePost = useCallback(
    async (postId: bigint) => {
      const contract = await getWriteContract();
      if (!contract) return;
      setTxState({ status: "pending", message: "Sending tip..." });
      try {
        const tx = await contract.likePost(postId, { value: LIKE_COST });
        await tx.wait();
        setTxState({ status: "success", message: "Tip sent!" });
      } catch (err) {
        handleTxError(err);
      }
    },
    [getWriteContract, handleTxError]
  );

  const clearTxState = useCallback(() => {
    setTxState({ status: "idle", message: "" });
  }, []);

  useEffect(() => {
    const contract = getReadContract();
    if (!contract) return;

    const refresh = () => {
      fetchPosts();
      fetchEarnings();
    };

    contract.on("PostCreated", refresh);
    contract.on("PostLiked", refresh);

    return () => {
      contract.off("PostCreated", refresh);
      contract.off("PostLiked", refresh);
    };
  }, [getReadContract, fetchPosts, fetchEarnings]);

  useEffect(() => {
    fetchPosts();
    fetchEarnings();
  }, [fetchPosts, fetchEarnings]);

  return { posts, earnings, likedMap, txState, isLoading, createPost, likePost, clearTxState };
}