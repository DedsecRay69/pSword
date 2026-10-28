/**
 * Capa única de primitivas criptográficas de pSword.
 * Ninguna otra parte del código llama directamente a las librerías: así los algoritmos
 * y parámetros quedan en un solo lugar y no se implementa criptografía propia.
 *
 * Todo es JavaScript puro (librerías @noble, auditadas), por lo que funciona en Expo Go
 * sin compilar código nativo.
 *  - Derivación de clave: Argon2id v1.3 (RFC 9106), @noble/hashes.
 *  - Cifrado autenticado: XChaCha20-Poly1305, nonce de 24 bytes, @noble/ciphers.
 *  - HMAC-SHA-256 y hash SHA-256: @noble/hashes.
 *  - Aleatoriedad: generador criptográfico del sistema (expo-crypto).
 */
import { xchacha20poly1305 } from "@noble/ciphers/chacha.js";
import { argon2idAsync } from "@noble/hashes/argon2.js";
import { hmac } from "@noble/hashes/hmac.js";
import { sha256 } from "@noble/hashes/sha2.js";
import * as Crypto from "expo-crypto";

import { toHex } from "./encoding";

export const KEY_BYTES = 32;
export const NONCE_BYTES = 24; // XChaCha20-Poly1305
export const TAG_BYTES = 16; // Poly1305
export const SALT_BYTES = 16;

export type KdfParams = { opslimit: number; memlimit: number };

/**
 * Parámetros por defecto: Argon2id con 19 MiB y 2 iteraciones, paralelismo 1 (mínimo recomendado por
 * OWASP). Se eligen modestos porque Argon2 en JavaScript es más lento que en código nativo.
 * Quedan registrados en el encabezado del .pws: pueden subirse sin romper bóvedas existentes.
 */
export const DEFAULT_KDF: KdfParams = { opslimit: 2, memlimit: 19 * 1024 * 1024 };

// Límites aceptados al LEER un archivo, para rechazar encabezados manipulados (p. ej. memoria absurda).
export const KDF_LIMITS = {
  minOps: 1,
  maxOps: 20,
  minMem: 8 * 1024 * 1024,
  maxMem: 512 * 1024 * 1024,
};

// Bytes aleatorios criptográficamente seguros.
export function randomBytes(length: number): Uint8Array {
  return Crypto.getRandomBytes(length);
}

// Entero uniforme en [0, max) sin sesgo de módulo (muestreo por rechazo).
export function secureRandomInt(max: number): number {
  if (!Number.isInteger(max) || max <= 0 || max > 0x100000000) {
    throw new Error("max fuera de rango");
  }
  const limit = Math.floor(0x100000000 / max) * max;
  for (;;) {
    const b = randomBytes(4);
    const v = ((b[0] << 24) | (b[1] << 16) | (b[2] << 8) | b[3]) >>> 0;
    if (v < limit) return v % max;
  }
}

// Hash SHA-256 de unos bytes, en hexadecimal.
export async function sha256Hex(data: Uint8Array): Promise<string> {
  return toHex(sha256(data));
}

export type DerivedKeys = {
  encKey: Uint8Array; // clave de cifrado de la bóveda
  macKey: Uint8Array; // clave del HMAC de la cadena de integridad
};

/**
 * Argon2id(contraseña, sal) -> 64 bytes, divididos en dos claves independientes:
 * los primeros 32 para cifrar y los últimos 32 para firmar la cadena.
 * Es asíncrono con "ticks" para no congelar la interfaz mientras calcula.
 */
export async function deriveKeys(
  password: string,
  salt: Uint8Array,
  params: KdfParams,
): Promise<DerivedKeys> {
  const okm = await argon2idAsync(password, salt, {
    t: params.opslimit,
    m: Math.floor(params.memlimit / 1024), // KiB
    p: 1,
    dkLen: KEY_BYTES * 2,
    asyncTick: 10,
  });
  const keys = { encKey: okm.slice(0, KEY_BYTES), macKey: okm.slice(KEY_BYTES) };
  okm.fill(0);
  return keys;
}

// Cifra con XChaCha20-Poly1305. Devuelve el texto cifrado y la etiqueta por separado.
export async function aeadEncrypt(
  plaintext: Uint8Array,
  aad: Uint8Array,
  key: Uint8Array,
): Promise<{ nonce: Uint8Array; ciphertext: Uint8Array; tag: Uint8Array }> {
  const nonce = randomBytes(NONCE_BYTES); // nonce único en cada guardado
  const combined = xchacha20poly1305(key, nonce, aad).encrypt(plaintext);
  const split = combined.length - TAG_BYTES;
  return { nonce, ciphertext: combined.slice(0, split), tag: combined.slice(split) };
}

// Descifra y autentica. Devuelve null si la clave es incorrecta o algún byte fue alterado.
export async function aeadDecrypt(
  ciphertext: Uint8Array,
  tag: Uint8Array,
  nonce: Uint8Array,
  aad: Uint8Array,
  key: Uint8Array,
): Promise<Uint8Array | null> {
  const combined = new Uint8Array(ciphertext.length + tag.length);
  combined.set(ciphertext, 0);
  combined.set(tag, ciphertext.length);
  try {
    return xchacha20poly1305(key, nonce, aad).decrypt(combined);
  } catch {
    return null;
  }
}

// HMAC-SHA-256 de un mensaje, en hexadecimal.
export async function hmacHex(message: Uint8Array, key: Uint8Array): Promise<string> {
  return toHex(hmac(sha256, key, message));
}

// Comparación en tiempo constante de dos cadenas hex (evita filtrar información por tiempo).
export function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

// Borra un buffer sensible de memoria.
export function wipe(...buffers: Uint8Array[]): void {
  for (const b of buffers) b.fill(0);
}
