/**
 * Contexto de la bóveda cifrada.
 * Conecta las pantallas con VaultManager (core/vaultManager.ts): crear, desbloquear, bloquear y
 * persistir cada cambio en el archivo .pws cifrado, registrando una versión en la cadena de integridad.
 * Las credenciales solo existen en memoria mientras la bóveda está desbloqueada.
 */
import { createContext, ReactNode, useCallback, useContext, useMemo, useRef, useState } from "react";

import { deviceStorage } from "@/core/storage";
import { VaultCredential } from "@/core/types";
import { IntegrityStatus, VaultManager } from "@/core/vaultManager";

export type { VaultCredential };

// Datos que aporta el formulario; el contexto genera ID, iniciales y fecha de modificación.
type NewCredential = Omit<VaultCredential, "id" | "modified" | "initials">;

type VaultContextType = {
  isUnlocked: boolean;
  credentials: VaultCredential[];
  integrity: IntegrityStatus | null;
  vaultExists: () => Promise<boolean>;
  createVault: (masterPassword: string) => Promise<void>;
  unlockVault: (masterPassword: string) => Promise<void>;
  lockVault: () => void;
  addCredential: (credential: NewCredential) => Promise<void>;
  removeCredential: (id: string) => Promise<void>;
};

const VaultContext = createContext<VaultContextType | undefined>(undefined);

// Obtiene las iniciales que se muestran como icono abreviado de un servicio.
function getInitials(name: string) {
  const words = name.trim().split(/\s+/);
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return `${words[0][0]}${words[1][0]}`.toUpperCase();
}

export function VaultProvider({ children }: { children: ReactNode }) {
  const manager = useRef(new VaultManager(deviceStorage)).current;
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [credentials, setCredentials] = useState<VaultCredential[]>([]);
  const [integrity, setIntegrity] = useState<IntegrityStatus | null>(null);

  // Refleja en la interfaz el estado actual de la sesión de la bóveda.
  const refresh = useCallback(() => {
    setCredentials([...manager.getCredentials()]);
    setIntegrity(manager.getIntegrity());
    setIsUnlocked(true);
  }, [manager]);

  const createVault = useCallback(async (masterPassword: string) => {
    await manager.create(masterPassword);
    refresh();
  }, [manager, refresh]);

  const unlockVault = useCallback(async (masterPassword: string) => {
    await manager.unlock(masterPassword);
    refresh();
  }, [manager, refresh]);

  const lockVault = useCallback(() => {
    manager.lock();
    setCredentials([]);
    setIntegrity(null);
    setIsUnlocked(false);
  }, [manager]);

  // Cada cambio se guarda cifrado y agrega un bloque a la cadena antes de mostrarse.
  const addCredential = useCallback(async (credential: NewCredential) => {
    const created: VaultCredential = {
      ...credential,
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, // identificador local, no es un secreto
      initials: getInitials(credential.name),
      modified: "AHORA",
    };
    await manager.save([created, ...manager.getCredentials()]);
    refresh();
  }, [manager, refresh]);

  const removeCredential = useCallback(async (id: string) => {
    await manager.save(manager.getCredentials().filter((c) => c.id !== id));
    refresh();
  }, [manager, refresh]);

  const value = useMemo(
    () => ({
      isUnlocked, credentials, integrity,
      vaultExists: () => manager.exists(),
      createVault, unlockVault, lockVault, addCredential, removeCredential,
    }),
    [isUnlocked, credentials, integrity, manager, createVault, unlockVault, lockVault, addCredential, removeCredential],
  );

  return <VaultContext.Provider value={value}>{children}</VaultContext.Provider>;
}

export function useVault() {
  const context = useContext(VaultContext);
  if (!context) throw new Error("useVault debe utilizarse dentro de VaultProvider.");
  return context;
}
