import { Command } from 'commander';
import fs from 'fs-extra';
import path from 'path';
import { erc20Template } from '../templates/erc20';
import { erc721Template } from '../templates/erc721';

export const createCommand = new Command('create')
  .description('Scaffold standard smart contract templates');

createCommand
  .command('erc20')
  .description('Scaffolds a standard ERC20 smart contract template in the contracts folder')
  .action(async () => {
    try {
      const contractsDir = path.resolve(process.cwd(), 'contracts');
      await fs.ensureDir(contractsDir);
      
      const targetFile = path.join(contractsDir, 'StandardERC20.sol');
      if (fs.existsSync(targetFile)) {
        console.error('Error: StandardERC20.sol already exists.');
        process.exit(1);
      }

      await fs.writeFile(targetFile, erc20Template, 'utf8');
      console.log('Successfully created contracts/StandardERC20.sol');
    } catch (error) {
      console.error('Failed to create ERC20 template:', error);
      process.exit(1);
    }
  });

createCommand
  .command('nft')
  .description('Scaffolds a standard ERC721 smart contract template')
  .action(async () => {
    try {
      const contractsDir = path.resolve(process.cwd(), 'contracts');
      await fs.ensureDir(contractsDir);
      
      const targetFile = path.join(contractsDir, 'StandardERC721.sol');
      if (fs.existsSync(targetFile)) {
        console.error('Error: StandardERC721.sol already exists.');
        process.exit(1);
      }

      await fs.writeFile(targetFile, erc721Template, 'utf8');
      console.log('Successfully created contracts/StandardERC721.sol');
    } catch (error) {
      console.error('Failed to create NFT template:', error);
      process.exit(1);
    }
  });
