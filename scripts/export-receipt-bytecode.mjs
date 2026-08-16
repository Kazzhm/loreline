import { readFile, writeFile } from "node:fs/promises";

const artifactUrl = new URL(
  "../artifacts/contracts/ContributionReceiptRegistry.sol/ContributionReceiptRegistry.json",
  import.meta.url,
);
const outputUrl = new URL("../lib/receipt-bytecode.ts", import.meta.url);
const artifact = JSON.parse(await readFile(artifactUrl, "utf8"));
if (typeof artifact.bytecode !== "string" || !artifact.bytecode.startsWith("0x")) {
  throw new Error("Compiled receipt bytecode is unavailable.");
}

const source = [
  "// Rebuild with `npm run contracts:bytecode` after changing the Solidity source.",
  `export const receiptRegistryBytecode = ${JSON.stringify(artifact.bytecode)} as const;`,
  "",
].join("\n");
await writeFile(outputUrl, source, "utf8");
