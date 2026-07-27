import { Command } from "commander";

const EXIT_FAILURE = 1;
const JSON_SPACES = 2;
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
 * Displays the active network configuration.
 * @param {object} options - CLI options.
 * @returns {Promise<void>} Resolves when the info is displayed.
 */
async function runNetworkInfo(
  options: { verbose?: boolean } = {},
): Promise<void> {
  try {
    const fs = (await import("fs-extra")).default || (await import("fs-extra"));
    const sessionFile = getSessionFilePath();

    if (!(await fs.pathExists(sessionFile))) {
      throw new Error(
        "No active wallet session found. Please run 'cmu wallet login' and then 'cmu network --use <name>'.",
      );
    }

    const session = await fs.readJson(sessionFile);
    if (!session.activeNetwork) {
      throw new Error(
        "No active network defined in session. Please run 'cmu network --use <name>' to select one.",
      );
    }

    const { loadNetworks } = await import("../utils/networkStorage");
    const networks = await loadNetworks();
    const activeNetwork = networks.find(
      (n: any) => n.name === session.activeNetwork,
    );

    if (!activeNetwork) {
      throw new Error(
        `Active network '${session.activeNetwork}' not found in saved networks. Please run 'cmu network --use <name>' to select a valid network.`,
      );
    }

    console.log("--- Active Network Info ---");
    console.log(`Network Name : ${activeNetwork.name}`);
    console.log(`RPC URL      : ${activeNetwork.rpcUrl}`);
    console.log("---------------------------");
  } catch (error) {
    console.error("\n\x1b[31m[!] Failed to retrieve network info:\x1b[0m");

    if (options.verbose) {
      console.error(error);
    } else {
      console.error(error instanceof Error ? error.message : String(error));
    }

    process.exit(EXIT_FAILURE);
  }
}

/**
 * Pings a network to check connectivity and latency.
 * @param {string} [name] - The name of the network to ping.
 * @param {object} options - CLI options.
 * @returns {Promise<void>} Resolves when the ping is completed.
 */
async function runNetworkPing(
  name?: string,
  options: { verbose?: boolean } = {},
): Promise<void> {
  try {
    const fs = (await import("fs-extra")).default || (await import("fs-extra"));
    const { loadNetworks } = await import("../utils/networkStorage");

    let rpcUrl = "";
    let networkName = "";

    if (name) {
      const networks = await loadNetworks();
      const network = networks.find((n: any) => n.name === name);
      if (!network) {
        throw new Error(`Network '${name}' not found.`);
      }
      rpcUrl = network.rpcUrl;
      networkName = network.name;
    } else {
      const sessionFile = getSessionFilePath();
      if (!(await fs.pathExists(sessionFile))) {
        throw new Error(
          "No active wallet session found. Please specify a network name or run 'cmu wallet login' first.",
        );
      }

      const session = await fs.readJson(sessionFile);
      if (!session.activeNetwork) {
        throw new Error("No active network defined in session.");
      }

      const networks = await loadNetworks();
      const activeNetwork = networks.find(
        (n: any) => n.name === session.activeNetwork,
      );

      if (!activeNetwork) {
        throw new Error(`Active network '${session.activeNetwork}' not found.`);
      }

      rpcUrl = activeNetwork.rpcUrl;
      networkName = activeNetwork.name;
    }

    console.log(`Pinging ${networkName} (${rpcUrl})...`);
    const { ethers } = await import("ethers");
    const provider = new ethers.JsonRpcProvider(rpcUrl);

    const startTime = Date.now();
    const blockNumber = await provider.getBlockNumber();
    const latency = Date.now() - startTime;

    console.log("--- Ping Results ---");
    console.log(`Network Name : ${networkName}`);
    console.log(`Block Number : ${blockNumber}`);
    console.log(`Latency      : ${latency}ms`);
    console.log("--------------------");
  } catch (error) {
    console.error("\n\x1b[31m[!] Failed to ping network:\x1b[0m");

    if (options.verbose) {
      console.error(error);
    } else {
      console.error(error instanceof Error ? error.message : String(error));
    }

    process.exit(EXIT_FAILURE);
  }
}

/**
 * Manages the local RPC networks configuration.
 * @param {object} options - CLI options.
 * @returns {Promise<void>} Resolves when the network management command is completed.
 */
async function runNetworkManage(options: {
  save?: string;
  name?: string;
  use?: string;
  list?: boolean;
  delete?: string;
  verbose?: boolean;
}): Promise<void> {
  try {
    const fs = (await import("fs-extra")).default || (await import("fs-extra"));
    const { loadNetworks, saveNetwork, deleteNetwork } =
      await import("../utils/networkStorage");
    const sessionFile = getSessionFilePath();

    if (options.save) {
      if (!options.name) {
        throw new Error("--name is required when using --save.");
      }
      await saveNetwork(options.name, options.save);
      console.log(
        `Successfully saved network '${options.name}' (${options.save})`,
      );
      return;
    }

    if (options.delete) {
      const networks = await loadNetworks();
      const targetName = options.delete;
      const network = networks.find((n: any) => n.name === targetName);

      if (!network) {
        throw new Error(`Network '${targetName}' not found.`);
      }

      if (await fs.pathExists(sessionFile)) {
        const session = await fs.readJson(sessionFile);
        if (session.activeNetwork === targetName) {
          throw new Error(
            `Cannot delete the currently active network ('${targetName}'). Please switch to another network first using 'cmu network --use <name>'.`,
          );
        }
      }

      const success = await deleteNetwork(targetName);
      if (success) {
        console.log(`Successfully deleted network '${targetName}'.`);
      } else {
        throw new Error(`Failed to delete network '${targetName}'.`);
      }
      return;
    }

    if (options.use) {
      const networks = await loadNetworks();
      const network = networks.find((n: any) => n.name === options.use);
      if (!network) {
        throw new Error(`Network '${options.use}' not found.`);
      }

      if (await fs.pathExists(sessionFile)) {
        const session = await fs.readJson(sessionFile);
        session.activeNetwork = options.use;
        await fs.writeJson(sessionFile, session, { spaces: JSON_SPACES });
        console.log(`Successfully switched active network to: ${network.name}`);
      } else {
        throw new Error(
          "No active wallet session found. Please run 'cmu wallet login' first.",
        );
      }
      return;
    }

    if (
      options.list ||
      Object.keys(options).length === 0 ||
      (Object.keys(options).length === 1 && options.verbose)
    ) {
      const networks = await loadNetworks();
      let activeNetworkName = "local";

      if (await fs.pathExists(sessionFile)) {
        const session = await fs.readJson(sessionFile);
        if (session.activeNetwork) {
          activeNetworkName = session.activeNetwork;
        }
      }

      console.log("\nSaved Networks");
      console.log(
        "==========================================================================",
      );
      console.log("| Active | Name                 | RPC URL");
      console.log(
        "--------------------------------------------------------------------------",
      );
      for (const net of networks) {
        const isActive = net.name === activeNetworkName ? "[*]   " : "      ";
        console.log(`| ${isActive} | ${net.name.padEnd(20)} | ${net.rpcUrl}`);
      }
      console.log(
        "==========================================================================\n",
      );
      return;
    }

    console.log(
      "Please provide a valid network command option. Run 'cmu network --help' for usage.",
    );
  } catch (error) {
    console.error("\n\x1b[31m[!] Network management failed:\x1b[0m");

    if (options.verbose) {
      console.error(error);
    } else {
      console.error(error instanceof Error ? error.message : String(error));
    }

    process.exit(EXIT_FAILURE);
  }
}

export const networkCommand = new Command("network")
  .description("Manage active RPC networks locally")
  .option("-s, --save <url>", "Save a new network or update an existing one")
  .option("-n, --name <name>", "The name of the network to save")
  .option("-u, --use <name>", "Switch the active network to the specified name")
  .option("-l, --list", "List all saved networks")
  .option("-D, --delete <name>", "Delete a saved network")
  .option("-v, --verbose", "Enable verbose logging for debugging")
  .action(runNetworkManage);

networkCommand
  .command("info")
  .description("Display the active network configuration")
  .option("-v, --verbose", "Enable verbose logging for debugging")
  .action(runNetworkInfo);

networkCommand
  .command("ping [name]")
  .description("Pings a network to check connectivity and latency")
  .option("-v, --verbose", "Enable verbose logging for debugging")
  .action(runNetworkPing);
