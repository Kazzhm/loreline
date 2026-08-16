"use client";

import { useState } from "react";
import Link from "next/link";
import { deployReceiptRegistry } from "../../../lib/receipt-deployment";
import type { ReceiptStage } from "../../../lib/receipt";

type DeploymentState =
  | { stage: "idle" }
  | { stage: ReceiptStage }
  | {
      stage: "confirmed";
      contractAddress: string;
      transactionHash: string;
      blockNumber: string;
    }
  | { stage: "failed"; message: string };

const LABELS: Record<ReceiptStage, string> = {
  connecting: "Connecting wallet…",
  switching_network: "Switching to Base Sepolia…",
  awaiting_signature: "Review and approve the deployment in your wallet…",
  pending: "Deployment submitted · awaiting confirmation…",
};

export default function ReceiptDeploymentPanel() {
  const [state, setState] = useState<DeploymentState>({ stage: "idle" });
  const busy = !["idle", "confirmed", "failed"].includes(state.stage);

  async function deploy() {
    try {
      const result = await deployReceiptRegistry((stage) => setState({ stage }));
      setState({
        stage: "confirmed",
        contractAddress: result.contractAddress,
        transactionHash: result.transactionHash,
        blockNumber: result.blockNumber.toString(),
      });
    } catch (error) {
      const rejected =
        (error as { code?: number })?.code === 4001 ||
        (error instanceof Error && error.name === "UserRejectedRequestError");
      setState({
        stage: "failed",
        message: rejected
          ? "Deployment was rejected. No contract was created."
          : error instanceof Error
            ? error.message
            : "Deployment ended without a confirmed contract.",
      });
    }
  }

  return (
    <main className="setup-page">
      <Link href="/" className="setup-back">← Loreline</Link>
      <div className="setup-card">
        <p className="section-kicker">Test-network setup</p>
        <h1>Deploy the receipt registry</h1>
        <p>
          This action deploys the audited local registry bytecode to Base
          Sepolia. It cannot deploy to mainnet and it never requests a wallet
          secret.
        </p>
        <ol>
          <li>Use an EVM wallet with Base Sepolia test ETH.</li>
          <li>Review the network and deployment transaction in the wallet.</li>
          <li>After confirmation, copy the public contract address into Vercel.</li>
        </ol>

        {state.stage === "confirmed" ? (
          <div className="deployment-result">
            <b>Contract confirmed ✓</b>
            <span>Address</span>
            <code>{state.contractAddress}</code>
            <span>Block {state.blockNumber}</span>
            <a
              href={`https://sepolia.basescan.org/address/${state.contractAddress}`}
              target="_blank"
              rel="noreferrer"
            >
              Verify contract on BaseScan
            </a>
          </div>
        ) : state.stage === "failed" ? (
          <div className="deployment-result failed" role="alert">
            {state.message}
          </div>
        ) : state.stage !== "idle" ? (
          <div className="deployment-result">{LABELS[state.stage]}</div>
        ) : null}

        <button type="button" onClick={deploy} disabled={busy}>
          {busy ? "Deployment in progress…" : "Connect wallet & deploy to Base Sepolia"}
        </button>
      </div>
    </main>
  );
}
