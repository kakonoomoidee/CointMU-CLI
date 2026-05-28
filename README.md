# 🚀 CointMU CLI (cmu-cli)

## 🌟 Project Overview
The CointMU CLI (`cmu-cli`) is the primary development toolkit for the CointMU blockchain ecosystem. It provides developers with a robust, modern command-line interface to interactively scaffold new projects, compile Solidity smart contracts, execute deployment scripts, manage wallets, and interact with the local CointMU node and block explorer. 

Built with TypeScript and Vite-like interactive prompts, it streamlines the entire Web3 development lifecycle for the CointMU network! 🛠️

## 📦 Installation Guide

### Global Installation via NPM
To install the `cmu-cli` package globally so you can use the `cmu` command from any directory, run the following command:

```bash
npm install -g cmu-cli
```

### Local Development Setup
If you are developing or contributing to the CLI itself, you can set it up locally:

1. Clone the repository and navigate into the directory:
```bash
git clone <repository_url>
cd CointMU-CLI
```

2. Install dependencies:
```bash
npm install
```

3. Build the TypeScript source code:
```bash
npm run build
```

4. Link the package globally for local testing:
```bash
npm install -g .
```

## 🧰 CLI Help Output

When you run `cmu --help` in your terminal, you will see the following output:

```text
Usage: cmu [options] [command]

Primary development toolkit for the CointMU blockchain

Options:
  -V, --version                 output the version number
  -h, --help                    display help for command

Commands:
  create [options] <project>    Scaffolds a new CointMU project (interactive template selection)
  compile                       Reads Solidity files from the contracts folder and compiles them using solc
  deploy <script_path>          Executes a deployment script using ts-node
  wallet                        Wallet management commands
    create                      Generates a new crypto wallet and outputs the public/private keys
  explorer                      Explorer commands
    open                        Opens the local CointMU block explorer UI
  node                          Node management commands
    connect                     Pings the RPC endpoint defined in the config to test network connection
  help [command]                display help for command
```

## ⚡ Quick Start

Here is a standard workflow to get a new CointMU project up and running:

1. **Check available commands** to familiarize yourself with the CLI: ℹ️
```bash
cmu --help
```

2. **Create a new development wallet** (make sure to save your private key securely!): 🔐
```bash
cmu wallet create
```

3. **Scaffold a new CointMU project** using the interactive Vite-like prompt: ✨
```bash
cmu create my-awesome-dapp
```
*(You will be asked to choose between `blank`, `erc20`, or `nft` templates. Each template automatically generates a `.env.example`, `cmu.config.ts`, `.gitignore`, and a deployment script!)*

4. **Navigate into your new project directory**: 📂
```bash
cd my-awesome-dapp
```

5. **Configure your environment**: ⚙️
Rename `.env.example` to `.env` and paste your newly generated private key into the `PRIVATE_KEY` variable.

6. **Compile your newly generated smart contracts**: 🔨
```bash
cmu compile
```

7. **Ensure your CointMU node is running** and test the connection: 📡
```bash
cmu node connect
```

8. **Deploy your compiled contract** to the network using the generated deployment script: 🚀
```bash
cmu deploy scripts/deploy.ts
```

9. **Open the local block explorer** to view your deployment transactions: 🔍
```bash
cmu explorer open
```

---
Happy building on CointMU! 🎉
