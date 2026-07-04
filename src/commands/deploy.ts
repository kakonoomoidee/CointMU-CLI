import { Command } from "commander";
import * as path from "path";

/**
 * Executes a deployment script using child_process.execSync.
 * @param {string} scriptPath - The absolute path to the script to execute.
 * @param {Record<string, string | undefined>} env - Environment variables to inject.
 * @returns {void}
 */
function runDeployScript(
  scriptPath: string,
  env: Record<string, string | undefined>,
): void {
  const { execFileSync } = require("child_process");
  const ext = path.extname(scriptPath);
  const isWin = process.platform === "win32";
  const runner = ext === ".ts" ? "npx" : "node";
  const args = ext === ".ts" ? ["ts-node", scriptPath] : [scriptPath];

  console.log(`\n========================================`);
  console.log(`Executing: ${path.basename(scriptPath)}`);
  console.log(`========================================\n`);

  execFileSync(runner, args, {
    stdio: "inherit",
    env,
    shell: isWin,
  });
}

/**
 * Masks a private key for secure console output.
 * @param {string} pk - The private key to mask.
 * @returns {string} The masked private key.
 */
function maskPrivateKey(pk: string): string {
  if (pk.length < 10) return "***";
  return `${pk.substring(0, 5)}...${pk.substring(pk.length - 4)}`;
}

export const deployCommand = new Command("deploy")
  .description(
    "Sequentially executes all deployment scripts in the deploy/ directory",
  )
  .option(
    "-c, --config",
    "Display the current deployment configuration and exit",
  )
  .action(async (options: { config?: boolean }) => {
    try {
      const fs = require("fs-extra");
      const deployDir = path.resolve(process.cwd(), "deploy");

      if (!(await fs.pathExists(deployDir))) {
        console.error(`Error: 'deploy' directory not found at ${deployDir}.`);
        console.error(
          `Please run this command from the root of your CointMU project.`,
        );
        process.exit(1);
      }

      require("dotenv").config({ path: path.resolve(process.cwd(), ".env") });

      let config;
      const tsConfigPath = path.resolve(process.cwd(), "cmu.config.ts");
      const jsConfigPath = path.resolve(process.cwd(), "cmu.config.js");

      if (await fs.pathExists(tsConfigPath)) {
        require("ts-node").register({
          transpileOnly: true,
          compilerOptions: { module: "CommonJS" },
        });
        const mod = require(tsConfigPath);
        config = mod.default || mod;
      } else if (await fs.pathExists(jsConfigPath)) {
        config = require(jsConfigPath);
      } else {
        console.error("Error: cmu.config.js or cmu.config.ts not found.");
        process.exit(1);
      }

      const defaultNetworkName = config.defaultNetwork || "cointmu_local";
      const network = config.networks?.[defaultNetworkName];

      if (!network) {
        console.error(
          `Error: Network configuration for '${defaultNetworkName}' not found.`,
        );
        process.exit(1);
      }

      const privateKey = config.wallet?.privateKey || process.env.PRIVATE_KEY;

      // Dereference from parent memory to prevent leakage
      if (process.env.PRIVATE_KEY) {
        delete process.env.PRIVATE_KEY;
      }

      if (!privateKey) {
        console.error(
          "Error: PRIVATE_KEY is not defined in the configuration or .env file.",
        );
        process.exit(1);
      }

      const { ethers } = require("ethers");
      let wallet;
      try {
        wallet = new ethers.Wallet(privateKey);
      } catch {
        console.error("Error: Invalid PRIVATE_KEY provided.");
        process.exit(1);
      }

      console.log(`\n--- Deployment Metadata ---`);
      console.log(`Network Name  : ${defaultNetworkName}`);
      console.log(`RPC URL       : ${network.url}`);
      console.log(`Chain ID      : ${network.chainId}`);
      console.log(`Deployer      : ${wallet.address}`);
      if (options.config) {
        console.log(`Private Key   : ${maskPrivateKey(privateKey)}`);
      }
      console.log(`---------------------------\n`);

      if (options.config) {
        process.exit(0);
      }

      const files: string[] = await fs.readdir(deployDir);
      const scripts = files
        .filter((f) => f.endsWith(".ts") || f.endsWith(".js"))
        .sort((a, b) => a.localeCompare(b)); // Sorts 01_... before 02_...

      if (scripts.length === 0) {
        console.log("No deployment scripts found in deploy/ directory.");
        return;
      }

      console.log(
        `Found ${scripts.length} deployment script(s). Starting sequential deployment...`,
      );

      const injectedEnv = {
        ...process.env,
        CMU_RPC_URL: network.url,
        CMU_CHAIN_ID: String(network.chainId),
        PRIVATE_KEY: privateKey,
      };

      for (const script of scripts) {
        const fullPath = path.join(deployDir, script);
        runDeployScript(fullPath, injectedEnv);
      }

      console.log("\nAll deployment scripts executed successfully.");
    } catch (error) {
      console.error("\n[!] Deployment failed:");
      console.error(error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  });
