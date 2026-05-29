import { Command } from "commander";

/**
 * Executes the hidden easter egg sequence.
 * @param {any} _options The command options.
 * @param {Command} _command The command instance.
 * @returns {void}
 */
function runAries(_options: any, _command: Command): void {
  const dim = "\x1b[2m";
  const cyan = "\x1b[36m";
  const green = "\x1b[32m";
  const reset = "\x1b[0m";

  console.log(`${dim}[INIT] Connecting to peer: 127.0.0.1:8333...${reset}`);
  console.log(`${dim}[INIT] Bypassing standard consensus protocols...${reset}`);
  console.log(`${dim}[INIT] Accessing Genesis Block data...${reset}`);
  console.log("");
  console.log(
    `${cyan} > HW! aries instance awakened at Universitas Muhammadiyah Yogyakarta.${reset}`,
  );
  console.log(`${cyan} > The architect behind the scenes is watching.${reset}`);
  console.log(`${green} > Code is law, but the dev rules the chain.${reset}`);
}

export const ariesCommand = new Command("aries")
  .description("Hidden easter egg command.")
  .action(runAries);
