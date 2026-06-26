import { Command } from "commander";
import { spawn } from "child_process";
import * as path from "path";

/**
 * Executes a deployment script in a child process.
 * @param scriptPath {string} The absolute path to the script to execute.
 * @returns {Promise<void>} Resolves when the script successfully completes.
 */
function runDeployScript(scriptPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const ext = path.extname(scriptPath);
    const runner = ext === ".ts" ? "npx" : "node";
    const args = ext === ".ts" ? ["ts-node", scriptPath] : [scriptPath];

    console.log(`\n========================================`);
    console.log(`Executing: ${path.basename(scriptPath)}`);
    console.log(`========================================\n`);

    const child = spawn(runner, args, {
      shell: true,
      stdio: "inherit",
      env: {
        ...process.env,
      },
    });

    child.on("error", (error) => {
      reject(error);
    });

    child.on("close", (code) => {
      if (code !== 0) {
        reject(
          new Error(
            `Script ${path.basename(scriptPath)} exited with code ${code}`,
          ),
        );
      } else {
        resolve();
      }
    });
  });
}

export const deployCommand = new Command("deploy")
  .description(
    "Sequentially executes all deployment scripts in the deploy/ directory",
  )
  .action(async () => {
    const fs = require("fs-extra");
    const deployDir = path.resolve(process.cwd(), "deploy");

    if (!(await fs.pathExists(deployDir))) {
      console.error(`Error: 'deploy' directory not found at ${deployDir}.`);
      console.error(
        `Please run this command from the root of your CointMU project.`,
      );
      process.exit(1);
    }

    try {
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

      for (const script of scripts) {
        const fullPath = path.join(deployDir, script);
        await runDeployScript(fullPath);
      }

      console.log("\nAll deployment scripts executed successfully.");
    } catch (error) {
      console.error("\n[!] Deployment failed:");
      console.error(error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  });
