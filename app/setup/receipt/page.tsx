import type { Metadata } from "next";
import ReceiptDeploymentPanel from "./receipt-deployment-panel";

export const metadata: Metadata = {
  title: "Receipt Registry Setup · Loreline",
  description: "Deploy Loreline's contribution receipt registry to Base Sepolia.",
};

export default function ReceiptSetupPage() {
  return <ReceiptDeploymentPanel />;
}
