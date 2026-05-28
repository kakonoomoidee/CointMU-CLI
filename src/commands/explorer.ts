import { Command } from 'commander';
import { exec } from 'child_process';
import { loadConfig } from '../utils/config';

export const explorerCommand = new Command('explorer')
  .description('Explorer commands');

explorerCommand
  .command('open')
  .description('Opens the local CointMU block explorer UI')
  .action(async () => {
    try {
      let explorerUrl = 'http://localhost:3000'; // Default placeholder

      try {
        const config = await loadConfig();
        if (config?.network?.explorerUrl) {
          explorerUrl = config.network.explorerUrl;
        }
      } catch (e) {
        // Fallback to default if config not found
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
