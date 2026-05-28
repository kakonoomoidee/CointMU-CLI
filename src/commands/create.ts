import { Command } from 'commander';
import fs from 'fs-extra';
import path from 'path';
import inquirer from 'inquirer';
import { generateProject } from '../utils/template';

export const createCommand = new Command('create')
  .description('Scaffolds a new CointMU project')
  .argument('<project>', 'Name of the project directory to create')
  .option('-t, --template <template>', 'Template to use (blank, erc20, nft)')
  .action(async (project: string, options) => {
    try {
      const projectPath = path.resolve(process.cwd(), project);
      
      if (fs.existsSync(projectPath)) {
        console.error(`Error: Directory '${project}' already exists.`);
        process.exit(1);
      }

      let template = options.template;

      if (!template) {
        const answers = await inquirer.prompt([
          {
            type: 'list',
            name: 'template',
            message: 'Select a template:',
            choices: [
              { name: 'Blank (Empty project with basic structure)', value: 'blank' },
              { name: 'ERC20 (Standard ERC20 contract and deployment script)', value: 'erc20' },
              { name: 'NFT (Standard ERC721 contract and deployment script)', value: 'nft' }
            ],
          }
        ]);
        template = answers.template;
      }

      const validTemplates = ['blank', 'erc20', 'nft'];
      if (!validTemplates.includes(template)) {
        console.error(`Error: Invalid template '${template}'. Valid options are: ${validTemplates.join(', ')}`);
        process.exit(1);
      }

      console.log(`Initializing CointMU project in ${projectPath} using '${template}' template...`);

      await generateProject(projectPath, template);

      console.log('Project initialized successfully.');
      console.log(`\nNext steps:\n  cd ${project}\n  cmu compile\n`);
    } catch (error) {
      console.error('Failed to initialize project:', error);
      process.exit(1);
    }
  });
