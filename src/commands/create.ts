import { Command } from "commander";
import fs from "fs-extra";
import path from "path";
import inquirer from "inquirer";
import { generateProject } from "../utils/template";

export const createCommand = new Command("create")
  .description("Scaffolds a new CointMU project")
  .argument("<project>", "Name of the project directory to create")
  .option(
    "-t, --template <template>",
    "Template to use (blank, erc20, erc721, erc1155, dao, marketplace)",
  )
  .option(
    "-l, --language <language>",
    "Language to use (typescript, javascript)",
  )
  .action(async (project: string, options) => {
    try {
      if (project !== path.basename(project)) {
        console.error("Error: Project name cannot contain path separators.");
        process.exit(1);
      }
      
      const projectPath = path.resolve(process.cwd(), project);

      if (fs.existsSync(projectPath)) {
        console.error(`Error: Directory '${project}' already exists.`);
        process.exit(1);
      }

      let template = options.template;
      let language = options.language;

      const questions = [];

      if (!language) {
        questions.push({
          type: "list",
          name: "language",
          message: "Select your preferred language:",
          choices: [
            { name: "TypeScript", value: "typescript" },
            { name: "JavaScript", value: "javascript" },
          ],
        });
      }

      if (!template) {
        questions.push({
          type: "list",
          name: "template",
          message: "Select a template:",
          choices: [
            {
              name: "Blank (Empty project with basic structure)",
              value: "blank",
            },
            { name: "ERC20 (Standard ERC20 Token)", value: "erc20" },
            { name: "ERC721 (Standard NFT Collection)", value: "erc721" },
            { name: "ERC1155 (Multi-Token Standard)", value: "erc1155" },
            {
              name: "DAO (Basic Decentralized Autonomous Organization)",
              value: "dao",
            },
            { name: "Marketplace (NFT Marketplace)", value: "marketplace" },
          ],
        });
      }

      if (questions.length > 0) {
        const answers = await inquirer.prompt(questions);
        if (!language) language = answers.language;
        if (!template) template = answers.template;
      }

      const validTemplates = [
        "blank",
        "erc20",
        "erc721",
        "nft",
        "erc1155",
        "dao",
        "marketplace",
      ];
      if (!validTemplates.includes(template)) {
        console.error(
          `Error: Invalid template '${template}'. Valid options are: ${validTemplates.join(", ")}`,
        );
        process.exit(1);
      }

      const validLanguages = ["typescript", "javascript"];
      if (!validLanguages.includes(language)) {
        console.error(
          `Error: Invalid language '${language}'. Valid options are: ${validLanguages.join(", ")}`,
        );
        process.exit(1);
      }

      await generateProject(projectPath, template, language);

      console.log("");
      const asciiArt = `   ______      _       __  _____  __ 
  / ____/___  (_)___  / /_/ __  \\/ / /
 / /   / __ \\/ / __ \\/ __/ / / / / / /
/ /___/ /_/ / / / / / /_/ / / / / /_/ /
\\____/\\____/_/_/ /_/\\__/_/ /_/_/\\____/`;

      const green = (text: string) => `\x1b[32m${text}\x1b[0m`;
      const cyan = (text: string) => `\x1b[36m${text}\x1b[0m`;
      const bold = (text: string) => `\x1b[1m${text}\x1b[0m`;

      console.log(cyan(bold(asciiArt)));
      console.log("");
      console.log(
        `${green(bold("[SUCCESS]"))} CointMU project '${cyan(project)}' initialized!\n`,
      );

      console.log(bold("[>] Next steps to start building:"));
      console.log(`  1. cd ${project}`);
      console.log(`  2. cmu compile`);
      console.log(`  3. cmu deploy\n`);

      const quotes = [
        '"Code is law, but you write the code." - Web3 Builder',
        '"Trust, but verify." - Satoshi Nakamoto',
        '"Vires in Numeris." - Bitcoin Motto',
        '"The future is decentralized." - Anonymous',
        '"Decentralization is not a feature, it is survival." - Crypto Visionary',
        '"Every block tells a story." - Blockchain Engineer',
        '"Consensus builds trust without kings." - Distributed Systems',
        '"Mine the future, one block at a time." - Miner Philosophy',
        '"Smart contracts, smarter future." - Web3 Developer',
        '"Not your keys, not your coins." - Crypto Community',
        '"Blockchain is the internet of value." - Anonymous',
        '"One node can start a revolution." - Decentralized Network',
        '"In cryptography we trust." - Cypherpunk',
        '"The chain never sleeps." - Blockchain Motto',
        '"Decentralized systems empower people." - Open Web Movement',
        '"Every hash matters." - PoW Miner',
        '"Freedom through cryptography." - Cypherpunk Manifesto',
        '"Nodes connected, future protected." - Network Builder',
        '"A distributed future starts today." - Blockchain Researcher',
        '"Blocks, hashes, consensus, freedom." - Web3 Philosophy',
        '"The strongest networks have no center." - Distributed Computing',
        '"Digital ownership changes everything." - NFT Creator',
        '"Transparency creates trust." - Open Blockchain',
        '"The ledger remembers everything." - Blockchain Principle',
        '"Build decentralized, think limitless." - Web3 Architect',
        '"Mining is proof of participation." - PoW Community',
        '"Open networks outlive closed empires." - Internet Philosophy',
        '"Innovation begins with one genesis block." - CointMU',
        '"Every validator protects the network." - Blockchain Security',
        '"A blockchain is only as strong as its nodes." - Network Theory',
        '"Peer-to-peer is people-to-people." - Decentralized Internet',
        '"Cryptography is the foundation of digital trust." - Security Research',
        '"One transaction can change an ecosystem." - Web3 Economy',
        '"Immutable by design." - Blockchain Core',
        '"The block is temporary, the chain is forever." - Anonymous',
        '"Decentralized networks resist centralized failure." - Distributed Systems',
        '"Build the chain you want to see in the world." - CointMU Labs',
        '"Innovation is born at the edge of decentralization." - Web3 Builder',
        '"Your wallet is your identity in Web3." - Crypto Community',
        '"Hash first, trust later." - Miner Motto',
      ];
      const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
      console.log(`${cyan(randomQuote)}\n`);
    } catch (error) {
      console.error("Failed to initialize project:", error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  });
