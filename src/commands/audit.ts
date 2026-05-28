import { Command } from 'commander';
import { spawn } from 'child_process';

/**
 * @dev Executes an external command in a child process.
 * @param command string The command to execute (e.g. 'npm', 'npx').
 * @param args string[] The arguments to pass to the command.
 * @returns {Promise<void>} Resolves when the command successfully completes.
 */
function runCommand(command: string, args: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    console.log(`\x1b[36m> Executing: ${command} ${args.join(' ')}\x1b[0m`);
    
    const executable = process.platform === 'win32' ? `${command}.cmd` : command;
    const child = spawn(executable, args, {
      stdio: 'inherit',
      shell: false
    });

    child.on('error', (error) => {
      reject(error);
    });

    child.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`Command failed with exit code ${code}`));
      } else {
        resolve();
      }
    });
  });
}

export const auditCommand = new Command('audit')
  .description('Runs security checks and audits on the project dependencies and smart contracts')
  .option('--fix', 'Automatically apply safe fixes for vulnerabilities')
  .action(async (options) => {
    try {
      console.log('\n\x1b[1m\x1b[34m[1/2] Auditing Node.js Dependencies\x1b[0m');
      
      const npmArgs = ['audit'];
      if (options.fix) {
        npmArgs.push('fix');
      }
      
      await runCommand('npm', npmArgs).catch(err => {
        console.warn(`\x1b[33mWarning: Node dependency audit reported issues.\x1b[0m`);
      });

      console.log('\n\x1b[1m\x1b[34m[2/2] Static Analysis of Solidity Contracts\x1b[0m');
      
      const solhintArgs = ['solhint', 'contracts/**/*.sol'];
      if (options.fix) {
        solhintArgs.push('--fix');
      }
      
      await runCommand('npx', solhintArgs).catch(err => {
        console.warn(`\x1b[33mWarning: Solidity static analysis found vulnerabilities or formatting issues.\x1b[0m`);
      });

      console.log('\n\x1b[1m\x1b[32m[+] Audit process completed.\x1b[0m\n');
    } catch (error) {
      console.error('\n\x1b[31m[!] Audit failed to execute completely.\x1b[0m');
      console.error(error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  });
