import { Command } from "commander";

const EXIT_FAILURE = 1;
const JSON_SPACES = 2;
const DEFAULT_EVM_VERSION = "paris";

/**
 * Resolves imported Solidity files by reading their contents.
 * Required to be synchronous by the solc compiler import callback API.
 *
 * @param {string} importPath - The path of the imported Solidity file.
 * @returns {{ contents: string } | { error: string }} An object containing the file contents or an error message.
 */
function findImports(
  importPath: string,
): { contents: string } | { error: string } {
  try {
    const fs = require("fs");
    const path = require("path");

    const cwd = process.cwd();
    const localPath = path.resolve(cwd, importPath);

    // Ensure the resolved path remains within the current working directory
    if (localPath.startsWith(cwd) && fs.existsSync(localPath)) {
      return { contents: fs.readFileSync(localPath, "utf8") };
    }

    const nodeModulesPath = path.resolve(cwd, "node_modules", importPath);
    if (
      nodeModulesPath.startsWith(path.resolve(cwd, "node_modules")) &&
      fs.existsSync(nodeModulesPath)
    ) {
      return { contents: fs.readFileSync(nodeModulesPath, "utf8") };
    }

    return { error: "File not found or access denied" };
  } catch {
    return { error: "File not found" };
  }
}

/**
 * Compiles all Solidity contracts found in the contracts directory.
 * Writes the artifacts to the artifacts directory.
 * @param {object} options - CLI options.
 * @returns {Promise<void>} Resolves when compilation finishes successfully.
 */
export async function runCompile(
  options: { verbose?: boolean } = {},
): Promise<void> {
  try {
    const fs = require("fs-extra");
    const solc = require("solc");
    const path = require("path");

    const cwd = process.cwd();
    const contractsDir = path.resolve(cwd, "contracts");
    const artifactsDir = path.resolve(cwd, "artifacts");
    const configPathTs = path.resolve(cwd, "cmu.config.ts");
    const configPathJs = path.resolve(cwd, "cmu.config.js");

    let compilerSettings: Record<string, unknown> = {};
    let configPath: string | null = null;

    if (await fs.pathExists(configPathTs)) {
      configPath = configPathTs;
    } else if (await fs.pathExists(configPathJs)) {
      configPath = configPathJs;
    }

    if (configPath) {
      try {
        if (configPath.endsWith(".ts")) {
          require("ts-node/register/transpile-only");
        }
        const loadedConfig = require(configPath);
        const cmuConfig = loadedConfig?.default ?? loadedConfig;
        compilerSettings = cmuConfig?.compiler?.settings ?? {};
      } catch {
        console.warn(
          `Warning: failed to load ${path.basename(configPath)}. Using defaults.`,
        );
      }
    }

    if (!(await fs.pathExists(contractsDir))) {
      throw new Error(
        "contracts directory not found. Are you in a CointMU project?",
      );
    }

    const files: string[] = await fs.readdir(contractsDir);
    const solFiles = files.filter((f: string) => f.endsWith(".sol"));

    if (solFiles.length === 0) {
      console.log("No Solidity files found to compile.");
      return;
    }

    const sources: Record<string, { content: string }> = {};
    for (const file of solFiles) {
      const filePath = path.join(contractsDir, file);
      const content = await fs.readFile(filePath, "utf8");
      sources[file] = { content };
    }

    const finalSettings: Record<string, unknown> = {
      evmVersion: DEFAULT_EVM_VERSION,
      ...compilerSettings,
      outputSelection: {
        "*": {
          "*": ["abi", "evm.bytecode.object"],
        },
      },
    };

    const input = {
      language: "Solidity",
      sources,
      settings: finalSettings,
    };

    console.log("Compiling contracts...");
    const output = JSON.parse(
      solc.compile(JSON.stringify(input), { import: findImports }),
    );

    if (output.errors) {
      let hasError = false;
      for (const err of output.errors) {
        console.error(err.formattedMessage);
        if (err.severity === "error") hasError = true;
      }
      if (hasError) {
        throw new Error("Compilation failed due to Solidity errors.");
      }
    }

    await fs.ensureDir(artifactsDir);

    for (const file in output.contracts) {
      for (const contractName in output.contracts[file]) {
        const contract = output.contracts[file][contractName];
        const artifactPath = path.join(artifactsDir, `${contractName}.json`);
        await fs.writeJson(artifactPath, contract, { spaces: JSON_SPACES });
        console.log(`Compiled ${contractName} successfully.`);
      }
    }
  } catch (error) {
    console.error(
      "\n\x1b[31m[!] Compilation failed to execute completely.\x1b[0m",
    );

    if (options.verbose) {
      console.error(error);
    } else {
      console.error(error instanceof Error ? error.message : String(error));
    }

    process.exit(EXIT_FAILURE);
  }
}

export const compileCommand = new Command("compile")
  .description("Compiles smart contracts into ABI and bytecode artifacts")
  .option("-v, --verbose", "Enable verbose logging for debugging")
  .action(async (options: { verbose?: boolean }) => {
    await runCompile(options);
  });
