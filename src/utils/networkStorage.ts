const NETWORKS_FILE_NAME = ".cmu-networks.json";
const DEFAULT_NETWORK_NAME = "local";
const DEFAULT_RPC_URL = "http://127.0.0.1:8585";
const JSON_SPACES = 2;

const FS_EXTRA_PKG = "fs-extra";
const PATH_PKG = "path";
const OS_PKG = "os";

export interface NetworkEntry {
  name: string;
  rpcUrl: string;
}

/**
 * Gets the absolute path to the networks storage file lazily.
 * @returns {Promise<string>} The file path.
 */
async function getNetworksFilePath(): Promise<string> {
  const os = await import(OS_PKG);
  const path = await import(PATH_PKG);
  return path.join(os.homedir(), NETWORKS_FILE_NAME);
}

/**
 * Loads the saved networks from .cmu-networks.json.
 * Initializes with a default 'local' network if the file is missing.
 * @returns {Promise<NetworkEntry[]>} The array of saved networks.
 */
export async function loadNetworks(): Promise<NetworkEntry[]> {
  const fs =
    (await import(FS_EXTRA_PKG)).default || (await import(FS_EXTRA_PKG));
  const filePath = await getNetworksFilePath();

  if (!(await fs.pathExists(filePath))) {
    const defaultNetworks: NetworkEntry[] = [
      { name: DEFAULT_NETWORK_NAME, rpcUrl: DEFAULT_RPC_URL },
    ];
    await fs.writeJson(filePath, defaultNetworks, { spaces: JSON_SPACES });
    return defaultNetworks;
  }
  return await fs.readJson(filePath);
}

/**
 * Saves a new network or updates an existing one by name.
 * @param {string} name - The network name.
 * @param {string} rpcUrl - The RPC URL.
 * @returns {Promise<void>}
 */
export async function saveNetwork(name: string, rpcUrl: string): Promise<void> {
  const fs =
    (await import(FS_EXTRA_PKG)).default || (await import(FS_EXTRA_PKG));
  const filePath = await getNetworksFilePath();
  const networks = await loadNetworks();
  const existingIndex = networks.findIndex((n) => n.name === name);

  if (existingIndex >= 0) {
    networks[existingIndex].rpcUrl = rpcUrl;
  } else {
    networks.push({ name, rpcUrl });
  }

  await fs.writeJson(filePath, networks, { spaces: JSON_SPACES });
}

/**
 * Deletes a network by name.
 * @param {string} name - The network name to delete.
 * @returns {Promise<boolean>} True if deleted, false if not found.
 */
export async function deleteNetwork(name: string): Promise<boolean> {
  const fs =
    (await import(FS_EXTRA_PKG)).default || (await import(FS_EXTRA_PKG));
  const filePath = await getNetworksFilePath();
  const networks = await loadNetworks();
  const existingIndex = networks.findIndex((n) => n.name === name);

  if (existingIndex === -1) {
    return false;
  }

  networks.splice(existingIndex, 1);
  await fs.writeJson(filePath, networks, { spaces: JSON_SPACES });
  return true;
}
