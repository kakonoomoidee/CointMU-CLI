import { Command } from 'commander';
import { exec } from 'child_process';
import fs from 'fs-extra';
import path from 'path';

export const explorerCommand = new Command('explorer')
  .description('Explorer commands');

explorerCommand
  .command('open')
  .description('Opens the local CointMU block explorer UI')
  .action(async () => {
    try {
      let explorerUrl = 'http://localhost:3000'; // Default placeholder

      const configPath = path.resolve(process.cwd(), 'cmu.config.json');
      if (fs.existsSync(configPath)) {
        const config = await fs.readJson(configPath);
        if (config.network?.explorerUrl) {
          explorerUrl = config.network.explorerUrl;
        }
      }

      console.log(`Opening CointMU explorer at ${explorerUrl}...`);
      
      const startCmd = process.platform === 'win32' ? 'start' : 
                       process.platform === 'darwin' ? 'open' : 'xdg-open';
      
      exec(`${startCmd} ${explorerUrl}`, (error) => {
        if (error) {
          console.error('Failed to open explorer:', error);
        }
      });
    } catch (error) {
      console.error('An error occurred:', error);
      process.exit(1);
    }
  });
