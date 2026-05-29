import { Command } from "commander";
import { loadConfig } from "../utils/config";

export const nodeCommand = new Command("node").description(
  "Node management commands",
);

nodeCommand
  .command("connect")
  .description(
    "Pings the RPC endpoint defined in the config to test network connection",
  )
  .action(async () => {
    try {
      let rpcUrl = "http://localhost:8545"; // Default

      try {
        const config = await loadConfig();
        if (config?.network?.rpcUrl) {
          rpcUrl = config.network.rpcUrl;
        }
      } catch (e) {
        // Fallback to default if config not found
      }

      console.log(`Pinging CointMU node at ${rpcUrl}...`);
      const { ethers } = require("ethers");
      const provider = new ethers.JsonRpcProvider(rpcUrl);
      const network = await provider.getNetwork();
      const blockNumber = await provider.getBlockNumber();

      console.log("Successfully connected to the CointMU node!");
      console.log(`Network Name: ${network.name}`);
      console.log(`Chain ID:     ${network.chainId}`);
      console.log(`Block Number: ${blockNumber}`);
    } catch (error) {
      console.error(
        "Failed to connect to the CointMU node. Is the node running?",
      );
      console.error(error);
      process.exit(1);
    }
  });
