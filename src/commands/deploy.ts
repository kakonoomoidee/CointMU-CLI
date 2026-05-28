import { Command } from 'commander';
import fs from 'fs-extra';
import path from 'path';
import { ethers } from 'ethers';

export const deployCommand = new Command('deploy')
  .description('Reads compiled artifacts and deploys them to the CointMU network via RPC using ethers')
  .argument('<contractName>', 'Name of the contract to deploy')
  .option('-k, --private-key <key>', 'Private key to use for deployment')
  .action(async (contractName: string, options) => {
    try {
      const configPath = path.resolve(process.cwd(), 'cmu.config.json');
      if (!fs.existsSync(configPath)) {
        console.error('Error: cmu.config.json not found.');
        process.exit(1);
      }

      const config = await fs.readJson(configPath);
      const rpcUrl = config.network?.rpcUrl || 'http://localhost:8545';

      const artifactPath = path.resolve(process.cwd(), 'artifacts', `${contractName}.json`);
      if (!fs.existsSync(artifactPath)) {
        console.error(`Error: Artifact for ${contractName} not found. Run compile first.`);
        process.exit(1);
      }

      const artifact = await fs.readJson(artifactPath);
      const abi = artifact.abi;
      const bytecode = artifact.evm?.bytecode?.object || artifact.bytecode;

      if (!abi || !bytecode) {
        console.error('Error: Invalid artifact format.');
        process.exit(1);
      }

      const privateKey = options.privateKey || process.env.PRIVATE_KEY;
      if (!privateKey) {
        console.error('Error: Private key is required for deployment. Pass it via -k or PRIVATE_KEY env var.');
        process.exit(1);
      }

      const provider = new ethers.JsonRpcProvider(rpcUrl);
      const wallet = new ethers.Wallet(privateKey, provider);

      console.log(`Deploying ${contractName} to network ${rpcUrl}...`);
      const factory = new ethers.ContractFactory(abi, bytecode, wallet);
      const contract = await factory.deploy();
      await contract.waitForDeployment();
      const address = await contract.getAddress();

      console.log(`${contractName} deployed successfully at address: ${address}`);
      
      const deploymentsDir = path.resolve(process.cwd(), 'deployments');
      await fs.ensureDir(deploymentsDir);
      await fs.writeJson(path.join(deploymentsDir, `${contractName}.json`), {
        address,
        abi,
        network: rpcUrl,
        timestamp: new Date().toISOString()
      }, { spaces: 2 });
    } catch (error) {
      console.error('Failed to deploy contract:', error);
      process.exit(1);
    }
  });
