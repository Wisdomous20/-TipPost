import { useState, useEffect, useCallback } from "react";
import { BrowserProvider } from "ethers";

const SEPOLIA_CHAIN_ID = import.meta.env.VITE_CHAIN_ID || "11155111";
const SEPOLIA_HEX = "0x" + parseInt(SEPOLIA_CHAIN_ID).toString(16);

export function useWallet() {
  const [address, setAddress] = useState<string | null>(null);
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const [isWrongNetwork, setIsWrongNetwork] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  const checkNetwork = useCallback(async () => {
    if (!window.ethereum) return;
    const chainId = (await window.ethereum.request({ method: "eth_chainId" })) as string;
    setIsWrongNetwork(chainId !== SEPOLIA_HEX);
  }, []);

  const switchToSepolia = useCallback(async () => {
    if (!window.ethereum) return;
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: SEPOLIA_HEX }],
      });
      setIsWrongNetwork(false);
    } catch (err) {
      console.error("Failed to switch network:", err);
    }
  }, []);

  const connect = useCallback(async () => {
    if (!window.ethereum) {
      alert("Please install MetaMask to use TipPost.");
      return;
    }
    setIsConnecting(true);
    try {
      const accounts = (await window.ethereum.request({
        method: "eth_requestAccounts",
      })) as string[];
      setProvider(new BrowserProvider(window.ethereum));
      setAddress(accounts[0]);
      await checkNetwork();
    } catch (err) {
      console.error("Connection rejected:", err);
    } finally {
      setIsConnecting(false);
    }
  }, [checkNetwork]);

  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccounts = (...args: unknown[]) => {
      const accounts = args[0] as string[];
      setAddress(accounts[0] || null);
      if (accounts[0]) setProvider(new BrowserProvider(window.ethereum));
    };

    const handleChain = () => {
      checkNetwork();
      setProvider(new BrowserProvider(window.ethereum));
    };

    window.ethereum.on("accountsChanged", handleAccounts);
    window.ethereum.on("chainChanged", handleChain);

    return () => {
      window.ethereum.removeListener("accountsChanged", handleAccounts);
      window.ethereum.removeListener("chainChanged", handleChain);
    };
  }, [checkNetwork]);

  useEffect(() => {
    if (!window.ethereum) return;
    (async () => {
      const accounts = (await window.ethereum.request({
        method: "eth_accounts",
      })) as string[];
      if (accounts.length > 0) {
        setAddress(accounts[0]);
        setProvider(new BrowserProvider(window.ethereum));
        checkNetwork();
      }
    })();
  }, [checkNetwork]);

  return { address, provider, isWrongNetwork, isConnecting, connect, switchToSepolia };
}