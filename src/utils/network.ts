import * as fs from "fs-extra";
import * as path from "path";

/**
 * Resolves the target network configuration based on the provided input.
 * Falls back to the default network specified in cmu.config.js/ts, or
 * a local fallback preset if the config does not exist.
 *
 * @param {string} [targetNetwork] - The explicitly requested network name.
 * @returns {Promise<{ name: string; url: string; chainId: number; privateKey: string | undefined }>} The resolved network configuration.
 */
export async function resolveNetwork(targetNetwork?: string): Promise<{
  name: string;
  url: string;
  chainId: number;
  privateKey: string | undefined;
}> {
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
        `Error: Configuration file not found, but a specific network '${targetNetwork}' was requested.`,
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
      `Error: Network configuration for '${networkName}' not found.`,
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
