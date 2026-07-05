#!/usr/bin/env node

import * as fs from "fs";
import * as path from "path";
import { Command } from "commander";

require("dotenv").config({ quiet: true });

const pkgPath = path.resolve(__dirname, "..", "package.json");
const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));

const program = new Command();

program
  .name("cmu")
  .description(
    `${pkg.description}\nTip: Run cmu <command> -h to see detailed options for a specific command.`,
  );

/**
 * Loads all command modules in parallel and registers them on the program,
 * then parses process arguments asynchronously.
 * @returns {Promise<void>} Resolves when all commands are registered and arguments are parsed.
 */
async function main(): Promise<void> {
  const args = process.argv.slice(2);

  if (args.length === 1 && (args[0] === "-V" || args[0] === "--version")) {
    const { printVersionInfo } = await import("./commands/version");
    printVersionInfo();
    return;
  }

  const [
    { compileCommand },
    { deployCommand },
    { walletCommand },
    { createCommand },
    { explorerCommand },
    { nodeCommand },
    { auditCommand },
    { ariesCommand },
    { versionCommand },
    { testCommand },
  ] = await Promise.all([
    import("./commands/compile"),
    import("./commands/deploy"),
    import("./commands/wallet"),
    import("./commands/create"),
    import("./commands/explorer"),
    import("./commands/node"),
    import("./commands/audit"),
    import("./commands/aries"),
    import("./commands/version"),
    import("./commands/test"),
  ]);

  program.addCommand(compileCommand);
  program.addCommand(deployCommand);
  program.addCommand(walletCommand);
  program.addCommand(createCommand);
  program.addCommand(explorerCommand);
  program.addCommand(nodeCommand);
  program.addCommand(auditCommand);
  program.addCommand(versionCommand);
  program.addCommand(testCommand);
  program.addCommand(ariesCommand, { hidden: true });

  if (args.length === 0) {
    program.help();
    return;
  }

  await program.parseAsync(process.argv);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
