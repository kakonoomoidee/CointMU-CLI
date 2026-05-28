#!/usr/bin/env node

require('dotenv').config({ quiet: true });

import { Command } from 'commander';

import { compileCommand } from './commands/compile';
import { deployCommand } from './commands/deploy';
import { walletCommand } from './commands/wallet';
import { createCommand } from './commands/create';
import { explorerCommand } from './commands/explorer';
import { nodeCommand } from './commands/node';
import { auditCommand } from './commands/audit';

const program = new Command();

const packageJson = require('../package.json');

program
  .name('cmu')
  .description(`${packageJson.description}\nTip: Run cmu <command> -h to see detailed options for a specific command.`)
  .version(`CointMU v${packageJson.version}\nSolidity v${require('solc').version()}\nNode ${process.version}\nEthers v${require('ethers').version}`, '-V, --version');


program.addCommand(compileCommand);
program.addCommand(deployCommand);
program.addCommand(walletCommand);
program.addCommand(createCommand);
program.addCommand(explorerCommand);
program.addCommand(nodeCommand);
program.addCommand(auditCommand);

program.parse(process.argv);
