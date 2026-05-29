import { Command } from "commander";

export const walletCommand = new Command("wallet").description(
  "Wallet management commands",
);

walletCommand
  .command("create")
  .description(
    "Generates a new crypto wallet and outputs the public/private keys",
  )
  .action(() => {
    try {
      const { ethers } = require("ethers");
      const wallet = ethers.Wallet.createRandom();
      console.log("New CointMU Wallet Created:");
      console.log("---------------------------");
      console.log(`Address:     ${wallet.address}`);
      console.log(`Private Key: ${wallet.privateKey}`);
      console.log("---------------------------");
      console.log("Warning: Keep your private key safe and never share it!");
    } catch (error) {
      console.error(
        "Failed to create wallet:",
        error instanceof Error ? error.message : String(error),
      );
      process.exit(1);
    }
  });
