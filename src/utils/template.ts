import * as path from "path";
import { airdropTemplate } from "../templates/airdrop";
import { daoTemplate } from "../templates/dao";
import { erc1155Template } from "../templates/erc1155";
import { erc20Template } from "../templates/erc20";
import { erc721Template } from "../templates/erc721";
import { kyberionTemplate } from "../templates/kyberion";
import { marketplaceTemplate } from "../templates/marketplace";
import { stakingTemplate } from "../templates/staking";
import { vaultTemplate } from "../templates/vault";

export const templateChoices = [
  { name: "Blank (Empty project with basic structure)", value: "blank" },
  { name: "ERC20 (Standard ERC20 Token)", value: "erc20" },
  { name: "ERC721 (Standard NFT Collection)", value: "erc721" },
  { name: "ERC1155 (Multi-Token Standard)", value: "erc1155" },
  { name: "DAO (Basic Decentralized Autonomous Organization)", value: "dao" },
  { name: "Marketplace (NFT Marketplace)", value: "marketplace" },
  { name: "Staking (ERC20 staking and yield farming)", value: "staking" },
  { name: "Airdrop (Merkle tree token airdrop)", value: "airdrop" },
  { name: "Vault (Multisig timelock treasury)", value: "vault" },
  { name: "Kyberion (PQC research prototype)", value: "kyberion" },
] as const;

export const validTemplates = [
  ...templateChoices.map((choice) => choice.value),
  "nft",
];

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

/**
 * Builds the cmu.config file contents for the selected language.
 * @param language {string} The language to use ('typescript' or 'javascript').
 * @returns {string} The configuration file source code.
 */
function getConfigTemplate(language: string): string {
  if (language === "typescript") {
    return `export default {
  network: {
    rpcUrl: "http://localhost:8545",
    chainId: 1337
  },
  compiler: {
    version: "0.8.20"
  }
};
`;
  }
  return `module.exports = {
  network: {
    rpcUrl: "http://localhost:8545",
    chainId: 1337
  },
  compiler: {
    version: "0.8.20"
  }
};
`;
}

/**
 * Builds the deployment script source for a given contract.
 * @param contractName {string} The name of the contract to deploy.
 * @param contractArgs {string} The constructor arguments rendered as source.
 * @param language {string} The language to use ('typescript' or 'javascript').
 * @returns {string} The deployment script source code.
 */
function getDeployScript(
  contractName: string,
  contractArgs: string,
  language: string,
): string {
  const tsImports = `import { ethers } from 'ethers';
import fs from 'fs-extra';
import path from 'path';`;

  const jsImports = `const { ethers } = require('ethers');
const fs = require('fs-extra');
const path = require('path');`;

  return `${language === "typescript" ? tsImports : jsImports}

async function main() {
  console.log('Deploying ${contractName}...');
  
  const artifactPath = path.resolve(__dirname, '../artifacts/${contractName}.json');
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
  const contract = await factory.deploy(${contractArgs});
  await contract.waitForDeployment();
  
  const address = await contract.getAddress();
  console.log(\`${contractName} deployed successfully at address: \${address}\`);

  // Save artifact
  const deploymentDir = path.resolve(__dirname, '../deployments');
  await fs.ensureDir(deploymentDir);
  const deploymentPath = path.join(deploymentDir, '${contractName}.json');
  
  await fs.writeJson(deploymentPath, {
    address,
    abi,
    network: await provider.getNetwork().then(n => ({ chainId: Number(n.chainId), name: n.name }))
  }, { spaces: 2 });
  console.log(\`Deployment artifacts saved to \${deploymentPath}\`);
}

main().catch(console.error);
`;
}

/**
 * Builds the deployment script source for a blank project.
 * @param language {string} The language to use ('typescript' or 'javascript').
 * @returns {string} The deployment script source code.
 */
const blankDeployTemplate = (language: string): string =>
  `import { ethers } from 'ethers';

async function main() {
  console.log('Deploy script executed!');
  // Add your deployment logic here
}

main().catch(console.error);
`.replace(
    "import { ethers } from 'ethers';",
    language === "typescript"
      ? "import { ethers } from 'ethers';"
      : "const { ethers } = require('ethers');",
  );

/**
 * Scaffolds a new CointMU project based on the selected template and language.
 * @param projectPath {string} The absolute path to the project directory.
 * @param template {string} The template to use.
 * @param language {string} The language to use ('typescript' or 'javascript').
 * @returns {Promise<void>} Resolves when scaffolding is complete.
 */
export async function generateProject(
  projectPath: string,
  template: string,
  language: string,
): Promise<void> {
  const fs = require("fs-extra");
  const dirs = ["contracts", "scripts", "artifacts", "deployments", "deploy"];
  for (const dir of dirs) {
    await fs.ensureDir(path.join(projectPath, dir));
  }

  await fs.writeFile(
    path.join(projectPath, ".gitignore"),
    gitignoreTemplate,
    "utf8",
  );
  await fs.writeFile(
    path.join(projectPath, ".env.example"),
    "PRIVATE_KEY=your_private_key_here\n",
    "utf8",
  );
  await fs.writeFile(
    path.join(
      projectPath,
      `cmu.config.${language === "typescript" ? "ts" : "js"}`,
    ),
    getConfigTemplate(language),
    "utf8",
  );
  await fs.writeFile(
    path.join(projectPath, "artifacts", ".gitkeep"),
    "",
    "utf8",
  );
  await fs.writeFile(
    path.join(projectPath, "deployments", ".gitkeep"),
    "",
    "utf8",
  );
  await fs.writeFile(path.join(projectPath, "scripts", ".gitkeep"), "", "utf8");

  const ext = language === "typescript" ? "ts" : "js";

  if (language === "typescript") {
    const tsconfig = {
      compilerOptions: {
        target: "ES2022",
        module: "CommonJS",
        moduleResolution: "node",
        strict: true,
        esModuleInterop: true,
        skipLibCheck: true,
        forceConsistentCasingInFileNames: true,
      },
      include: ["scripts/**/*", "deploy/**/*"],
    };
    await fs.writeJson(path.join(projectPath, "tsconfig.json"), tsconfig, {
      spaces: 2,
    });
  }

  let contractSrc = "";
  let contractName = "";
  let deployArgs = "";

  if (template === "erc20") {
    contractSrc = erc20Template;
    contractName = "StandardERC20";
    deployArgs = "'MyToken', 'MTK', 1000000";
  } else if (template === "erc721" || template === "nft") {
    contractSrc = erc721Template;
    contractName = "StandardERC721";
    deployArgs = "'MyNFT', 'MNFT'";
  } else if (template === "erc1155") {
    contractSrc = erc1155Template;
    contractName = "StandardERC1155";
    deployArgs = "'MyTokens', 'MTKS'";
  } else if (template === "dao") {
    contractSrc = daoTemplate;
    contractName = "StandardDAO";
    deployArgs = "'MyDAO'";
  } else if (template === "marketplace") {
    contractSrc = marketplaceTemplate;
    contractName = "StandardMarketplace";
    deployArgs = "";
  } else if (template === "staking") {
    contractSrc = stakingTemplate;
    contractName = "StandardStaking";
    deployArgs =
      "'0x0000000000000000000000000000000000000001', '0x0000000000000000000000000000000000000002', 1";
  } else if (template === "airdrop") {
    contractSrc = airdropTemplate;
    contractName = "StandardAirdrop";
    deployArgs =
      "'0x0000000000000000000000000000000000000001', '0x0000000000000000000000000000000000000000000000000000000000000000'";
  } else if (template === "vault") {
    contractSrc = vaultTemplate;
    contractName = "StandardVault";
    deployArgs = "['0x0000000000000000000000000000000000000001'], 1, 0";
  } else if (template === "kyberion") {
    contractSrc = kyberionTemplate;
    contractName = "Kyberion";
    deployArgs = "";
  }

  if (template === "blank") {
    await fs.writeFile(
      path.join(projectPath, "contracts", ".gitkeep"),
      "",
      "utf8",
    );
    await fs.writeFile(
      path.join(projectPath, "deploy", `01_deploy.${ext}`),
      blankDeployTemplate(language),
      "utf8",
    );
  } else {
    await fs.writeFile(
      path.join(projectPath, "contracts", `${contractName}.sol`),
      contractSrc,
      "utf8",
    );
    await fs.writeFile(
      path.join(
        projectPath,
        "deploy",
        `01_${contractName.toLowerCase()}.${ext}`,
      ),
      getDeployScript(contractName, deployArgs, language),
      "utf8",
    );
  }
}
