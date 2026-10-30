/**
 * Colores por tipo de carácter.
 * Se comparten entre la leyenda, el token generado y el panel de parámetros.
 */
export const CHAR_COLORS = {
  uppercase: "#00ff66",
  lowercase: "#ffffff",
  numbers: "#ffd34d",
  symbols: "#888888",
} as const;

// Devuelve el color que corresponde a un carácter según su tipo.
export function charColor(char: string): string {
  if (/[A-Z]/.test(char)) return CHAR_COLORS.uppercase;
  if (/[a-z]/.test(char)) return CHAR_COLORS.lowercase;
  if (/[0-9]/.test(char)) return CHAR_COLORS.numbers;
  return CHAR_COLORS.symbols;
}