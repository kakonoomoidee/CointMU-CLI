import { Command } from "commander";

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

export const explorerCommand = new Command("explorer").description(
  "Interacts with the block explorer for on-chain data retrieval",
);

explorerCommand
  .command("open")
  .description("Opens the local CointMU block explorer UI")
  .action(async () => {
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
        // Fallback to default if config not found
      }

      if (!isValidHttpUrl(explorerUrl)) {
        console.error(
          `Error: Invalid explorer URL '${explorerUrl}'. Only http and https URLs are allowed.`,
        );
        process.exit(1);
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
        console.error("Failed to open explorer:", error.message);
      });
    } catch (error) {
      console.error("An error occurred:", error);
      process.exit(1);
    }
  });
