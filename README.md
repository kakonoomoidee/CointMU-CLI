# 🚀 CointMU CLI (cmu-cli) 🌟

## 🌟 Project Overview
The CointMU CLI (`cmu-cli`) is the ultimate, hyper-charged development toolkit for the **CointMU blockchain ecosystem**! ⚡ It provides developers with a blazing fast, modern command-line interface to interactively scaffold new projects, compile Solidity smart contracts, execute sequential deployment scripts, manage secure wallets, and seamlessly interact with the local CointMU node and block explorer. 

Built beautifully with **TypeScript** and packing **Vite-like** interactive prompts, it streamlines the entire Web3 development lifecycle for the CointMU network so you can focus on building the future! 🛠️💎

## 📦 Installation Guide

### 🌍 Global Installation via NPM
To install the `cmu-cli` package globally so you can use the magic `cmu` command from anywhere, run:

```bash
npm install -g cmu-cli
```

### 💻 Local Development Setup (NPM)
If you are developing or contributing to the CLI itself, you can easily set it up locally:

1. Clone the repository and navigate into the directory: 📂
```bash
git clone <repository_url>
cd CointMU-CLI
```

2. Install dependencies: 📦
```bash
npm install
```

3. Build the TypeScript source code: 🔨
```bash
npm run build
```

4. Link the package globally for local testing: 🔗
```bash
npm install -g .
```

### 🛠️ Local Development Setup (Make)
If you prefer using `make` to streamline your local development workflow, we've got you covered!

- Build the project:
```bash
make build
```
- Start development mode:
```bash
make dev
```
- Install the CLI globally from source:
```bash
make install-global
```

## 📁 Template Structure Explanation
When you scaffold a new project using `cmu create`, the following pristine directory structure is generated to separate concerns and organize your workflow:

- 📜 `contracts/`: For your raw Solidity smart contracts. This is where your core on-chain logic and magic resides!
- 🚀 `deploy/`: For sequential deployment scripts. Scripts here are executed natively in alphanumeric order (e.g., `01_token.ts`, `02_dao.ts`) when you deploy.
- 💾 `deployments/`: For storing immutable JSON artifacts of successfully deployed contracts. These files contain the contract address, ABI, and network details, serving as a permanent historical record.
- 🛠️ `scripts/`: For ad-hoc utility scripts. Use this sandbox directory for tasks like checking balances, interacting with deployed contracts, or database seeding.
- ⚙️ `cmu.config.ts`: The main brain/configuration file where you define your target networks, RPC URLs, chain IDs, and compiler versions.
- 🔐 `.env`: For sensitive variables like private keys. (A `.env.example` is generated for you automatically!)

## 🧰 CLI Help Output

When you run `cmu --help` in your terminal, you will see the following output:

```text
Usage: cmu [options] [command]

Primary development toolkit for the CointMU blockchain

Options:
  -V, --version                 output the version number
  -h, --help                    display help for command

Commands:
  create [options] <project>    Scaffolds a new CointMU project (interactive language and template selection)
  compile                       Reads Solidity files from the contracts folder and compiles them using solc
  deploy                        Sequentially executes all deployment scripts in the deploy/ directory
  wallet                        Wallet management commands
    create                      Generates a new crypto wallet and outputs the public/private keys
  explorer                      Explorer commands
    open                        Opens the local CointMU block explorer UI
  node                          Node management commands
    connect                     Pings the RPC endpoint defined in the config to test network connection
  audit                         Runs security checks and audits on the compiled smart contracts
  help [command]                display help for command
```

## ⚡ Quick Start

Here is a standard, lightning-fast workflow to get a new CointMU project up and running:

1. **Create a new development wallet**: 🔐
```bash
cmu wallet create
```
*(Make sure to save your private key securely in a safe place!)*

2. **Scaffold a new CointMU project**: ✨
```bash
cmu create my-awesome-dapp
```
*(You will be interactively prompted to choose between TypeScript/JavaScript and select a powerful template like blank, erc20, erc721, erc1155, dao, or marketplace!)*

3. **Navigate into your new project directory**: 📂
```bash
cd my-awesome-dapp
```

4. **Configure your environment**: ⚙️
Rename `.env.example` to `.env` and paste your newly generated private key into the `PRIVATE_KEY` variable.

5. **Compile your smart contracts**: 🔨
```bash
cmu compile
```

6. **Deploy your contracts to the network**: 🚀
```bash
cmu deploy
```
*(This will automatically and sequentially execute the scripts in your `deploy/` folder and save the precious artifacts to `deployments/`)*

7. **Test the connection to your local node**: 📡
```bash
cmu node connect
```

8. **View your transactions on the block explorer**: 🔍
```bash
cmu explorer open
```

---
Happy building on CointMU! 🎉✨
