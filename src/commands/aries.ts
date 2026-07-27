import { Command } from "commander";

const EXIT_FAILURE = 1;
const DIM_COLOR = "\x1b[2m";
const CYAN_COLOR = "\x1b[36m";
const GREEN_COLOR = "\x1b[32m";
const RESET_COLOR = "\x1b[0m";

/**
 * Executes the hidden easter egg sequence.
 * @param {object} options - CLI options.
 * @returns {Promise<void>}
 */
async function runAries(options: { verbose?: boolean } = {}): Promise<void> {
  try {
    const { getRandomSadQuote } = await import("../utils/quotes");

    console.log(
      `${DIM_COLOR}[INIT] Connecting to peer: 127.0.0.1:8333...${RESET_COLOR}`,
    );
    console.log(
      `${DIM_COLOR}[INIT] Bypassing standard consensus protocols...${RESET_COLOR}`,
    );
    console.log(
      `${DIM_COLOR}[INIT] Accessing Genesis Block data...${RESET_COLOR}`,
    );
    console.log("");
    console.log(
      `${CYAN_COLOR} > HW! aries instance awakened at Universitas Muhammadiyah Yogyakarta.${RESET_COLOR}`,
    );
    console.log(
      `${CYAN_COLOR} > The architect behind the scenes is watching.${RESET_COLOR}`,
    );
    console.log(`${GREEN_COLOR} > ${getRandomSadQuote()}${RESET_COLOR}`);
  } catch (error) {
    console.error("\n\x1b[31m[!] Execution failed:\x1b[0m");
    if (options.verbose) {
      console.error(error);
    } else {
      console.error(error instanceof Error ? error.message : String(error));
    }
    process.exit(EXIT_FAILURE);
  }
}

export const ariesCommand = new Command("aries")
  .description("Hidden easter egg command.")
  .option("-v, --verbose", "Enable verbose logging for debugging")
  .action(runAries);
