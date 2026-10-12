/**
 * Contexto compartido de credenciales de la bóveda.
 * Expone la lista actual y las operaciones para agregar o eliminar registros,
 * de modo que las pantallas consuman el mismo estado en memoria.
 * Los datos de ejemplo y los registros añadidos se pierden al reiniciar la app.
 */
import { createContext, ReactNode, useContext, useState } from "react";

// Modelo completo que utiliza cada tarjeta de credencial dentro de la bóveda.
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

// Datos que aporta el formulario; el contexto genera ID, iniciales y fecha de modificación.
type NewCredential = Omit<VaultCredential, "id" | "modified" | "initials">;

type VaultContextType = {
  credentials: VaultCredential[];
  addCredential: (credential: NewCredential) => void;
  removeCredential: (id: string) => void;
};

// Contexto React para compartir la misma lista entre pantallas.
const VaultContext = createContext<VaultContextType | undefined>(undefined);

// Registros ficticios para demostrar el aspecto inicial de la bóveda.
const INITIAL_CREDENTIALS: VaultCredential[] = [
  {
    id: "1",
    initials: "PD",
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
  {
    id: "4",
    initials: "GS",
    name: "Google Legacy Suite",
    username: "ray.workspace@gmail.com",
    password: "G!8xL2@pQ7#m",
    category: "ANTIGÜEDAD ALTA",
    strength: "MEDIA",
    modified: "HACE 210 D",
  },
  {
    id: "5",
    initials: "BC",
    name: "Binance Crypto Exchange",
    username: "trader.n0x9@secure-relay.net",
    password: "B#91Lm!xQ7@p",
    category: "YUBIKEY FIDO2",
    strength: "OPTIMA",
    modified: "HACE 150 D",
  },
];

// Obtiene las iniciales que se muestran como icono abreviado de un servicio.
function getInitials(name: string) {
  const words = name.trim().split(/\s+/);

  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase();
  }

  return `${words[0][0]}${words[1][0]}`.toUpperCase();
}

// Proveedor que mantiene el estado de credenciales disponible para sus pantallas hijas.
export function VaultProvider({ children }: { children: ReactNode }) {
  const [credentials, setCredentials] =
    useState<VaultCredential[]>(INITIAL_CREDENTIALS);

  // Completa los metadatos del registro y lo coloca al principio de la lista.
  const addCredential = (credential: NewCredential) => {
    const newCredential: VaultCredential = {
      ...credential,
      id: Date.now().toString(),
      initials: getInitials(credential.name),
      modified: "AHORA",
    };

    setCredentials((current) => [newCredential, ...current]);
  };

  // Elimina de la lista el registro cuyo identificador coincide.
  const removeCredential = (id: string) => {
    setCredentials((current) =>
      current.filter((credential) => credential.id !== id),
    );
  };

  return (
    <VaultContext.Provider
      value={{
        credentials,
        addCredential,
        removeCredential,
      }}
    >
      {children}
    </VaultContext.Provider>
  );
}

// Hook de acceso al contexto; avisa si se usa fuera del proveedor.
export function useVault() {
  const context = useContext(VaultContext);

  if (!context) {
    throw new Error("useVault debe utilizarse dentro de VaultProvider.");
  }

  return context;
}
