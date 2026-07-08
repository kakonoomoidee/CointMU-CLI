import { Command } from "commander";
import * as path from "path";
import * as fs from "fs-extra";

const SESSION_FILE = path.resolve(process.cwd(), ".cmu-session");

export const mineCommand = new Command("mine").description(
  "Mining control commands",
);

mineCommand
  .command("start")
  .description(
    "Starts mining blocks on the active network using the logged-in wallet",
  )
  .action(async () => {
    try {
      if (!(await fs.pathExists(SESSION_FILE))) {
        console.error(
          "No active session found. Please run 'cmu wallet login' first.",
        );
        process.exit(1);
      }

      const session = await fs.readJson(SESSION_FILE);
      const { getDynamicNetwork } = await import("../utils/network");
      const { ethers } = await import("ethers");

      const network = await getDynamicNetwork(session.activeNetwork);
      const provider = new ethers.JsonRpcProvider(network.url);

      console.log(`Setting etherbase to ${session.address}...`);
      await provider.send("miner_setEtherbase", [session.address]);

      console.log(`Starting miner on ${network.name}...`);
      await provider.send("miner_start", [1]);

      console.log("Successfully started mining!");
      console.log(`Rewards are being routed to: ${session.address}`);
    } catch (error) {
      console.error(
        "Failed to start mining:",
        error instanceof Error ? error.message : String(error),
      );
      process.exit(1);
    }
  });

mineCommand
  .command("stop")
  .description("Stops mining blocks on the active network")
  .action(async () => {
    try {
      if (!(await fs.pathExists(SESSION_FILE))) {
        console.error(
          "No active session found. Please run 'cmu wallet login' first.",
        );
        process.exit(1);
      }

      const session = await fs.readJson(SESSION_FILE);
      const { getDynamicNetwork } = await import("../utils/network");
      const { ethers } = await import("ethers");

      const network = await getDynamicNetwork(session.activeNetwork);
      const provider = new ethers.JsonRpcProvider(network.url);

      console.log(`Stopping miner on ${network.name}...`);
      await provider.send("miner_stop", []);

      console.log("Successfully stopped mining.");
    } catch (error) {
      console.error(
        "Failed to stop mining:",
        error instanceof Error ? error.message : String(error),
      );
      process.exit(1);
    }
  });
