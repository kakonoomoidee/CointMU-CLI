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
    console.log(
      `CointMU v${packageJson.version}\nSolidity v${solc.version()}\nNode ${process.version}\nEthers v${ethers.version}`,
    );
    process.exit(0);
  });

program.addCommand(compileCommand);
program.addCommand(deployCommand);
program.addCommand(walletCommand);
program.addCommand(createCommand);
program.addCommand(explorerCommand);
program.addCommand(nodeCommand);
program.addCommand(auditCommand);

program.parse(process.argv);
