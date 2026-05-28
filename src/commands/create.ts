import { Command } from 'commander';
import fs from 'fs-extra';
import path from 'path';
import inquirer from 'inquirer';
import { generateProject } from '../utils/template';

export const createCommand = new Command('create')
  .description('Scaffolds a new CointMU project')
  .argument('<project>', 'Name of the project directory to create')
  .option('-t, --template <template>', 'Template to use (blank, erc20, erc721, erc1155, dao, marketplace)')
  .option('-l, --language <language>', 'Language to use (typescript, javascript)')
  .action(async (project: string, options) => {
    try {
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
          type: 'list',
          name: 'language',
          message: 'Select your preferred language:',
          choices: [
            { name: 'TypeScript', value: 'typescript' },
            { name: 'JavaScript', value: 'javascript' }
          ]
        });
      }

      if (!template) {
        questions.push({
          type: 'list',
          name: 'template',
          message: 'Select a template:',
          choices: [
            { name: 'Blank (Empty project with basic structure)', value: 'blank' },
            { name: 'ERC20 (Standard ERC20 Token)', value: 'erc20' },
            { name: 'ERC721 (Standard NFT Collection)', value: 'erc721' },
            { name: 'ERC1155 (Multi-Token Standard)', value: 'erc1155' },
            { name: 'DAO (Basic Decentralized Autonomous Organization)', value: 'dao' },
            { name: 'Marketplace (NFT Marketplace)', value: 'marketplace' }
          ],
        });
      }

      if (questions.length > 0) {
        const answers = await inquirer.prompt(questions);
        if (!language) language = answers.language;
        if (!template) template = answers.template;
      }

      const validTemplates = ['blank', 'erc20', 'erc721', 'nft', 'erc1155', 'dao', 'marketplace'];
      if (!validTemplates.includes(template)) {
        console.error(`Error: Invalid template '${template}'. Valid options are: ${validTemplates.join(', ')}`);
        process.exit(1);
      }

      const validLanguages = ['typescript', 'javascript'];
      if (!validLanguages.includes(language)) {
        console.error(`Error: Invalid language '${language}'. Valid options are: ${validLanguages.join(', ')}`);
        process.exit(1);
      }

      console.log(`Initializing CointMU project in ${projectPath} using '${template}' template and '${language}'...`);

      await generateProject(projectPath, template, language);

      console.log('Project initialized successfully.');
      console.log(`\nNext steps:\n  cd ${project}\n  cmu compile\n`);
    } catch (error) {
      console.error('Failed to initialize project:', error);
      process.exit(1);
    }
  });
