/**
 * Generador de contraseñas con aleatoriedad criptográfica (RNF04).
 * Reemplaza a Math.random(), que no es seguro para secretos.
 */
import { secureRandomInt } from "./crypto";

export const CHARACTER_SETS = {
  uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  lowercase: "abcdefghijklmnopqrstuvwxyz",
  numbers: "0123456789",
  symbols: "!@#$%^&*()-_=+[]{}<>?",
  ambiguous: "O0Il1|`",
};

// Elige `length` caracteres uniformemente de `alphabet`.
export function randomString(alphabet: string, length: number): string {
  let out = "";
  for (let i = 0; i < length; i++) out += alphabet[secureRandomInt(alphabet.length)];
  return out;
}
