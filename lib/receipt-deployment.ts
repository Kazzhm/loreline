import {
  createPublicClient,
  createWalletClient,
  custom,
  http,
  type EIP1193Provider,
} from "viem";
import { baseSepolia } from "viem/chains";
import { receiptRegistryBytecode } from "./receipt-bytecode";
import { receiptRegistryAbi, type ReceiptStage } from "./receipt";

declare global {
  interface Window {
    ethereum?: EIP1193Provider;
  }
}

export async function deployReceiptRegistry(
  onStage: (stage: ReceiptStage) => void,
) {
  if (typeof window === "undefined" || !window.ethereum) {
    const error = new Error("Install or enable an EVM wallet to deploy the registry.");
    error.name = "WalletMissingError";
    throw error;
  }

  const walletClient = createWalletClient({
    chain: baseSepolia,
    transport: custom(window.ethereum),
  });
  onStage("connecting");
  const [account] = await walletClient.requestAddresses();
  if (!account) throw new Error("Wallet connection did not return an account.");

  const currentChainId = await walletClient.getChainId();
  if (currentChainId !== baseSepolia.id) {
    onStage("switching_network");
    try {
      await walletClient.switchChain({ id: baseSepolia.id });
    } catch (error) {
      if ((error as { code?: number })?.code !== 4902) throw error;
      await walletClient.addChain({ chain: baseSepolia });
      await walletClient.switchChain({ id: baseSepolia.id });
    }
  }

  onStage("awaiting_signature");
  const transactionHash = await walletClient.deployContract({
    account,
    abi: receiptRegistryAbi,
    bytecode: receiptRegistryBytecode,
    chain: baseSepolia,
  });
  onStage("pending");

  const publicClient = createPublicClient({
    chain: baseSepolia,
    transport: http(),
  });
  const receipt = await publicClient.waitForTransactionReceipt({
    hash: transactionHash,
    confirmations: 1,
  });
  if (receipt.status !== "success" || !receipt.contractAddress) {
    throw new Error("The deployment transaction did not create a contract.");
  }

  return {
    account,
    transactionHash,
    contractAddress: receipt.contractAddress,
    blockNumber: receipt.blockNumber,
  };
}
