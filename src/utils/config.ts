import * as path from "path";

/**
 * @dev Loads the cmu.config.ts file from the current working directory.
 * @returns {Promise<any>} Resolves with the configuration object.
 */
export async function loadConfig(): Promise<any> {
  const fs = require("fs-extra");
  const configPath = path.resolve(process.cwd(), "cmu.config.ts");

  if (!fs.existsSync(configPath)) {
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
