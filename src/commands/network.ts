import { Command } from "commander";
import * as path from "path";
import * as fs from "fs-extra";
import {
  loadNetworks,
  saveNetwork,
  deleteNetwork,
} from "../utils/networkStorage";

const SESSION_FILE = path.resolve(process.cwd(), ".cmu-session");

export const networkCommand = new Command("network")
  .description("Manage active RPC networks locally")
  .option("-s, --save <url>", "Save a new network or update an existing one")
  .option("-n, --name <name>", "The name of the network to save")
  .option("-u, --use <name>", "Switch the active network to the specified name")
  .option("-l, --list", "List all saved networks")
  .option("-D, --delete <name>", "Delete a saved network");

networkCommand
  .command("info")
  .description("Display the active network configuration")
  .action(async () => {
    try {
      if (!(await fs.pathExists(SESSION_FILE))) {
        console.error("Warning: No active wallet session found.");
        console.log(
          "Please run 'cmu wallet login' and then 'cmu network --use <name>'.",
        );
        process.exit(1);
      }

      const session = await fs.readJson(SESSION_FILE);
      if (!session.activeNetwork) {
        console.error("Warning: No active network defined in session.");
        console.log("Please run 'cmu network --use <name>' to select one.");
        process.exit(1);
      }

      const networks = await loadNetworks();
      const activeNetwork = networks.find(
        (n) => n.name === session.activeNetwork,
      );

      if (!activeNetwork) {
        console.error(
          `Error: Active network '${session.activeNetwork}' not found in saved networks.`,
        );
        console.log(
          "Please run 'cmu network --use <name>' to select a valid network.",
        );
        process.exit(1);
      }

      console.log("--- Active Network Info ---");
      console.log(`Network Name : ${activeNetwork.name}`);
      console.log(`RPC URL      : ${activeNetwork.rpcUrl}`);
      console.log("---------------------------");
    } catch (error) {
      console.error(
        "Failed to retrieve network info:",
        error instanceof Error ? error.message : String(error),
      );
      process.exit(1);
    }
  });

networkCommand
  .command("ping [name]")
  .description("Pings a network to check connectivity and latency")
  .action(async (name?: string) => {
    try {
      let rpcUrl = "";
      let networkName = "";

      if (name) {
        const networks = await loadNetworks();
        const network = networks.find((n) => n.name === name);
        if (!network) {
          console.error(`Error: Network '${name}' not found.`);
          process.exit(1);
        }
        rpcUrl = network.rpcUrl;
        networkName = network.name;
      } else {
        if (!(await fs.pathExists(SESSION_FILE))) {
          console.error("Warning: No active wallet session found.");
          console.log(
            "Please specify a network name or run 'cmu wallet login' first.",
          );
          process.exit(1);
        }
        const session = await fs.readJson(SESSION_FILE);
        if (!session.activeNetwork) {
          console.error("Warning: No active network defined in session.");
          process.exit(1);
        }
        const networks = await loadNetworks();
        const activeNetwork = networks.find(
          (n) => n.name === session.activeNetwork,
        );
        if (!activeNetwork) {
          console.error(
            `Error: Active network '${session.activeNetwork}' not found.`,
          );
          process.exit(1);
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
      console.error(
        "Failed to ping network:",
        error instanceof Error ? error.message : String(error),
      );
      process.exit(1);
    }
  });

networkCommand.action(
  async (options: {
    save?: string;
    name?: string;
    use?: string;
    list?: boolean;
    delete?: string;
  }) => {
    try {
      if (options.save) {
        if (!options.name) {
          console.error("Error: --name is required when using --save.");
          process.exit(1);
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
        const network = networks.find((n) => n.name === targetName);

        if (!network) {
          console.error(`Error: Network '${targetName}' not found.`);
          process.exit(1);
        }

        if (await fs.pathExists(SESSION_FILE)) {
          const session = await fs.readJson(SESSION_FILE);
          if (session.activeNetwork === targetName) {
            console.error(
              `Error: Cannot delete the currently active network ('${targetName}').`,
            );
            console.log(
              "Please switch to another network first using 'cmu network --use <name>'.",
            );
            process.exit(1);
          }
        }

        const success = await deleteNetwork(targetName);
        if (success) {
          console.log(`Successfully deleted network '${targetName}'.`);
        } else {
          console.error(`Error: Failed to delete network '${targetName}'.`);
          process.exit(1);
        }
        return;
      }

      if (options.use) {
        const networks = await loadNetworks();
        const network = networks.find((n) => n.name === options.use);
        if (!network) {
          console.error(`Error: Network '${options.use}' not found.`);
          process.exit(1);
        }

        if (await fs.pathExists(SESSION_FILE)) {
          const session = await fs.readJson(SESSION_FILE);
          session.activeNetwork = options.use;
          await fs.writeJson(SESSION_FILE, session, { spaces: 2 });
          console.log(
            `Successfully switched active network to: ${network.name}`,
          );
        } else {
          console.error(
            "Warning: No active wallet session found. Please run 'cmu wallet login' first.",
          );
          process.exit(1);
        }
        return;
      }

      if (options.list || Object.keys(options).length === 0) {
        const networks = await loadNetworks();
        let activeNetworkName = "local";

        if (await fs.pathExists(SESSION_FILE)) {
          const session = await fs.readJson(SESSION_FILE);
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
      console.error(
        "Network management failed:",
        error instanceof Error ? error.message : String(error),
      );
      process.exit(1);
    }
  },
);
