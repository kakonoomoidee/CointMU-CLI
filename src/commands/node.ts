import { Command } from "commander";

const EXIT_SUCCESS = 0;
const EXIT_FAILURE = 1;
const DEFAULT_HOST = "127.0.0.1";
const DEFAULT_PORT = 8585;
const DEFAULT_CHAIN_ID = 1912;
const ACCOUNT_COUNT = 10;
const ACCOUNT_BALANCE = "100000000000000000000";
const MAX_PORT = 65535;

/**
 * Pings the configured RPC endpoint to test connectivity.
 * @param {object} options - CLI options.
 * @returns {Promise<void>} Resolves when connection succeeds.
 */
async function runNodeConnect(options: { network?: string }): Promise<void> {
  const isVerbose = nodeCommand.opts().verbose;
  try {
    const { getDynamicNetwork } = await import("../utils/network");
    const { ethers } = await import("ethers");

    const networkConfig = await getDynamicNetwork(options.network);
    const rpcUrl = networkConfig.url;

    console.log(`Pinging CointMU node at ${rpcUrl}...`);
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const network = await provider.getNetwork();
    const blockNumber = await provider.getBlockNumber();

    console.log("Successfully connected to the CointMU node!");
    console.log(`Network Name: ${network.name}`);
    console.log(`Chain ID:      ${network.chainId}`);
    console.log(`Block Number: ${blockNumber}`);
  } catch (error) {
    console.error(
      "\n\x1b[31m[!] Failed to connect to the CointMU node. Is the node running?\x1b[0m",
    );

    if (isVerbose) {
      console.error(error);
    } else {
      console.error(error instanceof Error ? error.message : String(error));
    }

    process.exit(EXIT_FAILURE);
  }
}

/**
 * Starts a local development network with pre-funded accounts.
 * @param {object} options - CLI options.
 * @returns {Promise<void>} Resolves when the dev node shuts down.
 */
async function runNodeStart(options: {
  host: string;
  port: string;
  mnemonic?: string;
  log?: boolean;
}): Promise<void> {
  const isVerbose = nodeCommand.opts().verbose;
  try {
    const { killPort } = await import("../utils/process");
    const parsedPort = parseInt(options.port, 10);
    const port = !isNaN(parsedPort) ? parsedPort : DEFAULT_PORT;

    if (isNaN(port) || port <= 0 || port > MAX_PORT) {
      throw new Error("Invalid port specified.");
    }

    await killPort(port);

    const suppressWarning = (args: any[]) => {
      if (isVerbose) return false;
      const msg = args.join(" ");
      return (
        msg.includes("uws_win32") ||
        msg.includes("Falling back to a NodeJS implementation") ||
        msg.includes("This version of \u00B5WS") ||
        msg.includes("This version of") ||
        msg.includes("uws-js-unofficial") ||
        msg.includes("Require stack:") ||
        msg.includes("Cannot find module") ||
        msg.includes("You are not inside a Hardhat project")
      );
    };

    const originalConsoleError = console.error;
    console.error = (...args: any[]) => {
      if (suppressWarning(args)) return;
      originalConsoleError(...args);
    };

    const originalConsoleWarn = console.warn;
    console.warn = (...args: any[]) => {
      if (suppressWarning(args)) return;
      originalConsoleWarn(...args);
    };

    const originalConsoleLog = console.log;

    const { ethers } = await import("ethers");
    const resolvedMnemonic =
      options.mnemonic || ethers.Wallet.createRandom().mnemonic?.phrase;

    const host = options.host;

    console.log = (...args: any[]) => {
      if (suppressWarning(args)) return;

      const msg = args.join(" ");

      // Intercept and format RPC logs if logging is enabled
      if (
        msg.includes("eth_") ||
        msg.includes("net_") ||
        msg.includes("web3_")
      ) {
        if (options.log) {
          const match = msg.match(/(eth_|net_|web3_)[a-zA-Z0-9_]+/);
          if (match) {
            originalConsoleLog(`[RPC] ${match[0]}`);
          } else {
            originalConsoleLog(`[RPC] ${msg.trim()}`);
          }
        }
        return;
      }

      // Suppress hardhat node default startup output to maintain our exact format
      if (
        msg.includes("Started HTTP and WebSocket JSON-RPC server at") ||
        msg.includes("Account #") ||
        msg.includes("Private Key:") ||
        msg.includes("WARNING: These accounts, and their private keys") ||
        msg.includes(
          "Any funds sent to them on Mainnet or any other live network WILL BE LOST.",
        ) ||
        msg.includes("hardhat_")
      ) {
        return;
      }

      originalConsoleLog(...args);
    };

    // Initialize Hardhat programmatically
    const importDynamic = new Function(
      "modulePath",
      "return import(modulePath)",
    );
    const hre =
      (await importDynamic("hardhat")).default ||
      (await importDynamic("hardhat"));

    if (!hre.config.networks) hre.config.networks = {};
    if (!hre.config.networks.hardhat)
      hre.config.networks.hardhat = { type: "hardhat" } as any;

    // Pass chainId, mnemonic, and pre-funded accounts natively to Hardhat provider configuration
    hre.config.networks.hardhat.chainId = DEFAULT_CHAIN_ID;
    hre.config.networks.hardhat.accounts = {
      mnemonic: resolvedMnemonic,
      accountsBalance: ACCOUNT_BALANCE,
      count: ACCOUNT_COUNT,
    };

    // Enable internal hardhat logging so we can intercept it, unless we are totally quiet
    hre.config.networks.hardhat.loggingEnabled = !!options.log || !!isVerbose;

    originalConsoleLog(
      `\nLocal CointMU DevNet is successfully running on http://${host}:${port}`,
    );
    originalConsoleLog(`Chain ID: ${DEFAULT_CHAIN_ID}\n`);
    originalConsoleLog(`Mnemonic: ${resolvedMnemonic}`);
    originalConsoleLog(
      `WARNING: This is a development mnemonic. DO NOT use it on a mainnet.\n`,
    );
    originalConsoleLog("Pre-funded Developer Accounts (100 ETH each):");
    originalConsoleLog(
      "===========================================================================================================",
    );
    originalConsoleLog(
      "| Index | Public Address                             | Private Key                                         |",
    );
    originalConsoleLog(
      "===========================================================================================================",
    );

    let index = 0;
    const mnemonicObj = ethers.Mnemonic.fromPhrase(resolvedMnemonic!);
    for (let i = 0; i < ACCOUNT_COUNT; i++) {
      const wallet = ethers.HDNodeWallet.fromMnemonic(
        mnemonicObj,
        `m/44'/60'/0'/0/${i}`,
      );
      originalConsoleLog(
        `| [${index}]   | ${wallet.address} | ${wallet.privateKey} |`,
      );
      index++;
    }
    originalConsoleLog(
      "===========================================================================================================\n",
    );

    process.on("SIGINT", () => {
      originalConsoleLog("\nShutting down CointMU DevNet...");
      originalConsoleLog("DevNet shutdown complete. Goodbye!");
      process.exit(EXIT_SUCCESS);
    });

    // Run the hardhat node natively
    await hre.tasks.getTask("node").run({
      hostname: host,
      port: port,
    });
  } catch (error) {
    console.error(
      "\n\x1b[31m[!] Failed to initialize the CointMU DevNet simulator:\x1b[0m",
    );

    if (isVerbose) {
      console.error(error);
    } else {
      console.error(error instanceof Error ? error.message : String(error));
    }

    process.exit(EXIT_FAILURE);
  }
}

export const nodeCommand = new Command("node")
  .description("Manages the local EVM node for development and testing")
  .option("-v, --verbose", "Enable verbose logging for all node commands");

nodeCommand
  .command("connect")
  .description("Pings the configured RPC endpoint to test connectivity")
  .option("-n, --network <name>", "Specify the network to connect to")
  .action(runNodeConnect);

nodeCommand
  .command("start")
  .description("Starts a local development network with pre-funded accounts")
  .option("--host <host>", "Host to bind the server to", DEFAULT_HOST)
  .option(
    "-p, --port <number>",
    "Port to bind the local EVM node to",
    String(DEFAULT_PORT),
  )
  .option(
    "-m, --mnemonic <phrase>",
    "12-word mnemonic seed phrase to generate deterministic accounts",
  )
  .option("-l, --log", "Enable real-time RPC transaction logging")
  .action(runNodeStart);
