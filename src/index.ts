#!/usr/bin/env node

require('dotenv').config();

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
  .description(packageJson.description)
  .version(packageJson.version);


program.addCommand(compileCommand);
program.addCommand(deployCommand);
program.addCommand(walletCommand);
program.addCommand(createCommand);
program.addCommand(explorerCommand);
program.addCommand(nodeCommand);
program.addCommand(auditCommand);

program.parse(process.argv);
