import { Command } from "commander";

const EXIT_FAILURE = 1;
const PACKAGE_NAME = "cointmu-cli";

interface UpdateOptions {
  to?: string;
  verbose?: boolean;
}

/**
 * Reads the version of the currently installed CLI from its package.json.
 * @returns {Promise<string>} The installed version, or "unknown".
 */
export async function resolveCurrentVersion(): Promise<string> {
  try {
    const fs = await import("fs");
    const path = await import("path");
    const pkgPath = path.resolve(__dirname, "..", "package.json");
    const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
    return pkg.version ?? "unknown";
  } catch {
    return "unknown";
  }
}

/**
 * Resolves a target version from the npm registry.
 * @param {string} [requested] - A specific semver to pin, or undefined for the latest release.
 * @returns {Promise<string>} The resolved version string published on the registry.
 * @throws {Error} If the requested version is not published.
 */
export async function resolveTargetVersion(
  requested?: string,
): Promise<string> {
  const { execSync } = await import("child_process");
  const spec = requested ? `${PACKAGE_NAME}@${requested}` : PACKAGE_NAME;

  try {
    const raw = execSync(`npm view ${spec} version`, { stdio: "pipe" })
      .toString()
      .trim();

    // `npm view <pkg> version` prints the bare version for a single match, or
    // `<pkg>@x.y.z 'x.y.z'` lines when a range matches several. Take the last.
    const lines = raw
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    if (lines.length === 0) {
      throw new Error("registry returned no version");
    }

    const last = lines[lines.length - 1];
    const quoted = last.match(/'([^']+)'/);
    return quoted ? quoted[1] : last;
  } catch (error) {
    if (requested) {
      throw new Error(
        `Version "${requested}" is not available on the npm registry for ${PACKAGE_NAME}.`,
        { cause: error },
      );
    }
    throw error;
  }
}

/**
 * Builds the global install command for a specific published version.
 * @param {string} version - The exact version to install.
 * @returns {string} The npm command string.
 */
export function buildInstallCommand(version: string): string {
  return `npm install -g ${PACKAGE_NAME}@${version}`;
}

/**
 * Updates the CointMU CLI from the npm registry, optionally pinning a version.
 * @param {UpdateOptions} options - CLI options.
 * @returns {Promise<void>} Resolves when the update is complete.
 */
async function runUpdate(options: UpdateOptions = {}): Promise<void> {
  try {
    const { execSync } = await import("child_process");

    const current = await resolveCurrentVersion();
    console.log("Checking the npm registry for the target version...");
    const target = await resolveTargetVersion(options.to);

    console.log(`current version : ${current}`);
    console.log(`target version  : ${target}`);

    if (current === target) {
      console.log("\nAlready on the target version. Nothing to do.");
      return;
    }

    const command = buildInstallCommand(target);
    console.log(`\nExecuting: ${command}`);
    execSync(command, { stdio: "inherit" });

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
    "Updates the CointMU CLI to the latest release from the npm registry",
  )
  .option(
    "--to <version>",
    "Install a specific published version instead of the latest",
  )
  .option("-v, --verbose", "Enable verbose logging for debugging")
  .action(runUpdate);
