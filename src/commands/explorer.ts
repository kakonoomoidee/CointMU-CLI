import { Command } from "commander";
import { spawn } from "child_process";
import { loadConfig } from "../utils/config";

/**
 * Validates that a string is a well-formed HTTP or HTTPS URL.
 * @param value {string} The URL string to validate.
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
 * Opens a URL in the default browser using the platform-specific launcher
 * without invoking a shell, preventing command injection.
 * @param url {string} The validated http or https URL to open.
 * @returns {void}
 */
function openInBrowser(url: string): void {
  const child =
    process.platform === "win32"
      ? spawn("cmd", ["/c", "start", "", url], { shell: false })
      : spawn(process.platform === "darwin" ? "open" : "xdg-open", [url], {
          shell: false,
        });

  child.on("error", (error) => {
    console.error("Failed to open explorer:", error.message);
  });
}

export const explorerCommand = new Command("explorer").description(
  "Explorer commands",
);

explorerCommand
  .command("open")
  .description("Opens the local CointMU block explorer UI")
  .action(async () => {
    try {
      let explorerUrl = "http://localhost:3000"; // Default placeholder

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
      openInBrowser(explorerUrl);
    } catch (error) {
      console.error("An error occurred:", error);
      process.exit(1);
    }
  });
