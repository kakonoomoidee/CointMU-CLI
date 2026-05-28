import { Command } from 'commander';
import { ethers } from 'ethers';
import fs from 'fs-extra';
import path from 'path';

export const nodeCommand = new Command('node')
  .description('Node management commands');

nodeCommand
  .command('connect')
  .description('Pings the RPC endpoint defined in the config to test network connection')
  .action(async () => {
    try {
      let rpcUrl = 'http://localhost:8545'; // Default

      const configPath = path.resolve(process.cwd(), 'cmu.config.json');
      if (fs.existsSync(configPath)) {
        const config = await fs.readJson(configPath);
        if (config.network?.rpcUrl) {
          rpcUrl = config.network.rpcUrl;
        }
      }

      console.log(`Pinging CointMU node at ${rpcUrl}...`);
      
      const provider = new ethers.JsonRpcProvider(rpcUrl);
      const network = await provider.getNetwork();
      const blockNumber = await provider.getBlockNumber();

      console.log('Successfully connected to the CointMU node!');
      console.log(`Network Name: ${network.name}`);
      console.log(`Chain ID:     ${network.chainId}`);
      console.log(`Block Number: ${blockNumber}`);
    } catch (error) {
      console.error('Failed to connect to the CointMU node. Is the node running?');
      console.error(error);
      process.exit(1);
    }
  });
