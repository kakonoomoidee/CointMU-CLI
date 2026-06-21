import { Command } from "commander";
import * as path from "path";

export const compileCommand = new Command("compile")
  .description(
    "Reads Solidity files from the contracts folder and compiles them using solc",
  )
  .action(async () => {
    try {
      const fs = require("fs-extra");
      const solc = require("solc");
      const contractsDir = path.resolve(process.cwd(), "contracts");
      const artifactsDir = path.resolve(process.cwd(), "artifacts");
      const configPathTs = path.resolve(process.cwd(), "cmu.config.ts");
      const configPathJs = path.resolve(process.cwd(), "cmu.config.js");

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
        } catch (error) {
          console.warn(
            `Warning: failed to load ${path.basename(configPath)}. Using defaults.`,
          );
        }
      }

      if (!(await fs.pathExists(contractsDir))) {
        console.error(
          "Error: contracts directory not found. Are you in a CointMU project?",
        );
        process.exit(1);
      }

      const files: string[] = await fs.readdir(contractsDir);
      const solFiles = files.filter((f) => f.endsWith(".sol"));

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

      const settings: Record<string, unknown> = {
        ...compilerSettings,
        outputSelection: {
          "*": {
            "*": ["abi", "evm.bytecode"],
          },
        },
      };

      if (!("evmVersion" in settings)) {
        settings.evmVersion = "paris";
      }

      const input = {
        language: "Solidity",
        sources,
        settings,
      };

      console.log("Compiling contracts...");
      const output = JSON.parse(solc.compile(JSON.stringify(input)));

      if (output.errors) {
        let hasError = false;
        for (const err of output.errors) {
          console.error(err.formattedMessage);
          if (err.severity === "error") hasError = true;
        }
        if (hasError) {
          console.error("Compilation failed.");
          process.exit(1);
        }
      }

      await fs.ensureDir(artifactsDir);

      for (const file in output.contracts) {
        for (const contractName in output.contracts[file]) {
          const contract = output.contracts[file][contractName];
          const artifactPath = path.join(artifactsDir, `${contractName}.json`);
          await fs.writeJson(artifactPath, contract, { spaces: 2 });
          console.log(`Compiled ${contractName} successfully.`);
        }
      }
    } catch (error) {
      console.error(
        "Failed to compile contracts:",
        error instanceof Error ? error.message : String(error),
      );
      process.exit(1);
    }
  });
