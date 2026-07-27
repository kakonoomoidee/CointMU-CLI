import { Command } from "commander";

const EXIT_FAILURE = 1;
const MINER_THREAD_COUNT = 1;
const SESSION_FILE_NAME = ".cmu-session";

/**
 * Retrieves the session file path lazily.
 * @returns {string} The absolute path to the session file.
 */
function getSessionFilePath(): string {
  const path = require("path");
  return path.resolve(process.cwd(), SESSION_FILE_NAME);
}

/**
 * Starts the mining process on the active network.
 * @param {object} options - CLI options.
 * @returns {Promise<void>} Resolves when mining is started successfully.
 */
async function runMineStart(
  options: { verbose?: boolean } = {},
): Promise<void> {
  try {
    const fs = (await import("fs-extra")).default || (await import("fs-extra"));
    const sessionFile = getSessionFilePath();

    if (!(await fs.pathExists(sessionFile))) {
      throw new Error(
        "No active session found. Please run 'cmu wallet login' first.",
      );
    }

    const session = await fs.readJson(sessionFile);
    const { getDynamicNetwork } = await import("../utils/network");
    const { ethers } = await import("ethers");

    const network = await getDynamicNetwork(session.activeNetwork);
    const provider = new ethers.JsonRpcProvider(network.url);

    console.log(`Setting etherbase to ${session.address}...`);
    await provider.send("miner_setEtherbase", [session.address]);

    console.log(`Starting miner on ${network.name}...`);
    await provider.send("miner_start", [MINER_THREAD_COUNT]);

    console.log("Successfully started mining!");
    console.log(`Rewards are being routed to: ${session.address}`);
  } catch (error) {
    console.error("\n\x1b[31m[!] Failed to start mining:\x1b[0m");

    if (options.verbose) {
      console.error(error);
    } else {
      console.error(error instanceof Error ? error.message : String(error));
    }

    process.exit(EXIT_FAILURE);
  }
}

/**
 * Stops the mining process on the active network.
 * @param {object} options - CLI options.
 * @returns {Promise<void>} Resolves when mining is stopped successfully.
 */
async function runMineStop(options: { verbose?: boolean } = {}): Promise<void> {
  try {
    const fs = (await import("fs-extra")).default || (await import("fs-extra"));
    const sessionFile = getSessionFilePath();

    if (!(await fs.pathExists(sessionFile))) {
      throw new Error(
        "No active session found. Please run 'cmu wallet login' first.",
      );
    }

    const session = await fs.readJson(sessionFile);
    const { getDynamicNetwork } = await import("../utils/network");
    const { ethers } = await import("ethers");

    const network = await getDynamicNetwork(session.activeNetwork);
    const provider = new ethers.JsonRpcProvider(network.url);

    console.log(`Stopping miner on ${network.name}...`);
    await provider.send("miner_stop", []);

    console.log("Successfully stopped mining.");
  } catch (error) {
    console.error("\n\x1b[31m[!] Failed to stop mining:\x1b[0m");

    if (options.verbose) {
      console.error(error);
    } else {
      console.error(error instanceof Error ? error.message : String(error));
    }

    process.exit(EXIT_FAILURE);
  }
}

export const mineCommand = new Command("mine").description(
  "Mining control commands",
);

mineCommand
  .command("start")
  .description(
    "Starts mining blocks on the active network using the logged-in wallet",
  )
  .option("-v, --verbose", "Enable verbose logging for debugging")
  .action(runMineStart);

mineCommand
  .command("stop")
  .description("Stops mining blocks on the active network")
  .option("-v, --verbose", "Enable verbose logging for debugging")
  .action(runMineStop);
