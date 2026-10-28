/**
 * Formato del archivo .pws (versión 1).
 *
 * Es un JSON de texto, legible y documentado; solo el contenido va cifrado:
 *
 *   {
 *     "format": "pSword-vault",
 *     "version": 1,
 *     "kdf":    { "alg": "argon2id13", "opslimit": 3, "memlimit": 67108864, "salt": "<b64, 16 B>" },
 *     "cipher": { "alg": "xchacha20poly1305-ietf", "nonce": "<b64, 24 B>" },
 *     "ciphertext": "<b64>",   // credenciales en JSON, cifradas
 *     "tag": "<b64, 16 B>"     // etiqueta de autenticación Poly1305
 *   }
 *
 * El encabezado (formato, versión, KDF y sal) NO es secreto pero queda autenticado: se pasa como
 * datos asociados (AAD) al cifrado, de modo que cambiar un parámetro invalida la etiqueta.
 */
import {
  aeadDecrypt,
  aeadEncrypt,
  KDF_LIMITS,
  KdfParams,
  NONCE_BYTES,
  SALT_BYTES,
  TAG_BYTES,
} from "./crypto";
import { fromBase64, toBase64, utf8Decode, utf8Encode } from "./encoding";
import { VaultCredential } from "./types";

export const FORMAT_NAME = "pSword-vault";
export const FORMAT_VERSION = 1;
export const KDF_ALG = "argon2id13";
export const CIPHER_ALG = "xchacha20poly1305-ietf";

export class VaultFormatError extends Error {}

export type ParsedVaultFile = {
  kdf: KdfParams;
  salt: Uint8Array;
  nonce: Uint8Array;
  ciphertext: Uint8Array;
  tag: Uint8Array;
};

type VaultPayload = { v: number; updatedAt: string; credentials: VaultCredential[] };

// Datos asociados autenticados: todo el encabezado no secreto.
function buildAad(kdf: KdfParams, saltB64: string): Uint8Array {
  return utf8Encode(
    [FORMAT_NAME, FORMAT_VERSION, KDF_ALG, kdf.opslimit, kdf.memlimit, saltB64, CIPHER_ALG].join("|"),
  );
}

// Cifra las credenciales y devuelve el texto completo del archivo .pws.
export async function encodeVaultFile(
  credentials: VaultCredential[],
  encKey: Uint8Array,
  kdf: KdfParams,
  salt: Uint8Array,
): Promise<string> {
  const saltB64 = toBase64(salt);
  const payload: VaultPayload = { v: 1, updatedAt: new Date().toISOString(), credentials };
  const plaintext = utf8Encode(JSON.stringify(payload));
  const { nonce, ciphertext, tag } = await aeadEncrypt(plaintext, buildAad(kdf, saltB64), encKey);
  plaintext.fill(0);

  return JSON.stringify({
    format: FORMAT_NAME,
    version: FORMAT_VERSION,
    kdf: { alg: KDF_ALG, opslimit: kdf.opslimit, memlimit: kdf.memlimit, salt: saltB64 },
    cipher: { alg: CIPHER_ALG, nonce: toBase64(nonce) },
    ciphertext: toBase64(ciphertext),
    tag: toBase64(tag),
  });
}

// Lee y valida la estructura del archivo (sin descifrar). Lanza VaultFormatError si es inválido.
export function parseVaultFile(text: string): ParsedVaultFile {
  let raw: any;
  try {
    raw = JSON.parse(text);
  } catch {
    throw new VaultFormatError("El archivo .pws no es un JSON válido.");
  }
  if (!raw || raw.format !== FORMAT_NAME) throw new VaultFormatError("No es un archivo pSword.");
  if (raw.version !== FORMAT_VERSION) {
    throw new VaultFormatError(`Versión de formato no soportada: ${String(raw.version)}.`);
  }
  if (raw.kdf?.alg !== KDF_ALG || raw.cipher?.alg !== CIPHER_ALG) {
    throw new VaultFormatError("Algoritmo no soportado.");
  }

  const { opslimit, memlimit } = raw.kdf;
  if (
    !Number.isInteger(opslimit) || !Number.isInteger(memlimit) ||
    opslimit < KDF_LIMITS.minOps || opslimit > KDF_LIMITS.maxOps ||
    memlimit < KDF_LIMITS.minMem || memlimit > KDF_LIMITS.maxMem
  ) {
    throw new VaultFormatError("Parámetros de derivación fuera de los límites permitidos.");
  }

  try {
    const salt = fromBase64(raw.kdf.salt);
    const nonce = fromBase64(raw.cipher.nonce);
    const ciphertext = fromBase64(raw.ciphertext);
    const tag = fromBase64(raw.tag);
    if (salt.length !== SALT_BYTES || nonce.length !== NONCE_BYTES || tag.length !== TAG_BYTES) {
      throw new Error("longitud");
    }
    return { kdf: { opslimit, memlimit }, salt, nonce, ciphertext, tag };
  } catch {
    throw new VaultFormatError("Campos del archivo .pws dañados.");
  }
}

// Descifra y autentica. Devuelve null si la clave es incorrecta o el archivo fue alterado.
export async function decodeVaultFile(
  parsed: ParsedVaultFile,
  encKey: Uint8Array,
): Promise<VaultCredential[] | null> {
  const aad = buildAad(parsed.kdf, toBase64(parsed.salt));
  const plaintext = await aeadDecrypt(parsed.ciphertext, parsed.tag, parsed.nonce, aad, encKey);
  if (!plaintext) return null;
  try {
    const payload = JSON.parse(utf8Decode(plaintext)) as VaultPayload;
    if (!Array.isArray(payload.credentials)) return null;
    return payload.credentials;
  } catch {
    return null;
  } finally {
    plaintext.fill(0);
  }
}
