const fs = require("fs");
const path = require("path");

/**
 * Generates a compact 8-character hexadecimal build identifier.
 * @returns {string} An 8-character lowercase hex build ID.
 */
function generateBuildId(): string {
  const timestampHex = Math.floor(Date.now() / 1000)
    .toString(16)
    .slice(-5);
  const randomHex = Math.random().toString(16).substring(2, 5);
  return timestampHex + randomHex;
}

/**
 * Generates a new build ID, saves it to build-info.json,
 * and updates the BUILD variable in the Makefile.
 * @returns {void}
 */
function updateBuildId(): void {
  const rootDir = __dirname;
  const jsonPath = path.join(rootDir, "build-info.json");
  const makefilePath = path.join(rootDir, "Makefile");
  const buildId = generateBuildId();

  fs.writeFileSync(
    jsonPath,
    JSON.stringify({ build: buildId }, null, 2),
    "utf-8",
  );

  if (fs.existsSync(makefilePath)) {
    let makefileContent = fs.readFileSync(makefilePath, "utf-8");
    makefileContent = makefileContent.replace(
      /^BUILD\s*=\s*.*$/m,
      `BUILD = ${buildId}`,
    );
    fs.writeFileSync(makefilePath, makefileContent, "utf-8");
  }

  console.log(`Build ID updated to ${buildId}`);
}

updateBuildId();
