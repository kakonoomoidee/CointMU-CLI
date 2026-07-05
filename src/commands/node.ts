import { Command } from "commander";

export const nodeCommand = new Command("node")
  .description("Manages the local EVM node for development and testing")
  .option("-v, --verbose", "Enable verbose logging for all node commands");

nodeCommand
  .command("connect")
  .description("Pings the configured RPC endpoint to test connectivity")
  .action(async () => {
    try {
      const { loadConfig } = await import("../utils/config");
      const { ethers } = await import("ethers");

      let rpcUrl = "http://localhost:8545";

      try {
        const config = await loadConfig();
        if (config?.network?.rpcUrl) {
          rpcUrl = config.network.rpcUrl;
        }
      } catch {
        // Fallback to default if config not found
      }

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
        "Failed to connect to the CointMU node. Is the node running?",
      );
      console.error(error);
      process.exit(1);
    }
  });

nodeCommand
  .command("start")
  .description("Starts a local development network with pre-funded accounts")
  .option("--host <host>", "Host to bind the server to", "127.0.0.1")
  .option(
    "-m, --mnemonic <phrase>",
    "12-word mnemonic seed phrase to generate deterministic accounts",
  )
  .option("-l, --log", "Enable real-time RPC transaction logging")
  .action(
    async (options: { host: string; mnemonic?: string; log?: boolean }) => {
      try {
        const suppressWarning = (args: any[]) => {
          const msg = args.join(" ");
          return (
            msg.includes("uws_win32") ||
            msg.includes("Falling back to a NodeJS implementation") ||
            msg.includes("This version of \u00B5WS") ||
            msg.includes("This version of") ||
            msg.includes("uws-js-unofficial") ||
            msg.includes("Require stack:") ||
            msg.includes("Cannot find module")
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
        console.log = (...args: any[]) => {
          if (suppressWarning(args)) return;
          originalConsoleLog(...args);
        };

        const ganache = require("ganache");
        const port = 8585;
        const chainId = 1912;
        const host = options.host;

        const serverOptions = {
          chain: {
            chainId: chainId,
          },
          server: {
            port: port,
            host: host,
          },
          wallet: {
            totalAccounts: 10,
            defaultBalance: 100,
            ...(options.mnemonic ? { mnemonic: options.mnemonic } : {}),
          },
          miner: {
            instamine: "strict",
          },
          logging: options.log
            ? {
                logger: {
                  log: (msg: string) => {
                    if (
                      msg.includes("eth_") ||
                      msg.includes("net_") ||
                      msg.includes("web3_")
                    ) {
                      console.log(`[RPC] ${msg}`);
                    }
                  },
                },
              }
            : { quiet: true },
        };

        const server = ganache.server(serverOptions);

        server.listen(port, async (err: Error | null) => {
          if (err) {
            console.error("Failed to start the CointMU DevNet:", err.message);
            process.exit(1);
          }

          const provider = server.provider;
          const initialAccounts = provider.getInitialAccounts();
          const activeMnemonic = provider.getOptions().wallet.mnemonic;

          console.log(
            `\nLocal CointMU DevNet is successfully running on http://${host}:${port}`,
          );
          console.log(`Chain ID: ${chainId}\n`);

          console.log(`Mnemonic: ${activeMnemonic}`);
          console.log(
            `WARNING: This is a development mnemonic. DO NOT use it on a mainnet.\n`,
          );

          console.log("Pre-funded Developer Accounts (100 ETH each):");
          console.log(
            "===========================================================================================================",
          );
          console.log(
            "| Index | Public Address                             | Private Key                                         |",
          );
          console.log(
            "===========================================================================================================",
          );

          let index = 0;
          for (const address of Object.keys(initialAccounts)) {
            const account = initialAccounts[address];
            console.log(`| [${index}]   | ${address} | ${account.secretKey} |`);
            index++;
          }
          console.log(
            "===========================================================================================================\n",
          );

          process.on("SIGINT", () => {
            console.log("\nShutting down CointMU DevNet...");
            server
              .close()
              .then(() => {
                console.log("DevNet shutdown complete. Goodbye!");
                process.exit(0);
              })
              .catch((closeErr: Error) => {
                console.error("Error during shutdown:", closeErr.message);
                process.exit(1);
              });
          });
        });
      } catch (error) {
        console.error(
          "Failed to initialize the CointMU DevNet simulator:",
          error instanceof Error ? error.message : String(error),
        );
        process.exit(1);
      }
    },
  );
