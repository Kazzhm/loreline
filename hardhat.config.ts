import { defineConfig } from "hardhat/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
  solidity: {
    version: "0.8.31",
    path: fileURLToPath(new URL("node_modules/solc/soljson.js", import.meta.url)),
    settings: {
      evmVersion: "paris",
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  test: {
    solidity: {
      isolate: true,
    },
  },
});
