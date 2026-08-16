import {
  createPublicClient,
  createWalletClient,
  custom,
  http,
  isAddress,
  keccak256,
  stringToHex,
  zeroAddress,
  type Address,
  type EIP1193Provider,
  type Hash,
} from "viem";
import { baseSepolia } from "viem/chains";

declare global {
  interface Window {
    ethereum?: EIP1193Provider;
  }
}

export const receiptRegistryAbi = [
  {
    type: "function",
    name: "issueReceipt",
    stateMutability: "nonpayable",
    inputs: [
      { name: "contributor", type: "address" },
      { name: "contentDigest", type: "bytes32" },
      { name: "agreementDigest", type: "bytes32" },
    ],
    outputs: [{ name: "receiptId", type: "bytes32" }],
  },
] as const;

export type ReceiptStage =
  | "connecting"
  | "switching_network"
  | "awaiting_signature"
  | "pending";

export function getReceiptConfig() {
  const candidate = process.env.NEXT_PUBLIC_RECEIPT_CONTRACT_ADDRESS?.trim();
  return {
    configured: Boolean(candidate && isAddress(candidate)),
    address: candidate && isAddress(candidate) ? candidate : undefined,
    chain: baseSepolia,
  } as const;
}

export function prepareReceiptDigests(content: string, agreement: string) {
  const normalizedContent = content.trim().replace(/\r\n/g, "\n");
  const normalizedAgreement = agreement.trim().replace(/\r\n/g, "\n");
  if (normalizedContent.length < 12) {
    throw new TypeError("Approved contribution must be at least 12 characters.");
  }
  if (normalizedAgreement.length < 20) {
    throw new TypeError("Approval terms must be at least 20 characters.");
  }
  return {
    contentDigest: keccak256(stringToHex(normalizedContent)),
    agreementDigest: keccak256(stringToHex(normalizedAgreement)),
  } as const;
}

export async function issueContributionReceipt(input: {
  contributor?: string;
  content: string;
  agreement: string;
  onStage: (stage: ReceiptStage) => void;
}) {
  const config = getReceiptConfig();
  if (!config.configured || !config.address) {
    throw new Error("Receipt contract is not configured for this deployment.");
  }
  if (typeof window === "undefined" || !window.ethereum) {
    const error = new Error("Install or enable an EVM wallet to issue a receipt.");
    error.name = "WalletMissingError";
    throw error;
  }

  const contributor = input.contributor?.trim();
  if (contributor && !isAddress(contributor)) {
    throw new TypeError("Contributor wallet address is invalid.");
  }
  const digests = prepareReceiptDigests(input.content, input.agreement);
  const walletClient = createWalletClient({
    chain: baseSepolia,
    transport: custom(window.ethereum),
  });

  input.onStage("connecting");
  const [account] = await walletClient.requestAddresses();
  if (!account) throw new Error("Wallet connection did not return an account.");

  const currentChainId = await walletClient.getChainId();
  if (currentChainId !== baseSepolia.id) {
    input.onStage("switching_network");
    try {
      await walletClient.switchChain({ id: baseSepolia.id });
    } catch (error) {
      const code = (error as { code?: number })?.code;
      if (code !== 4902) throw error;
      await walletClient.addChain({ chain: baseSepolia });
      await walletClient.switchChain({ id: baseSepolia.id });
    }
  }

  input.onStage("awaiting_signature");
  const transactionHash = await walletClient.writeContract({
    account,
    address: config.address as Address,
    abi: receiptRegistryAbi,
    functionName: "issueReceipt",
    args: [
      (contributor || zeroAddress) as Address,
      digests.contentDigest,
      digests.agreementDigest,
    ],
    chain: baseSepolia,
  });

  input.onStage("pending");
  const publicClient = createPublicClient({
    chain: baseSepolia,
    transport: http(),
  });
  const receipt = await publicClient.waitForTransactionReceipt({
    hash: transactionHash,
    confirmations: 1,
  });
  if (receipt.status !== "success") {
    const error = new Error("The receipt transaction failed on-chain.");
    error.name = "TransactionFailedError";
    throw error;
  }

  return {
    account,
    transactionHash: transactionHash as Hash,
    blockNumber: receipt.blockNumber,
    ...digests,
  };
}
