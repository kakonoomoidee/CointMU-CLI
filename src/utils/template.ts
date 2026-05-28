import fs from 'fs-extra';
import path from 'path';
import { erc20Template } from '../templates/erc20';
import { erc721Template } from '../templates/erc721';

const gitignoreTemplate = `# Logs
logs
*.log
npm-debug.log*

# Dependency directories
node_modules/

# Compiled artifacts
artifacts/
deployments/
dist/

# Env files
.env
.env.test
.env.production
.env.local
`;

const configTemplate = `export default {
  network: {
    rpcUrl: "http://localhost:8545",
    chainId: 1337
  },
  compiler: {
    version: "0.8.21"
  }
};
`;

const blankDeployTemplate = `import { ethers } from 'ethers';

async function main() {
  console.log('Deploy script executed!');
  // Add your deployment logic here
}

main().catch(console.error);
`;

const erc20DeployTemplate = `import { ethers } from 'ethers';
import fs from 'fs-extra';
import path from 'path';

async function main() {
  console.log('Deploying StandardERC20...');
  
  const artifactPath = path.resolve(__dirname, '../artifacts/StandardERC20.json');
  if (!fs.existsSync(artifactPath)) {
    throw new Error('Artifact not found. Please compile the contract first.');
  }

  const artifact = await fs.readJson(artifactPath);
  const abi = artifact.abi;
  const bytecode = artifact.evm?.bytecode?.object || artifact.bytecode;

  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) throw new Error('PRIVATE_KEY environment variable is required');
  
  const provider = new ethers.JsonRpcProvider('http://localhost:8545'); // Update to config URL if needed
  const wallet = new ethers.Wallet(privateKey, provider);

  const factory = new ethers.ContractFactory(abi, bytecode, wallet);
  const contract = await factory.deploy('MyToken', 'MTK', 1000000);
  await contract.waitForDeployment();
  
  const address = await contract.getAddress();
  console.log(\`StandardERC20 deployed successfully at address: \${address}\`);
}

main().catch(console.error);
`;

const nftDeployTemplate = `import { ethers } from 'ethers';
import fs from 'fs-extra';
import path from 'path';

async function main() {
  console.log('Deploying StandardERC721...');
  
  const artifactPath = path.resolve(__dirname, '../artifacts/StandardERC721.json');
  if (!fs.existsSync(artifactPath)) {
    throw new Error('Artifact not found. Please compile the contract first.');
  }

  const artifact = await fs.readJson(artifactPath);
  const abi = artifact.abi;
  const bytecode = artifact.evm?.bytecode?.object || artifact.bytecode;

  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) throw new Error('PRIVATE_KEY environment variable is required');
  
  const provider = new ethers.JsonRpcProvider('http://localhost:8545');
  const wallet = new ethers.Wallet(privateKey, provider);

  const factory = new ethers.ContractFactory(abi, bytecode, wallet);
  const contract = await factory.deploy('MyNFT', 'MNFT');
  await contract.waitForDeployment();
  
  const address = await contract.getAddress();
  console.log(\`StandardERC721 deployed successfully at address: \${address}\`);
}

main().catch(console.error);
`;

/**
 * @dev Scaffolds a new CointMU project based on the selected template.
 * @param projectPath string The absolute path to the project directory.
 * @param template string The template to use ('blank', 'erc20', 'nft').
 * @returns {Promise<void>} Resolves when scaffolding is complete.
 */
export async function generateProject(projectPath: string, template: string): Promise<void> {
  const dirs = ['contracts', 'scripts', 'artifacts', 'deployments'];
  for (const dir of dirs) {
    await fs.ensureDir(path.join(projectPath, dir));
  }

  await fs.writeFile(path.join(projectPath, '.gitignore'), gitignoreTemplate, 'utf8');
  await fs.writeFile(path.join(projectPath, '.env.example'), 'PRIVATE_KEY=your_private_key_here\n', 'utf8');
  await fs.writeFile(path.join(projectPath, 'cmu.config.ts'), configTemplate, 'utf8');
  await fs.writeFile(path.join(projectPath, 'artifacts', '.gitkeep'), '', 'utf8');
  await fs.writeFile(path.join(projectPath, 'deployments', '.gitkeep'), '', 'utf8');

  // Add tsconfig.json for the project so users can write TS scripts and have them compile properly if needed.
  const tsconfig = {
    compilerOptions: {
      target: "ES2022",
      module: "CommonJS",
      moduleResolution: "node",
      strict: true,
      esModuleInterop: true,
      skipLibCheck: true,
      forceConsistentCasingInFileNames: true
    },
    include: ["scripts/**/*"]
  };
  await fs.writeJson(path.join(projectPath, 'tsconfig.json'), tsconfig, { spaces: 2 });

  if (template === 'erc20') {
    await fs.writeFile(path.join(projectPath, 'contracts', 'StandardERC20.sol'), erc20Template, 'utf8');
    await fs.writeFile(path.join(projectPath, 'scripts', 'deploy.ts'), erc20DeployTemplate, 'utf8');
  } else if (template === 'nft') {
    await fs.writeFile(path.join(projectPath, 'contracts', 'StandardERC721.sol'), erc721Template, 'utf8');
    await fs.writeFile(path.join(projectPath, 'scripts', 'deploy.ts'), nftDeployTemplate, 'utf8');
  } else {
    // blank
    await fs.writeFile(path.join(projectPath, 'contracts', '.gitkeep'), '', 'utf8');
    await fs.writeFile(path.join(projectPath, 'scripts', 'deploy.ts'), blankDeployTemplate, 'utf8');
  }
}
