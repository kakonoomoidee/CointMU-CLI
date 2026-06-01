import * as path from "path";

export interface CmuConfig {
  network?: {
    rpcUrl?: string;
    explorerUrl?: string;
    chainId?: number;
  };
  compiler?: {
    version?: string;
  };
}

/**
 * Loads the cmu.config.ts file from the current working directory.
 * @returns {Promise<CmuConfig>} Resolves with the parsed configuration object.
 */
export async function loadConfig(): Promise<CmuConfig> {
  const fs = require("fs-extra");
  const configPath = path.resolve(process.cwd(), "cmu.config.ts");

  if (!(await fs.pathExists(configPath))) {
    throw new Error(
      "Error: cmu.config.ts not found. Are you in a CointMU project?",
    );
  }

  require("ts-node").register({
    transpileOnly: true,
    compilerOptions: {
      module: "CommonJS",
    },
  });

  const configModule = require(configPath);
  return configModule.default || configModule;
}
