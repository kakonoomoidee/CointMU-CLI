import { Command } from 'commander';
import { spawn } from 'child_process';
import path from 'path';

export const deployCommand = new Command('deploy')
  .description('Executes a deployment script using ts-node')
  .argument('<script_path>', 'Path to the deployment script (e.g., scripts/deploy.ts)')
  .action((scriptPath: string) => {
    const fullScriptPath = path.resolve(process.cwd(), scriptPath);
    console.log(`Executing deployment script: ${fullScriptPath}...`);

    const child = spawn('npx', ['ts-node', fullScriptPath], {
      stdio: 'inherit',
      shell: process.platform === 'win32',
      env: {
        ...process.env,
      }
    });

    child.on('error', (error) => {
      console.error('Failed to start deployment script:', error);
      process.exit(1);
    });

    child.on('close', (code) => {
      if (code !== 0) {
        console.error(`Deployment script exited with code ${code}`);
        process.exit(code || 1);
      }
      console.log('Deployment script finished successfully.');
    });
  });
