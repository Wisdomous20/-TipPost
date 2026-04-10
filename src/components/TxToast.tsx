import React, { useEffect } from "react";
import type { TxState } from "../types";

interface Props {
  txState: TxState;
  onClear: () => void;
}

export const TxToast: React.FC<Props> = ({ txState, onClear }) => {
  useEffect(() => {
    if (txState.status === "success" || txState.status === "error") {
      const timer = setTimeout(onClear, 4000);
      return () => clearTimeout(timer);
    }
  }, [txState, onClear]);

  if (txState.status === "idle") return null;

  return (
    <div className={`toast toast-${txState.status}`}>
      <span className="toast-message">
        {txState.status === "pending" && <span className="spinner-sm" />}
        {txState.message}
      </span>
      {txState.status !== "pending" && (
        <button className="toast-close" onClick={onClear} aria-label="Dismiss">&times;</button>
      )}
    </div>
  );
};