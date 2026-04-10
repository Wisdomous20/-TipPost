import React from "react";

interface HeaderProps {
  address: string | null;
  earnings: string;
  isWrongNetwork: boolean;
  isConnecting: boolean;
  onConnect: () => void;
  onSwitchNetwork: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  address, earnings, isWrongNetwork, isConnecting, onConnect, onSwitchNetwork,
}) => {
  const truncated = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "";

  return (
    <header className="header">
      <div className="header-inner">
        <div className="logo">
          <span className="logo-icon">&#9830;</span>
          <h1>TipPost</h1>
        </div>
        <div className="header-right">
          {address && !isWrongNetwork && (
            <div className="earnings-badge">
              <span className="earnings-label">Earned</span>
              <span className="earnings-value">{parseFloat(earnings).toFixed(4)} ETH</span>
            </div>
          )}
          {isWrongNetwork && address && (
            <button className="btn btn-warning" onClick={onSwitchNetwork}>Switch to Sepolia</button>
          )}
          {!address ? (
            <button className="btn btn-primary" onClick={onConnect} disabled={isConnecting}>
              {isConnecting ? "Connecting..." : "Connect Wallet"}
            </button>
          ) : (
            <div className="wallet-address">{truncated}</div>
          )}
        </div>
      </div>
    </header>
  );
};