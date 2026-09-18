// Este script gestiona la creación, almacenamiento y verificación de la contraseña maestra 
// mediante SecureStore y hash SHA-256.
import * as Crypto from "expo-crypto";
import * as SecureStore from "expo-secure-store";

// Clave utilizada para guardar la contraseña maestra en SecureStore
const MASTER_PASSWORD_KEY = "psword_master_password";

// Genera un hash SHA-256 a partir de la contraseña recibida
async function hashPassword(password: string): Promise<string> {
  return await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    password
  );
}

// Comprueba si ya existe una contraseña maestra almacenada
export async function hasMasterPassword(): Promise<boolean> {
  const storedPassword = await SecureStore.getItemAsync(
    MASTER_PASSWORD_KEY
  );

  return storedPassword !== null;
}

// Genera el hash de la contraseña y lo almacena en SecureStore
export async function saveMasterPassword(
  password: string
): Promise<void> {
  const hashedPassword = await hashPassword(password);

  await SecureStore.setItemAsync(
    MASTER_PASSWORD_KEY,
    hashedPassword
  );
}

// Comprueba si la contraseña ingresada coincide con la almacenada
export async function verifyMasterPassword(
  password: string
): Promise<boolean> {
  const storedPassword = await SecureStore.getItemAsync(
    MASTER_PASSWORD_KEY
  );

  // No existe una contraseña almacenada
  if (storedPassword === null) {
    return false;
  }

  // Genera el hash de la contraseña ingresada
  const hashedPassword = await hashPassword(password);

  // Compara el hash ingresado con el hash almacenado
  return hashedPassword === storedPassword;
}

