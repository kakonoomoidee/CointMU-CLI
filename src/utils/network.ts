import * as fs from "fs-extra";
import * as path from "path";
import { loadNetworks } from "./networkStorage";

const SESSION_FILE = path.resolve(process.cwd(), ".cmu-session");

export interface NetworkConfig {
  name: string;
  url: string;
  chainId: number;
  privateKey: string | undefined;
}

/**
 * Resolves the dynamic network configuration using .cmu-networks.json
 * and the active CLI session. Used for wallet, mining, and node connections.
 *
 * @param {string} [targetNetwork] - An optional override network name.
 * @returns {Promise<NetworkConfig>} The dynamic network configuration.
 */
export async function getDynamicNetwork(
  targetNetwork?: string,
): Promise<NetworkConfig> {
  let activeNetworkName = "local";

  if (await fs.pathExists(SESSION_FILE)) {
    const session = await fs.readJson(SESSION_FILE);
    if (session.activeNetwork) {
      activeNetworkName = session.activeNetwork;
    }
  }

  const networkName = targetNetwork || activeNetworkName;
  const networks = await loadNetworks();

  const network = networks.find((n) => n.name === networkName);

  if (!network) {
    console.error(
      `Error: Network configuration for '${networkName}' not found in saved networks.`,
    );
    process.exit(1);
  }

  const { ethers } = await import("ethers");
  let chainId = 0;

  try {
    const provider = new ethers.JsonRpcProvider(network.rpcUrl);
    const net = await provider.getNetwork();
    chainId = Number(net.chainId);
  } catch {
    chainId = networkName === "local" ? 1912 : 0;
  }

  return {
    name: networkName,
    url: network.rpcUrl,
    chainId,
    privateKey: process.env.PRIVATE_KEY,
  };
}

/**
 * Resolves the static network configuration directly from the project's cmu.config.ts/js.
 * Used exclusively for deterministic smart contract deployments.
 *
 * @param {string} [targetNetwork] - The explicitly requested deployment network name.
 * @returns {Promise<NetworkConfig>} The static deployment network configuration.
 */
export async function getDeployNetwork(
  targetNetwork?: string,
): Promise<NetworkConfig> {
  let config: any = null;
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
  }

  if (!config) {
    if (targetNetwork && targetNetwork !== "local") {
      console.error(
        `Error: Configuration file not found, but a specific network '${targetNetwork}' was requested for deployment.`,
      );
      process.exit(1);
    }
    return {
      name: "local",
      url: "http://127.0.0.1:8585",
      chainId: 1912,
      privateKey: process.env.PRIVATE_KEY,
    };
  }

  const networkName = targetNetwork || config.defaultNetwork || "local";
  const network = config.networks?.[networkName];

  if (!network) {
    console.error(
      `Error: Static deployment network configuration for '${networkName}' not found in cmu.config.ts.`,
    );
    process.exit(1);
  }

  return {
    name: networkName,
    url: network.url,
    chainId: network.chainId,
    privateKey: config.wallet?.privateKey || process.env.PRIVATE_KEY,
  };
}
