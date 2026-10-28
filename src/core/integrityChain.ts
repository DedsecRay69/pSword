/**
 * Cadena de integridad local, inspirada en blockchain.
 * Cada versión guardada de la bóveda agrega un bloque con el hash del archivo .pws cifrado
 * (nunca contraseñas), enlazado al bloque anterior y firmado con HMAC.
 *
 *   hash      = SHA-256( índice | fecha | hashBóveda | hashAnterior )
 *   firma     = HMAC( claveMAC, hash )         // claveMAC sale de la contraseña maestra
 *
 * Lo que detecta cada capa:
 *  - Enlaces + hash: edición o borrado de bloques intermedios.
 *  - HMAC: reescritura completa de la cadena por quien no conoce la contraseña.
 *  - Último bloque anclado en SecureStore: sustitución por una versión anterior (rollback).
 */
import { constantTimeEqual, hmacHex, sha256Hex } from "./crypto";
import { utf8Encode } from "./encoding";

export const GENESIS_PREV_HASH = "0".repeat(64);

export type Block = {
  index: number; // número de versión (0 = creación de la bóveda)
  date: string; // ISO 8601
  vaultHash: string; // SHA-256 del archivo .pws cifrado
  prevHash: string; // hash del bloque anterior
  hash: string; // hash de este bloque
  signature: string; // HMAC del hash
};

export type ChainHead = { index: number; hash: string };

export type ChainCheck =
  | { ok: true }
  | { ok: false; reason: "empty" | "bad-index" | "bad-link" | "bad-hash" | "bad-signature"; index: number };

async function blockHash(b: Pick<Block, "index" | "date" | "vaultHash" | "prevHash">): Promise<string> {
  return sha256Hex(utf8Encode(`${b.index}|${b.date}|${b.vaultHash}|${b.prevHash}`));
}

// Crea un bloque nuevo firmado.
export async function createBlock(
  index: number,
  vaultHash: string,
  prevHash: string,
  macKey: Uint8Array,
): Promise<Block> {
  const base = { index, date: new Date().toISOString(), vaultHash, prevHash };
  const hash = await blockHash(base);
  const signature = await hmacHex(utf8Encode(hash), macKey);
  return { ...base, hash, signature };
}

/**
 * Verifica estructura, enlaces y hashes. Sin clave no comprueba firmas
 * (sirve para diagnosticar antes de conocer la contraseña).
 * Con macKey comprueba además cada firma HMAC.
 */
export async function verifyChain(chain: Block[], macKey?: Uint8Array): Promise<ChainCheck> {
  if (chain.length === 0) return { ok: false, reason: "empty", index: -1 };
  for (let i = 0; i < chain.length; i++) {
    const b = chain[i];
    if (b.index !== i) return { ok: false, reason: "bad-index", index: i };
    const expectedPrev = i === 0 ? GENESIS_PREV_HASH : chain[i - 1].hash;
    if (b.prevHash !== expectedPrev) return { ok: false, reason: "bad-link", index: i };
    if (!constantTimeEqual(b.hash, await blockHash(b))) return { ok: false, reason: "bad-hash", index: i };
    if (macKey) {
      const expectedSig = await hmacHex(utf8Encode(b.hash), macKey);
      if (!constantTimeEqual(b.signature, expectedSig)) return { ok: false, reason: "bad-signature", index: i };
    }
  }
  return { ok: true };
}

// Vuelve a firmar toda la cadena con otra clave (al cambiar la contraseña maestra).
export async function resignChain(chain: Block[], newMacKey: Uint8Array): Promise<Block[]> {
  const out: Block[] = [];
  for (const b of chain) {
    out.push({ ...b, signature: await hmacHex(utf8Encode(b.hash), newMacKey) });
  }
  return out;
}

const CHAIN_FORMAT = "pSword-chain";

export function serializeChain(chain: Block[]): string {
  return JSON.stringify({ format: CHAIN_FORMAT, version: 1, blocks: chain });
}

// Lee la cadena guardada. Devuelve null si el contenido no tiene la forma esperada.
export function parseChain(text: string | null): Block[] | null {
  if (text === null) return null;
  try {
    const raw = JSON.parse(text);
    if (raw?.format !== CHAIN_FORMAT || raw.version !== 1 || !Array.isArray(raw.blocks)) return null;
    for (const b of raw.blocks) {
      if (
        !Number.isInteger(b?.index) || typeof b.date !== "string" || typeof b.vaultHash !== "string" ||
        typeof b.prevHash !== "string" || typeof b.hash !== "string" || typeof b.signature !== "string"
      ) return null;
    }
    return raw.blocks as Block[];
  } catch {
    return null;
  }
}

export function parseHead(text: string | null): ChainHead | null {
  if (text === null) return null;
  try {
    const raw = JSON.parse(text);
    if (Number.isInteger(raw?.index) && typeof raw.hash === "string") return { index: raw.index, hash: raw.hash };
  } catch {
    /* se trata como ausente */
  }
  return null;
}
