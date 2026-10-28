/** Modelo de una credencial tal como se guarda (cifrada) dentro de la bóveda. */
export type VaultCredential = {
  id: string;
  initials: string;
  name: string;
  username: string;
  password: string;
  category: string;
  strength: string;
  modified: string;
  expires?: string;
};
