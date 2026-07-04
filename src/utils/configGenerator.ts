import * as fs from "fs-extra";
import * as path from "path";

const cmuConfigJs = `module.exports = {
  defaultNetwork: "cointmu_local",
  networks: {
    cointmu_local: {
      url: "http://127.0.0.1:8585",
      chainId: 1912,
    },
  },
  wallet: {
    privateKey: process.env.PRIVATE_KEY,
  },
  compiler: {
    version: "0.8.20",
  },
};
`;

const cmuConfigTs = `export default {
  defaultNetwork: "cointmu_local",
  networks: {
    cointmu_local: {
      url: "http://127.0.0.1:8585",
      chainId: 1912,
    },
  },
  wallet: {
    privateKey: process.env.PRIVATE_KEY,
  },
  compiler: {
    version: "0.8.20",
  },
};
`;

const envExampleTemplate = `PRIVATE_KEY=insert_your_private_key_here
`;

const gitignoreTemplate = `# Dependency directories
node_modules/

# Coverage output
coverage/

# Environment files
.env
.env.local
.env.test
.env.production

# Compiled artifacts
artifacts/
deployments/
dist/

# Logs
logs
*.log
npm-debug.log*
`;

/**
 * Generates the standard boilerplate configuration files for a scaffolded project.
 * Writes the appropriate `cmu.config` file, `.env.example`, and `.gitignore`
 * to the given directory based on the selected language.
 *
 * @param {string} projectPath - The absolute path to the target project directory.
 * @param {string} language - The language to use ('typescript' or 'javascript').
 * @returns {Promise<void>} Resolves when all files have been written successfully.
 */
export async function generateConfigFiles(
  projectPath: string,
  language: string,
): Promise<void> {
  const isTypeScript = language === "typescript";
  const configFileName = isTypeScript ? "cmu.config.ts" : "cmu.config.js";
  const configContent = isTypeScript ? cmuConfigTs : cmuConfigJs;

  await fs.writeFile(
    path.join(projectPath, configFileName),
    configContent,
    "utf8",
  );

  await fs.writeFile(
    path.join(projectPath, ".env.example"),
    envExampleTemplate,
    "utf8",
  );

  await fs.writeFile(
    path.join(projectPath, ".gitignore"),
    gitignoreTemplate,
    "utf8",
  );
}
