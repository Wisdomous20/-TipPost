import { Header } from "./components/Header";
import { CreatePostForm } from "./components/CreatePostForm";
import { PostFeed } from "./components/PostFeed";
import { TxToast } from "./components/TxToast";
import { useWallet } from "./hooks/useWallet";
import { useContract } from "./hooks/useContract";

function App() {
  const { address, provider, isWrongNetwork, isConnecting, connect, switchToSepolia } = useWallet();
  const { posts, earnings, likedMap, txState, isLoading, createPost, likePost, clearTxState } = useContract(provider, address);
  const isReady = address && !isWrongNetwork;

  return (
    <div className="app">
      <Header address={address} earnings={earnings} isWrongNetwork={isWrongNetwork} isConnecting={isConnecting} onConnect={connect} onSwitchNetwork={switchToSepolia} />
      <main className="main">
        {!address && (
          <div className="connect-prompt">
            <h2>Welcome to TipPost</h2>
            <p>Connect your MetaMask wallet to create posts and tip creators with ETH.</p>
            <button className="btn btn-primary btn-lg" onClick={connect}>Connect Wallet</button>
          </div>
        )}
        {isWrongNetwork && address && (
          <div className="network-warning">
            <p>Please switch to the <strong>Sepolia</strong> test network to continue.</p>
            <button className="btn btn-warning" onClick={switchToSepolia}>Switch to Sepolia</button>
          </div>
        )}
        {isReady && (
          <>
            <CreatePostForm onSubmit={createPost} txState={txState} />
            <PostFeed posts={posts} userAddress={address} likedMap={likedMap} isLoading={isLoading} onLike={likePost} />
          </>
        )}
      </main>
      <TxToast txState={txState} onClear={clearTxState} />
    </div>
  );
}

export default App;