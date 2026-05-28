import { Command } from 'commander';
import fs from 'fs-extra';
import path from 'path';

export const initCommand = new Command('init')
  .description('Scaffolds the default CointMU project structure')
  .argument('<project>', 'Name of the project directory to create')
  .action(async (project: string) => {
    try {
      const projectPath = path.resolve(process.cwd(), project);
      
      if (fs.existsSync(projectPath)) {
        console.error(`Error: Directory '${project}' already exists.`);
        process.exit(1);
      }

      console.log(`Initializing CointMU project in ${projectPath}...`);

      // Create directories
      const dirs = ['contracts', 'scripts', 'artifacts', 'deployments'];
      for (const dir of dirs) {
        await fs.ensureDir(path.join(projectPath, dir));
      }

      // Create cmu.config.json
      const config = {
        network: {
          rpcUrl: "http://localhost:8545",
          chainId: 1337
        },
        compiler: {
          version: "0.8.21"
        }
      };
      await fs.writeJson(path.join(projectPath, 'cmu.config.json'), config, { spaces: 2 });

      // Create tsconfig.json
      const tsconfig = {
        compilerOptions: {
          target: "ES2022",
          module: "CommonJS",
          moduleResolution: "node",
          strict: true,
          esModuleInterop: true,
          skipLibCheck: true,
          forceConsistentCasingInFileNames: true
        },
        include: ["scripts/**/*"]
      };
      await fs.writeJson(path.join(projectPath, 'tsconfig.json'), tsconfig, { spaces: 2 });

      console.log('Project initialized successfully.');
    } catch (error) {
      console.error('Failed to initialize project:', error);
      process.exit(1);
    }
  });
