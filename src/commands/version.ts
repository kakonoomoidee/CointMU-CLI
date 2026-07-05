import * as fs from "fs";
import * as path from "path";
import { Command } from "commander";

/**
 * Resolves the short Git commit hash of the current HEAD.
 * @returns {string} The short commit hash, or "unknown".
 */
export function resolveGitCommit(): string {
  try {
    const { execSync } = require("child_process");
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
 * @returns {void}
 */
export function printVersionInfo(): void {
  const pkgPath = path.resolve(__dirname, "..", "package.json");
  const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
  const buildPath = path.resolve(__dirname, "..", "build-info.json");
  const buildInfo = JSON.parse(fs.readFileSync(buildPath, "utf8"));
  const solc = require("solc");
  const ethers = require("ethers");
  const gitCommit = resolveGitCommit();

  console.log("cmu");
  console.log(`version      : ${pkg.version}`);
  console.log(`build        : ${buildInfo.build}`);
  console.log(`architecture : ${process.arch}`);
  console.log(`node         : ${process.version}`);
  console.log(`solidity     : ${solc.version()}`);
  console.log(`ethers       : ${ethers.version}`);
  console.log(`git commit   : ${gitCommit}`);
}

export const versionCommand = new Command("version")
  .description("Displays detailed CLI, runtime, and dependency versions")
  .action(() => {
    printVersionInfo();
  });
