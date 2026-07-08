import { Command } from "commander";
import * as path from "path";
import * as fs from "fs-extra";
import * as crypto from "crypto";

const SESSION_FILE = path.resolve(process.cwd(), ".cmu-session");
const ALGORITHM = "aes-256-cbc";

export const walletCommand = new Command("wallet").description(
  "Wallet management commands",
);

walletCommand
  .command("create")
  .description("Generates a new, secure EVM-compatible wallet")
  .action(async () => {
    try {
      const { ethers } = await import("ethers");
      const wallet = ethers.Wallet.createRandom();
      console.log("New CointMU Wallet Created:");
      console.log("===========================");
      console.log(`Public Address: ${wallet.address}`);
      console.log(`Private Key:    ${wallet.privateKey}`);
      if (wallet.mnemonic) {
        console.log(`Mnemonic:       ${wallet.mnemonic.phrase}`);
      }
      console.log("===========================");
      console.log(
        "\n[WARNING] Please copy and back up your Private Key and Mnemonic phrase immediately!",
      );
      console.log(
        "Store them in a highly secure, offline location. If you lose them, your assets cannot be recovered.\n",
      );
      console.log(
        "To start an encrypted local session with this new wallet, run:",
      );
      console.log("  cmu wallet login");
    } catch (error) {
      console.error(
        "Failed to create wallet:",
        error instanceof Error ? error.message : String(error),
      );
      process.exit(1);
    }
  });

walletCommand
  .command("login")
  .description("Securely log into your wallet and create an encrypted session")
  .action(async () => {
    try {
      const inquirer = (await import("inquirer")).default;
      const { ethers } = await import("ethers");

      const answers = await inquirer.prompt([
        {
          type: "password",
          name: "privateKey",
          message: "Enter your Private Key:",
          mask: "*",
          validate: (input: string) => {
            try {
              new ethers.Wallet(input);
              return true;
            } catch {
              return "Invalid Private Key format.";
            }
          },
        },
        {
          type: "password",
          name: "password",
          message: "Create a session password to encrypt your key:",
          mask: "*",
          validate: (input: string) =>
            input.length >= 6 || "Password must be at least 6 characters long.",
        },
      ]);

      const wallet = new ethers.Wallet(answers.privateKey);

      const salt = crypto.randomBytes(16);
      const key = crypto.pbkdf2Sync(
        answers.password,
        salt,
        100000,
        32,
        "sha256",
      );
      const iv = crypto.randomBytes(16);
      const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

      let encryptedKey = cipher.update(answers.privateKey, "utf8", "hex");
      encryptedKey += cipher.final("hex");

      const sessionData = {
        address: wallet.address,
        activeNetwork: "local",
        encryptedKey,
        salt: salt.toString("hex"),
        iv: iv.toString("hex"),
      };

      await fs.writeJson(SESSION_FILE, sessionData, { spaces: 2 });
      console.log("Wallet session encrypted and saved successfully!");
      console.log(`Logged in as: ${wallet.address}`);
    } catch (error) {
      console.error(
        "Login failed:",
        error instanceof Error ? error.message : String(error),
      );
      process.exit(1);
    }
  });

walletCommand
  .command("balance")
  .description(
    "Fetch and display the native token balance of the logged-in wallet",
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

      console.log(`Connecting to ${network.name} (${network.url})...`);
      const balance = await provider.getBalance(session.address);

      console.log("---------------------------");
      console.log(`Address: ${session.address}`);
      console.log(`Balance: ${ethers.formatEther(balance)} ETH`);
      console.log("---------------------------");
    } catch (error) {
      console.error(
        "Failed to fetch balance:",
        error instanceof Error ? error.message : String(error),
      );
      process.exit(1);
    }
  });

walletCommand
  .command("info")
  .description("Display the current active wallet session information")
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
      const network = await getDynamicNetwork(session.activeNetwork);

      console.log("--- Active Session Info ---");
      console.log(`Public Address: ${session.address}`);
      console.log(`Active Network: ${network.name}`);
      console.log(`RPC Endpoint:   ${network.url}`);
      console.log("---------------------------");
    } catch (error) {
      console.error(
        "Failed to retrieve session info:",
        error instanceof Error ? error.message : String(error),
      );
      process.exit(1);
    }
  });
