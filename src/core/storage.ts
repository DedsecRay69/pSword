/**
 * Almacenamiento real del dispositivo.
 *  - Archivo .pws y cadena: carpeta de documentos de la app (Expo FileSystem).
 *  - Ancla (último bloque): SecureStore (Keystore en Android / Keychain en iOS).
 */
import { File, Paths } from "expo-file-system";
import * as SecureStore from "expo-secure-store";

import { VaultStorage } from "./vaultManager";

const HEAD_KEY = "psword_chain_head";

const vaultFile = () => new File(Paths.document, "vault.pws");
const chainFile = () => new File(Paths.document, "vault.pws.chain");

async function readText(file: File): Promise<string | null> {
  return file.exists ? await file.text() : null;
}

function writeText(file: File, text: string): void {
  if (!file.exists) file.create();
  file.write(text);
}

export const deviceStorage: VaultStorage = {
  readVault: () => readText(vaultFile()),
  writeVault: async (text) => writeText(vaultFile(), text),
  readChain: () => readText(chainFile()),
  writeChain: async (text) => writeText(chainFile(), text),
  readHead: () => SecureStore.getItemAsync(HEAD_KEY),
  // El ancla no se migra a otro dispositivo ni entra en copias de seguridad del sistema.
  writeHead: (text) =>
    SecureStore.setItemAsync(HEAD_KEY, text, {
      keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
    }),
  deleteAll: async () => {
    for (const f of [vaultFile(), chainFile()]) if (f.exists) f.delete();
    await SecureStore.deleteItemAsync(HEAD_KEY);
  },
};
