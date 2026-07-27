import { Command } from "commander";

const EXIT_FAILURE = 1;
const REPOSITORY_URL = "git+https://github.com/kakonoomoidee/CointMU-CLI.git";
const UPDATE_COMMAND = `npm install -g ${REPOSITORY_URL}`;

/**
 * Updates the CointMU CLI by installing the latest code from the GitHub repository.
 * @param {object} options - CLI options.
 * @returns {Promise<void>} Resolves when the update is complete.
 */
async function runUpdate(options: { verbose?: boolean } = {}): Promise<void> {
  try {
    const { execSync } = await import("child_process");

    console.log("Updating CointMU CLI to the latest version...");
    console.log(`Executing: ${UPDATE_COMMAND}`);

    execSync(UPDATE_COMMAND, {
      stdio: "inherit",
    });

    console.log("\nUpdate completed successfully!");
  } catch (error) {
    console.error("\n\x1b[31m[!] Update failed:\x1b[0m");
    if (options.verbose) {
      console.error(error);
    } else {
      console.error(error instanceof Error ? error.message : String(error));
    }
    process.exit(EXIT_FAILURE);
  }
}

export const updateCommand = new Command("update")
  .description(
    "Updates the CointMU CLI to the latest version directly from GitHub",
  )
  .option("-v, --verbose", "Enable verbose logging for debugging")
  .action(runUpdate);
