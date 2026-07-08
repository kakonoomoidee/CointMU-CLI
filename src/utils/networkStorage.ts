import * as fs from "fs-extra";
import * as path from "path";
import * as os from "os";

const NETWORKS_FILE = path.join(os.homedir(), ".cmu-networks.json");

export interface NetworkEntry {
  name: string;
  rpcUrl: string;
}

/**
 * Loads the saved networks from .cmu-networks.json.
 * Initializes with a default 'local' network if the file is missing.
 * @returns {Promise<NetworkEntry[]>} The array of saved networks.
 */
export async function loadNetworks(): Promise<NetworkEntry[]> {
  if (!(await fs.pathExists(NETWORKS_FILE))) {
    const defaultNetworks: NetworkEntry[] = [
      { name: "local", rpcUrl: "http://127.0.0.1:8585" },
    ];
    await fs.writeJson(NETWORKS_FILE, defaultNetworks, { spaces: 2 });
    return defaultNetworks;
  }
  return await fs.readJson(NETWORKS_FILE);
}

/**
 * Saves a new network or updates an existing one by name.
 * @param {string} name - The network name.
 * @param {string} rpcUrl - The RPC URL.
 * @returns {Promise<void>}
 */
export async function saveNetwork(name: string, rpcUrl: string): Promise<void> {
  const networks = await loadNetworks();
  const existingIndex = networks.findIndex((n) => n.name === name);

  if (existingIndex >= 0) {
    networks[existingIndex].rpcUrl = rpcUrl;
  } else {
    networks.push({ name, rpcUrl });
  }

  await fs.writeJson(NETWORKS_FILE, networks, { spaces: 2 });
}

/**
 * Deletes a network by name.
 * @param {string} name - The network name to delete.
 * @returns {Promise<boolean>} True if deleted, false if not found.
 */
export async function deleteNetwork(name: string): Promise<boolean> {
  const networks = await loadNetworks();
  const existingIndex = networks.findIndex((n) => n.name === name);

  if (existingIndex === -1) {
    return false;
  }

  networks.splice(existingIndex, 1);
  await fs.writeJson(NETWORKS_FILE, networks, { spaces: 2 });
  return true;
}
