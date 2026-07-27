import { Command } from "commander";

const EXIT_FAILURE = 1;

/**
 * Validates that a string is a well-formed HTTP or HTTPS URL.
 * @param {string} value - The URL string to validate.
 * @returns {boolean} True if the value is a valid http or https URL.
 */
function isValidHttpUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * Executes the explorer opening logic.
 * @param {object} options - CLI options.
 * @returns {Promise<void>} Resolves when the explorer launch command is spawned.
 */
async function runExplorerOpen(
  options: { verbose?: boolean } = {},
): Promise<void> {
  try {
    const { spawn } = await import("child_process");
    const { loadConfig } = await import("../utils/config");

    let explorerUrl = "http://localhost:3000";

    try {
      const config = await loadConfig();
      if (config?.network?.explorerUrl) {
        explorerUrl = config.network.explorerUrl;
      }
    } catch {
      // Fallback to default if config is missing or invalid
    }

    if (!isValidHttpUrl(explorerUrl)) {
      throw new Error(
        `Invalid explorer URL '${explorerUrl}'. Only http and https URLs are allowed.`,
      );
    }

    console.log(`Opening CointMU explorer at ${explorerUrl}...`);

    const child =
      process.platform === "win32"
        ? spawn("cmd", ["/c", "start", "", explorerUrl], { shell: false })
        : spawn(
            process.platform === "darwin" ? "open" : "xdg-open",
            [explorerUrl],
            { shell: false },
          );

    child.on("error", (error) => {
      console.error(
        "\x1b[33mWarning: Failed to spawn explorer process.\x1b[0m",
      );
      if (options.verbose) {
        console.error(error);
      }
    });
  } catch (error) {
    console.error("\n\x1b[31m[!] Explorer launch failed:\x1b[0m");

    if (options.verbose) {
      console.error(error);
    } else {
      console.error(error instanceof Error ? error.message : String(error));
    }

    process.exit(EXIT_FAILURE);
  }
}

export const explorerCommand = new Command("explorer").description(
  "Interacts with the block explorer for on-chain data retrieval",
);

explorerCommand
  .command("open")
  .description("Opens the local CointMU block explorer UI")
  .option("-v, --verbose", "Enable verbose logging for debugging")
  .action(runExplorerOpen);
