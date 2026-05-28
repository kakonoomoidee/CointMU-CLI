# CointMU CLI (cmu-cli)

## Project Overview
The CointMU CLI (`cmu-cli`) is the primary development toolkit for the CointMU blockchain ecosystem. It provides developers with a robust, command-line interface to scaffold new projects, compile Solidity smart contracts, deploy them to the network, manage wallets, and interact with the local CointMU node and block explorer. Built with TypeScript, it streamlines the entire Web3 development lifecycle for the CointMU network.

## Installation Guide

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

## CLI Help Output

When you run `cmu --help` in your terminal, you will see the following output:

```text
Usage: cmu [options] [command]

Primary development toolkit for the CointMU blockchain

Options:
  -V, --version                 output the version number
  -h, --help                    display help for command

Commands:
  init <project>                Scaffolds the default CointMU project structure
  compile                       Reads Solidity files from the contracts folder and compiles them using solc
  deploy [options] <contract>   Reads compiled artifacts and deploys them to the CointMU network via RPC using ethers
  wallet                        Wallet management commands
    create                      Generates a new crypto wallet and outputs the public/private keys
  create                        Scaffold standard smart contract templates
    erc20                       Scaffolds a standard ERC20 smart contract template in the contracts folder
    nft                         Scaffolds a standard ERC721 smart contract template
  explorer                      Explorer commands
    open                        Opens the local CointMU block explorer UI
  node                          Node management commands
    connect                     Pings the RPC endpoint defined in the config to test network connection
  help [command]                display help for command
```

## Quick Start

Here is a standard workflow to get a new CointMU project up and running:

1. Check available commands to familiarize yourself with the CLI:
```bash
cmu --help
```

2. Create a new development wallet (make sure to save your private key securely):
```bash
cmu wallet create
```

3. Initialize a new CointMU project:
```bash
cmu init my-awesome-dapp
cd my-awesome-dapp
```

4. Scaffold a standard ERC20 token contract:
```bash
cmu create erc20
```

5. Compile your newly generated smart contract:
```bash
cmu compile
```

6. Ensure your CointMU node is running and test the connection:
```bash
cmu node connect
```

7. Deploy your compiled contract to the network (requires passing your private key):
```bash
cmu deploy StandardERC20 -k <your_private_key>
```

8. Open the local block explorer to view your deployment transactions:
```bash
cmu explorer open
```
