/**
 * Almacén local en memoria para operaciones de credenciales.
 * Es una implementación independiente del VaultContext; si se utiliza junto
 * con él, hay que sincronizar ambos para evitar listas divergentes.
 */
export type Credential = {
  id: string;
  initials: string;
  name: string;
  username: string;
  password: string;
  category: string;
  strength: string;
  expires?: string;
  modified: string;
};

let credentials: Credential[] = [
  {
    id: "1",
    initials: "DM",
    name: "ProtonMail Dev",
    username: "alex.sec@pm.me",
    password: "P7#kLm!92xQ@",
    category: "2FA ACTIVADO (TOTP)",
    strength: "OPTIMA",
    modified: "HACE 20 D",
  },
  {
    id: "2",
    initials: "AWS",
    name: "AWS Cloud Production",
    username: "aws-infra@corp-root.aws",
    password: "A8#vNq!41Lm$",
    category: "HARDWARE KEY REQUERIDA",
    strength: "OPTIMA",
    modified: "HACE 50 D",
  },
  {
    id: "3",
    initials: "GH",
    name: "GitHub Dev Personal",
    username: "0x-kernel-dev",
    password: "G7!mQ2#xLp9@",
    category: "EXPIRA EN 45 DÍAS",
    strength: "FUERTE",
    modified: "HACE 120 D",
    expires: "45 DÍAS",
  },
];

// Operaciones del almacén en memoria; esta lista es independiente de VaultContext.
export function getCredentials() {
  return credentials;
}

// Incorpora una credencial a la lista local del almacén.
export function addCredential(credential: Credential) {
  credentials = [credential, ...credentials];
}

// Elimina de la lista local la credencial que coincide con el identificador.
export function deleteCredential(id: string) {
  credentials = credentials.filter((credential) => credential.id !== id);
}
