"use client";

import { useState } from "react";
import {
  getReceiptConfig,
  issueContributionReceipt,
  type ReceiptStage,
} from "../lib/receipt";

type ReceiptState =
  | { stage: "idle" }
  | { stage: ReceiptStage }
  | { stage: "confirmed"; transactionHash: string; blockNumber: string }
  | { stage: "rejected"; message: string }
  | { stage: "failed"; message: string };

const STAGE_LABELS: Record<ReceiptStage, string> = {
  connecting: "Connecting creator wallet…",
  switching_network: "Switching to Base Sepolia…",
  awaiting_signature: "Awaiting creator signature…",
  pending: "Transaction submitted · awaiting confirmation…",
};

export default function ReceiptPanel({ submission }: { submission: string }) {
  const config = getReceiptConfig();
  const [contributor, setContributor] = useState("");
  const [agreement, setAgreement] = useState(
    "Approved for inclusion in this creator world with visible contributor attribution; copyright is not transferred.",
  );
  const [approved, setApproved] = useState(false);
  const [state, setState] = useState<ReceiptState>({ stage: "idle" });

  const busy = [
    "connecting",
    "switching_network",
    "awaiting_signature",
    "pending",
  ].includes(state.stage);

  async function issueReceipt() {
    if (!approved) {
      setState({
        stage: "failed",
        message: "Creator approval is required before any wallet request.",
      });
      return;
    }

    try {
      const result = await issueContributionReceipt({
        contributor,
        content: submission,
        agreement,
        onStage: (stage) => setState({ stage }),
      });
      setState({
        stage: "confirmed",
        transactionHash: result.transactionHash,
        blockNumber: result.blockNumber.toString(),
      });
    } catch (error) {
      const name = error instanceof Error ? error.name : "";
      const rejected =
        name === "UserRejectedRequestError" ||
        (error as { code?: number })?.code === 4001;
      setState({
        stage: rejected ? "rejected" : "failed",
        message: rejected
          ? "The creator rejected the wallet request. Nothing was issued."
          : error instanceof Error
            ? error.message
            : "The receipt transaction ended without confirmation.",
      });
    }
  }

  return (
    <section className="receipt-panel" aria-label="Contribution receipt">
      <div className="receipt-heading">
        <div>
          <p>Creator approval gate</p>
          <h3>Portable attribution receipt</h3>
        </div>
        <span>Base Sepolia</span>
      </div>

      <label>
        Contributor wallet (optional)
        <input
          value={contributor}
          onChange={(event) => setContributor(event.target.value)}
          placeholder="0x…"
          spellCheck={false}
        />
      </label>
      <label>
        Approval and attribution terms
        <textarea
          value={agreement}
          onChange={(event) => setAgreement(event.target.value)}
          rows={4}
        />
      </label>
      <label className="approval-check">
        <input
          type="checkbox"
          checked={approved}
          onChange={(event) => setApproved(event.target.checked)}
        />
        <span>
          I approve this exact contribution and terms. The receipt does not
          transfer copyright.
        </span>
      </label>

      {!config.configured ? (
        <div className="receipt-state pending-setup">
          Contract deployment pending. No wallet request will be made.
        </div>
      ) : state.stage === "confirmed" ? (
        <div className="receipt-state confirmed">
          <b>Transaction confirmed ✓</b>
          <span>Block {state.blockNumber}</span>
          <a
            href={`https://sepolia.basescan.org/tx/${state.transactionHash}`}
            target="_blank"
            rel="noreferrer"
          >
            Verify on BaseScan
          </a>
        </div>
      ) : state.stage === "rejected" || state.stage === "failed" ? (
        <div className="receipt-state failed" role="alert">
          {state.message}
        </div>
      ) : state.stage !== "idle" ? (
        <div className="receipt-state">{STAGE_LABELS[state.stage]}</div>
      ) : null}

      <button
        type="button"
        className="receipt-action"
        disabled={!config.configured || !approved || busy}
        onClick={issueReceipt}
      >
        {busy ? "Receipt in progress…" : "Connect wallet & issue receipt"}
      </button>
    </section>
  );
}
