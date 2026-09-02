const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const PACKAGE_JSON_PATH = path.resolve(__dirname, "../package.json");
const MAKEFILE_PATH = path.resolve(__dirname, "../Makefile");
const ENCODING_UTF8 = "utf8";

const ARG_POSITION_SUBCOMMAND = 2;
const ARG_POSITION_VALUE = 3;
const VERSION_PARTS_LENGTH = 3;
const PART_MAJOR_INDEX = 0;
const PART_MINOR_INDEX = 1;
const PART_PATCH_INDEX = 2;
const INDENT_SPACES = 2;

const EXIT_CODE_ERROR = 1;

const USAGE = [
  "Usage:",
  "  node scripts/bump-version.js bump <major|minor|patch>   Bump version only",
  "  node scripts/bump-version.js codename <name>            Update codename only",
].join("\n");

/**
 * Reads and parses the package.json file.
 * @returns {Object} The parsed package.json object.
 */
function readPackageJson() {
  const content = fs.readFileSync(PACKAGE_JSON_PATH, ENCODING_UTF8);
  return JSON.parse(content);
}

/**
 * Writes the updated package.json object back to the file.
 * @param {Object} pkg - The package.json object to write.
 * @returns {void}
 */
function writePackageJson(pkg) {
  const content = JSON.stringify(pkg, null, INDENT_SPACES) + "\n";
  fs.writeFileSync(PACKAGE_JSON_PATH, content, ENCODING_UTF8);
}

/**
 * Reads the content of the Makefile.
 * @returns {string} The content of the Makefile.
 */
function readMakefile() {
  return fs.readFileSync(MAKEFILE_PATH, ENCODING_UTF8);
}

/**
 * Writes the updated content back to the Makefile.
 * @param {string} content - The string content to write.
 * @returns {void}
 */
function writeMakefile(content) {
  fs.writeFileSync(MAKEFILE_PATH, content, ENCODING_UTF8);
}

/**
 * Bumps the version string based on the given bump type.
 * @param {string} currentVersion - The current pure version string.
 * @param {string} bumpType - The type of bump (major, minor, patch).
 * @returns {string} The new version string without any pre-release tags.
 */
function calculateNewVersion(currentVersion, bumpType) {
  const parts = currentVersion.split(".").map(Number);

  if (parts.length !== VERSION_PARTS_LENGTH) {
    throw new Error("Invalid version format in package.json");
  }

  let major = parts[PART_MAJOR_INDEX];
  let minor = parts[PART_MINOR_INDEX];
  let patch = parts[PART_PATCH_INDEX];

  if (bumpType === "major") {
    major += 1;
    minor = 0;
    patch = 0;
  } else if (bumpType === "minor") {
    minor += 1;
    patch = 0;
  } else if (bumpType === "patch") {
    patch += 1;
  } else {
    throw new Error("Invalid bump type. Use major, minor, or patch.");
  }

  return `${major}.${minor}.${patch}`;
}

/**
 * Updates only the version number variables in the Makefile content.
 * @param {string} makefileContent - The original Makefile content.
 * @param {string} newVersion - The new version string to set.
 * @returns {string} The updated Makefile content.
 */
function updateMakefileVersionNumbers(makefileContent, newVersion) {
  const parts = newVersion.split(".").map(Number);

  let updated = makefileContent.replace(
    /^VERSION\s*=\s*.*$/m,
    `VERSION = ${parts[PART_MAJOR_INDEX]}`
  );
  updated = updated.replace(
    /^PATCHLEVEL\s*=\s*.*$/m,
    `PATCHLEVEL = ${parts[PART_MINOR_INDEX]}`
  );
  updated = updated.replace(
    /^SUBLEVEL\s*=\s*.*$/m,
    `SUBLEVEL = ${parts[PART_PATCH_INDEX]}`
  );

  return updated;
}

/**
 * Updates only the CODENAME variable in the Makefile content.
 * @param {string} makefileContent - The original Makefile content.
 * @param {string} codename - The codename to set.
 * @returns {string} The updated Makefile content.
 */
function updateMakefileCodename(makefileContent, codename) {
  return makefileContent.replace(
    /^CODENAME\s*=\s*.*$/m,
    `CODENAME = ${codename}`
  );
}

/**
 * Executes a shell command synchronously and logs the output.
 * @param {string} command - The shell command to execute.
 * @returns {void}
 */
function runCommand(command) {
  console.log(`Executing: ${command}`);
  execSync(command, { stdio: "inherit", cwd: path.resolve(__dirname, "..") });
}

/**
 * Runs the "bump" sub-command: version only, no codename.
 * @param {string} bumpType - major, minor, or patch.
 * @returns {void}
 */
function runBump(bumpType) {
  if (!bumpType) {
    console.error(USAGE);
    process.exit(EXIT_CODE_ERROR);
  }

  const pkg = readPackageJson();
  const currentVersion = pkg.version.split("-")[0];
  const newVersion = calculateNewVersion(currentVersion, bumpType);

  console.log(`Bumping version from ${currentVersion} to ${newVersion}`);

  pkg.version = newVersion;
  writePackageJson(pkg);

  writeMakefile(updateMakefileVersionNumbers(readMakefile(), newVersion));

  runCommand("npm install");
  runCommand("git add .");
  runCommand(`git commit -m "chore: release version ${newVersion}"`);
  runCommand(`git tag -a v${newVersion} -m "Release v${newVersion}"`);
  runCommand("git push origin HEAD");
  runCommand("git push origin --tags");

  console.log(`Successfully released version ${newVersion}`);
}

/**
 * Runs the "codename" sub-command: codename only, no version bump, no tag.
 * @param {string} codename - The new codename.
 * @returns {void}
 */
function runCodename(codename) {
  if (!codename) {
    console.error(USAGE);
    process.exit(EXIT_CODE_ERROR);
  }

  const pkg = readPackageJson();
  console.log(`Updating codename from ${pkg.codename} to ${codename}`);

  pkg.codename = codename;
  writePackageJson(pkg);

  writeMakefile(updateMakefileCodename(readMakefile(), codename));

  runCommand("git add .");
  runCommand(`git commit -m "chore: rename codename to ${codename}"`);
  runCommand("git push origin HEAD");

  console.log(`Successfully renamed codename to ${codename}`);
}

/**
 * Main execution flow for the bump version script.
 * @returns {void}
 */
function main() {
  const args = process.argv;
  const subcommand = args[ARG_POSITION_SUBCOMMAND];
  const value = args[ARG_POSITION_VALUE];

  if (subcommand === "bump") {
    runBump(value);
  } else if (subcommand === "codename") {
    runCodename(value);
  } else {
    console.error(USAGE);
    process.exit(EXIT_CODE_ERROR);
  }
}

main();
