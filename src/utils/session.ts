import * as crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const SESSION_FILE_NAME = ".cmu-session";
const SALT_BYTES = 16;
const IV_BYTES = 12; // 96-bit IV is the standard nonce size for AES-GCM
const PBKDF2_ITERATIONS = 100000;
const KEY_LENGTH = 32;
const DIGEST = "sha256";

export interface SessionData {
  address: string;
  activeNetwork: string;
  encryptedKey?: string;
  salt?: string;
  iv?: string;
  authTag?: string;
}

export interface EncryptedKey {
  encryptedKey: string;
  salt: string;
  iv: string;
  authTag: string;
}

/** In-memory cache of the decrypted key for the lifetime of one CLI process. */
let cachedKey: string | undefined;

/** Resets the in-memory decrypted-key cache. Exposed for tests. */
export function clearCachedKey(): void {
  cachedKey = undefined;
}

/** Derives the AES key from a password + salt using the shared PBKDF2 params. */
function deriveKey(password: string, salt: Buffer): Buffer {
  return crypto.pbkdf2Sync(
    password,
    salt,
    PBKDF2_ITERATIONS,
    KEY_LENGTH,
    DIGEST,
  );
}

/**
 * Encrypts a private key for storage in .cmu-session using AES-256-GCM.
 * The returned authTag must be persisted and verified on decrypt so a
 * tampered session file is rejected instead of silently mis-decrypting.
 */
export function encryptSessionKey(
  password: string,
  privateKey: string,
): EncryptedKey {
  const salt = crypto.randomBytes(SALT_BYTES);
  const iv = crypto.randomBytes(IV_BYTES);
  const key = deriveKey(password, salt);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encryptedKey = cipher.update(privateKey, "utf8", "hex");
  encryptedKey += cipher.final("hex");

  return {
    encryptedKey,
    salt: salt.toString("hex"),
    iv: iv.toString("hex"),
    authTag: cipher.getAuthTag().toString("hex"),
  };
}

/**
 * Re-derives the AES key and decrypts the private key stored in a session.
 * Any crypto failure (wrong password or tampered file, caught by the GCM
 * auth tag) is surfaced as a single clear error rather than a raw crypto
 * exception.
 *
 * @param {string} password - The session password.
 * @param {SessionData} session - The parsed .cmu-session contents.
 * @returns {string} The decrypted private key.
 */
export function decryptSessionKey(
  password: string,
  session: SessionData,
): string {
  if (
    !session.encryptedKey ||
    !session.salt ||
    !session.iv ||
    !session.authTag
  ) {
    throw new Error(
      "Session file does not contain an encrypted key. Run 'cmu wallet login' first.",
    );
  }

  try {
    const key = deriveKey(password, Buffer.from(session.salt, "hex"));
    const decipher = crypto.createDecipheriv(
      ALGORITHM,
      key,
      Buffer.from(session.iv, "hex"),
    );
    decipher.setAuthTag(Buffer.from(session.authTag, "hex"));

    let decrypted = decipher.update(session.encryptedKey, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  } catch {
    throw new Error(
      "Invalid session password, or the .cmu-session file has been tampered with.",
    );
  }
}

/**
 * Resolves a usable private key for the current CLI run.
 *
 * Priority: process.env.PRIVATE_KEY wins (env override, fully backward
 * compatible). Otherwise, if an encrypted .cmu-session exists, prompt once
 * for its password, decrypt, and cache the result in memory for the rest of
 * the process. Returns undefined when neither source is available so callers
 * can keep their existing "not defined" error behavior.
 *
 * @param {object} [options]
 * @param {boolean} [options.prompt=true] - Set false to skip the password
 *   prompt (used for `deploy --config` / `deploy --ping` dry runs).
 * @returns {Promise<string | undefined>} The resolved private key, if any.
 */
export async function resolvePrivateKey(
  options: { prompt?: boolean } = {},
): Promise<string | undefined> {
  if (process.env.PRIVATE_KEY) {
    return process.env.PRIVATE_KEY;
  }
  if (cachedKey) {
    return cachedKey;
  }

  const fs = (await import("fs-extra")).default || (await import("fs-extra"));
  const path = await import("path");
  const sessionFile = path.resolve(process.cwd(), SESSION_FILE_NAME);

  if (!(await fs.pathExists(sessionFile))) {
    return undefined;
  }

  const session: SessionData = await fs.readJson(sessionFile);
  if (!session.encryptedKey) {
    return undefined;
  }
  if (options.prompt === false) {
    return undefined;
  }

  const inquirer = (await import("inquirer")).default;
  const { password } = await inquirer.prompt([
    {
      type: "password",
      name: "password",
      message: `Enter session password for ${session.address}:`,
      mask: "*",
    },
  ]);

  cachedKey = decryptSessionKey(password, session);
  return cachedKey;
}
