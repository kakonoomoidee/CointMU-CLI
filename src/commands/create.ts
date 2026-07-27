import { Command } from "commander";

const EXIT_FAILURE = 1;

interface CreateOptions {
  template?: string;
  language?: string;
  verbose?: boolean;
}

/**
 * Executes the project creation flow.
 * @param {string | undefined} project - The name of the project.
 * @param {CreateOptions} options - CLI options.
 * @returns {Promise<void>} Resolves when the project is fully initialized.
 */
async function runCreate(
  project: string | undefined,
  options: CreateOptions,
): Promise<void> {
  try {
    const path = await import("path");
    const fs = (await import("fs-extra")).default || (await import("fs-extra"));
    const { default: inquirer } = await import("inquirer");
    const { templateChoices, validTemplates, generateProject } =
      await import("../utils/template");
    const { getRandomQuote } = await import("../utils/quotes");

    let projectName = project?.trim() ?? "";

    if (!projectName) {
      const projectAnswer = await inquirer.prompt([
        {
          type: "input",
          name: "projectName",
          message: "Enter project name:",
          validate: (value: string) =>
            /^[a-zA-Z0-9_-]+$/.test(value.trim()) ||
            "Project name can only contain alphanumeric characters, hyphens, and underscores.",
        },
      ]);

      projectName = projectAnswer.projectName.trim();
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(projectName)) {
      throw new Error(
        "Project name can only contain alphanumeric characters, hyphens, and underscores.",
      );
    }

    const projectPath = path.resolve(process.cwd(), projectName);

    if (await fs.pathExists(projectPath)) {
      throw new Error(`Directory '${projectName}' already exists.`);
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
        choices: templateChoices,
      });
    }

    if (questions.length > 0) {
      const answers = (await inquirer.prompt(questions)) as {
        language?: string;
        template?: string;
      };

      if (!language && answers.language) language = answers.language;
      if (!template && answers.template) template = answers.template;
    }

    if (!validTemplates.includes(template)) {
      throw new Error(
        `Invalid template '${template}'. Valid options are: ${validTemplates.join(", ")}`,
      );
    }

    const validLanguages = ["typescript", "javascript"];

    if (!validLanguages.includes(language)) {
      throw new Error(
        `Invalid language '${language}'. Valid options are: ${validLanguages.join(", ")}`,
      );
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
      `${green(bold("[SUCCESS]"))} CointMU project '${cyan(projectName)}' initialized!\n`,
    );

    console.log(bold("[>] Next steps to start building:"));
    console.log(`  1. cd ${projectName}`);
    console.log(`  2. cmu compile`);
    console.log(`  3. cmu deploy\n`);

    const randomQuote = getRandomQuote();
    console.log(`${cyan(randomQuote)}\n`);
  } catch (error) {
    console.error("\n\x1b[31m[!] Failed to initialize project.\x1b[0m");

    if (options.verbose) {
      console.error(error);
    } else {
      console.error(error instanceof Error ? error.message : String(error));
    }

    process.exit(EXIT_FAILURE);
  }
}

export const createCommand = new Command("create")
  .description(
    "Initializes a new CointMU workspace with pre-configured templates",
  )
  .argument("[project]", "Name of the project directory to create")
  .option(
    "-t, --template <template>",
    "Template to use (blank, erc20, erc721, erc1155, dao, marketplace, staking, airdrop, vault, kyberion)",
  )
  .option(
    "-l, --language <language>",
    "Language to use (typescript, javascript)",
  )
  .option("-v, --verbose", "Enable verbose logging for debugging")
  .action(runCreate);
