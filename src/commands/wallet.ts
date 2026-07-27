import { Command } from "commander";

const EXIT_FAILURE = 1;
const ALGORITHM = "aes-256-cbc";
const SESSION_FILE_NAME = ".cmu-session";
const SALT_BYTES = 16;
const PBKDF2_ITERATIONS = 100000;
const KEY_LENGTH = 32;
const DIGEST = "sha256";
const IV_BYTES = 16;
const MIN_PASSWORD_LENGTH = 6;
const JSON_SPACES = 2;

/**
 * Retrieves the session file path lazily.
 * @returns {string} The absolute path to the session file.
 */
function getSessionFilePath(): string {
  const path = require("path");
  return path.resolve(process.cwd(), SESSION_FILE_NAME);
}

/**
 * Generates a new, secure EVM-compatible wallet.
 * @param {object} options - CLI options.
 * @returns {Promise<void>}
 */
async function runWalletCreate(
  options: { verbose?: boolean } = {},
): Promise<void> {
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
    console.error("\n\x1b[31m[!] Failed to create wallet:\x1b[0m");
    if (options.verbose) {
      console.error(error);
    } else {
      console.error(error instanceof Error ? error.message : String(error));
    }
    process.exit(EXIT_FAILURE);
  }
}

/**
 * Securely log into a wallet and create an encrypted session.
 * @param {object} options - CLI options.
 * @returns {Promise<void>}
 */
async function runWalletLogin(
  options: { verbose?: boolean } = {},
): Promise<void> {
  try {
    const inquirer = (await import("inquirer")).default;
    const { ethers } = await import("ethers");
    const crypto = await import("crypto");
    const fs = (await import("fs-extra")).default || (await import("fs-extra"));

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
          input.length >= MIN_PASSWORD_LENGTH ||
          `Password must be at least ${MIN_PASSWORD_LENGTH} characters long.`,
      },
    ]);

    const wallet = new ethers.Wallet(answers.privateKey);

    const salt = crypto.randomBytes(SALT_BYTES);
    const key = crypto.pbkdf2Sync(
      answers.password,
      salt,
      PBKDF2_ITERATIONS,
      KEY_LENGTH,
      DIGEST,
    );
    const iv = crypto.randomBytes(IV_BYTES);
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

    const sessionFile = getSessionFilePath();
    await fs.writeJson(sessionFile, sessionData, { spaces: JSON_SPACES });
    console.log("Wallet session encrypted and saved successfully!");
    console.log(`Logged in as: ${wallet.address}`);
  } catch (error) {
    console.error("\n\x1b[31m[!] Login failed:\x1b[0m");
    if (options.verbose) {
      console.error(error);
    } else {
      console.error(error instanceof Error ? error.message : String(error));
    }
    process.exit(EXIT_FAILURE);
  }
}

/**
 * Fetch and display the native token balance of the logged-in wallet.
 * @param {object} options - CLI options.
 * @returns {Promise<void>}
 */
async function runWalletBalance(
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

    console.log(`Connecting to ${network.name} (${network.url})...`);
    const balance = await provider.getBalance(session.address);

    console.log("---------------------------");
    console.log(`Address: ${session.address}`);
    console.log(`Balance: ${ethers.formatEther(balance)} ETH`);
    console.log("---------------------------");
  } catch (error) {
    console.error("\n\x1b[31m[!] Failed to fetch balance:\x1b[0m");
    if (options.verbose) {
      console.error(error);
    } else {
      console.error(error instanceof Error ? error.message : String(error));
    }
    process.exit(EXIT_FAILURE);
  }
}

/**
 * Display the current active wallet session information.
 * @param {object} options - CLI options.
 * @returns {Promise<void>}
 */
async function runWalletInfo(
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
    const network = await getDynamicNetwork(session.activeNetwork);

    console.log("--- Active Session Info ---");
    console.log(`Public Address: ${session.address}`);
    console.log(`Active Network: ${network.name}`);
    console.log(`RPC Endpoint:   ${network.url}`);
    console.log("---------------------------");
  } catch (error) {
    console.error("\n\x1b[31m[!] Failed to retrieve session info:\x1b[0m");
    if (options.verbose) {
      console.error(error);
    } else {
      console.error(error instanceof Error ? error.message : String(error));
    }
    process.exit(EXIT_FAILURE);
  }
}

export const walletCommand = new Command("wallet").description(
  "Wallet management commands",
);

walletCommand
  .command("create")
  .description("Generates a new, secure EVM-compatible wallet")
  .option("-v, --verbose", "Enable verbose logging for debugging")
  .action(runWalletCreate);

walletCommand
  .command("login")
  .description("Securely log into your wallet and create an encrypted session")
  .option("-v, --verbose", "Enable verbose logging for debugging")
  .action(runWalletLogin);

walletCommand
  .command("balance")
  .description(
    "Fetch and display the native token balance of the logged-in wallet",
  )
  .option("-v, --verbose", "Enable verbose logging for debugging")
  .action(runWalletBalance);

walletCommand
  .command("info")
  .description("Display the current active wallet session information")
  .option("-v, --verbose", "Enable verbose logging for debugging")
  .action(runWalletInfo);
