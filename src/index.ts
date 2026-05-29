#!/usr/bin/env node

require("dotenv").config({ quiet: true });

import { Command } from "commander";

import { compileCommand } from "./commands/compile";
import { deployCommand } from "./commands/deploy";
import { walletCommand } from "./commands/wallet";
import { createCommand } from "./commands/create";
import { explorerCommand } from "./commands/explorer";
import { nodeCommand } from "./commands/node";
import { auditCommand } from "./commands/audit";
import { ariesCommand } from "./commands/aries";

const program = new Command();

const packageJson = require("../package.json");

program
  .name("cmu")
  .description(
    `${packageJson.description}\nTip: Run cmu <command> -h to see detailed options for a specific command.`,
  )
  .option("-V, --version", "output the version number")
  .on("option:version", () => {
    const solc = require("solc");
    const ethers = require("ethers");
    const { execSync } = require("child_process");

    let gitCommit = "unknown";
    try {
      gitCommit = execSync("git rev-parse --short HEAD", {
        stdio: "pipe",
        cwd: __dirname,
      })
        .toString()
        .trim();
    } catch (e) {
      // Ignore if not in a git repository
    }

    console.log("cmu");
    console.log(`version : ${packageJson.version}`);
    console.log(`git commit : ${gitCommit}`);
    console.log(`architecture : ${process.arch}`);
    console.log(`node : ${process.version}`);
    console.log(`solidity : ${solc.version()}`);
    console.log(`ethers : ${ethers.version}`);
    process.exit(0);
  });

program.addCommand(compileCommand);
program.addCommand(deployCommand);
program.addCommand(walletCommand);
program.addCommand(createCommand);
program.addCommand(explorerCommand);
program.addCommand(nodeCommand);
program.addCommand(auditCommand);
program.addCommand(ariesCommand, { hidden: true });

program.parse(process.argv);
