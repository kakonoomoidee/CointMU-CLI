import { Command } from "commander";
import * as path from "path";
import { getRandomQuote } from "../utils/quotes";

interface CreateOptions {
  template?: string;
  language?: string;
}

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
  .action(async (project: string, options: CreateOptions) => {
    try {
      const fs = require("fs-extra");
      const inquirer = require("inquirer");
      const prompt = inquirer.prompt ?? inquirer.default?.prompt;
      const { generateProject } = require("../utils/template");

      if (project !== path.basename(project)) {
        console.error("Error: Project name cannot contain path separators.");
        process.exit(1);
      }

      const projectPath = path.resolve(process.cwd(), project);

      if (await fs.pathExists(projectPath)) {
        console.error(`Error: Directory '${project}' already exists.`);
        process.exit(1);
      }

      let template: string = options.template ?? "";
      let language: string = options.language ?? "";

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
        const answers = await prompt(questions);
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

      const randomQuote = getRandomQuote();
      console.log(`${cyan(randomQuote)}\n`);
    } catch (error) {
      console.error(
        "Failed to initialize project:",
        error instanceof Error ? error.message : String(error),
      );
      process.exit(1);
    }
  });
