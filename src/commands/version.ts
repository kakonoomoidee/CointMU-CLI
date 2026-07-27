import { Command } from "commander";

const EXIT_FAILURE = 1;

/**
 * Resolves the short Git commit hash of the current HEAD.
 * @returns {Promise<string>} The short commit hash, or "unknown".
 */
export async function resolveGitCommit(): Promise<string> {
  try {
    const { execSync } = await import("child_process");
    return execSync("git rev-parse --short HEAD", {
      stdio: "pipe",
      cwd: __dirname,
    })
      .toString()
      .trim();
  } catch {
    return "unknown";
  }
}

/**
 * Prints detailed version information to the console.
 * @param {object} options - CLI options.
 * @returns {Promise<void>} Resolves when the version info is printed.
 */
export async function runVersion(
  options: { verbose?: boolean } = {},
): Promise<void> {
  try {
    const fs = (await import("fs-extra")).default || (await import("fs-extra"));
    const path = await import("path");

    const pkgPath = path.resolve(__dirname, "..", "package.json");
    const buildPath = path.resolve(__dirname, "..", "build-info.json");

    let pkg = { version: "unknown" };
    let buildInfo = { build: "unknown" };

    if (await fs.pathExists(pkgPath)) {
      pkg = await fs.readJson(pkgPath);
    }

    if (await fs.pathExists(buildPath)) {
      buildInfo = await fs.readJson(buildPath);
    }

    const solcRaw = await import("solc");
    const solc = solcRaw.default || solcRaw;
    const { ethers } = await import("ethers");
    const gitCommit = await resolveGitCommit();

    console.log("cmu");
    console.log(`version      : ${pkg.version}`);
    console.log(`build        : ${buildInfo.build}`);
    console.log(`architecture : ${process.arch}`);
    console.log(`node         : ${process.version}`);
    console.log(
      `solidity     : ${typeof solc.version === "function" ? solc.version() : "unknown"}`,
    );
    console.log(`ethers       : ${ethers.version}`);
    console.log(`git commit   : ${gitCommit}`);
  } catch (error) {
    console.error("\n\x1b[31m[!] Failed to retrieve version info:\x1b[0m");
    if (options.verbose) {
      console.error(error);
    } else {
      console.error(error instanceof Error ? error.message : String(error));
    }
    process.exit(EXIT_FAILURE);
  }
}

export const versionCommand = new Command("version")
  .description("Displays detailed CLI, runtime, and dependency versions")
  .option("-v, --verbose", "Enable verbose logging for debugging")
  .action(runVersion);
