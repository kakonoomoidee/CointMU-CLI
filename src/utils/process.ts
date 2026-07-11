import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

/**
 * Checks if a specific port is occupied and forcefully terminates the process occupying it.
 * Designed for Windows environments using netstat and taskkill.
 *
 * @param {number} port - The port number to check and free.
 * @returns {Promise<void>} Resolves when the operation is complete.
 */
export async function killPort(port: number): Promise<void> {
  try {
    const { stdout } = await execAsync(`netstat -ano | findstr :${port}`);

    if (!stdout) {
      console.log(`Port ${port} is free.`);
      return;
    }

    const lines = stdout.split("\n");
    let processKilled = false;

    for (const line of lines) {
      if (line.includes(`:${port}`) && line.includes("LISTENING")) {
        const parts = line.trim().split(/\s+/);
        const pid = parts[parts.length - 1];

        if (pid) {
          console.log(
            `Checking port ${port}... Port occupied by PID ${pid}, killing process...`,
          );
          try {
            await execAsync(`taskkill /F /PID ${pid}`);
            processKilled = true;
          } catch {
            console.warn(
              `Warning: Failed to kill process ${pid} on port ${port}.`,
            );
          }
        }
      }
    }

    if (!processKilled) {
      console.log(`Port ${port} is free.`);
    }
  } catch {
    // If findstr finds no matches, it exits with an error code, which is caught here.
    console.log(`Port ${port} is free.`);
  }
}
