/**
 * Orquesta la bóveda: crear, desbloquear, guardar, bloquear, cambiar contraseña y copias de seguridad.
 * Es independiente de la plataforma: recibe un VaultStorage (archivos + SecureStore en la app,
 * memoria en las pruebas).
 *
 * Orden de escritura en cada guardado (permite recuperarse si la app se cierra a mitad):
 *   (a) cadena con el bloque nuevo  ->  (b) archivo .pws  ->  (c) ancla en SecureStore
 */
import {
  constantTimeEqual,
  DEFAULT_KDF,
  deriveKeys,
  KdfParams,
  randomBytes,
  sha256Hex,
  SALT_BYTES,
  wipe,
} from "./crypto";
import { toHex, utf8Encode } from "./encoding";
import {
  Block,
  ChainHead,
  createBlock,
  GENESIS_PREV_HASH,
  parseChain,
  parseHead,
  resignChain,
  serializeChain,
  verifyChain,
} from "./integrityChain";
import { VaultCredential } from "./types";
import { decodeVaultFile, encodeVaultFile, parseVaultFile, VaultFormatError } from "./vaultFile";

export const MIN_MASTER_PASSWORD_LENGTH = 12;

export interface VaultStorage {
  readVault(): Promise<string | null>;
  writeVault(text: string): Promise<void>;
  readChain(): Promise<string | null>;
  writeChain(text: string): Promise<void>;
  readHead(): Promise<string | null>;
  writeHead(text: string): Promise<void>;
  deleteAll(): Promise<void>;
}

export type VaultErrorCode =
  | "NO_VAULT"
  | "VAULT_EXISTS"
  | "BAD_FORMAT"
  | "WRONG_PASSWORD"
  | "INTEGRITY"
  | "LOCKED"
  | "WEAK_PASSWORD";

export type IntegrityReason =
  | "file-altered" // el archivo .pws no coincide con lo registrado
  | "rollback" // el archivo coincide con una versión anterior de la cadena
  | "chain-missing"
  | "chain-corrupt"
  | "chain-bad-signature"
  | "chain-truncated"
  | "chain-diverged"
  | "chain-ahead";

export class VaultError extends Error {
  constructor(
    public code: VaultErrorCode,
    message: string,
    public reason?: IntegrityReason,
  ) {
    super(message);
    this.name = "VaultError";
  }
}

export type Recovery = "none" | "anchor-restored" | "save-completed" | "save-discarded";

export type IntegrityStatus = {
  blocks: number;
  lastIndex: number;
  lastVaultHash: string;
  lastDate: string;
  recovery: Recovery;
};

type Session = {
  encKey: Uint8Array;
  macKey: Uint8Array;
  salt: Uint8Array;
  kdf: KdfParams;
  chain: Block[];
  credentials: VaultCredential[];
  recovery: Recovery;
};

type OpenEffects = { chain: Block[] | null; head: ChainHead | null };

export class VaultManager {
  private session: Session | null = null;
  private queue: Promise<unknown> = Promise.resolve();

  constructor(
    private storage: VaultStorage,
    private kdfParams: KdfParams = DEFAULT_KDF,
  ) {}

  // Serializa las operaciones de escritura para que dos guardados nunca se crucen.
  private enqueue<T>(fn: () => Promise<T>): Promise<T> {
    const run = this.queue.then(fn, fn);
    this.queue = run.catch(() => undefined);
    return run;
  }

  async exists(): Promise<boolean> {
    return (await this.storage.readVault()) !== null;
  }

  isUnlocked(): boolean {
    return this.session !== null;
  }

  getCredentials(): VaultCredential[] {
    return this.requireSession().credentials;
  }

  getIntegrity(): IntegrityStatus {
    const s = this.requireSession();
    const last = s.chain[s.chain.length - 1];
    return {
      blocks: s.chain.length,
      lastIndex: last.index,
      lastVaultHash: last.vaultHash,
      lastDate: last.date,
      recovery: s.recovery,
    };
  }

  // ---------------------------------------------------------------- crear
  create(password: string): Promise<void> {
    return this.enqueue(async () => {
      if (await this.exists()) throw new VaultError("VAULT_EXISTS", "Ya existe una bóveda.");
      assertStrongEnough(password);

      const salt = randomBytes(SALT_BYTES);
      const keys = await deriveKeys(password, salt, this.kdfParams);
      const text = await encodeVaultFile([], keys.encKey, this.kdfParams, salt);

      const genesis = await createBlock(0, await sha256Hex(utf8Encode(text)), GENESIS_PREV_HASH, keys.macKey);
      await this.persist(text, [genesis]);

      this.session = { ...keys, salt, kdf: this.kdfParams, chain: [genesis], credentials: [], recovery: "none" };
    });
  }

  // ---------------------------------------------------------------- desbloquear
  async unlock(password: string): Promise<IntegrityStatus> {
    const vaultText = await this.storage.readVault();
    if (vaultText === null) throw new VaultError("NO_VAULT", "No existe ninguna bóveda.");
    const chainText = await this.storage.readChain();
    const head = parseHead(await this.storage.readHead());

    const { session, effects } = await this.open(vaultText, chainText, head, password);

    // Aplica la reparación (si hubo) y reancla; si falla algo, no se deja la sesión abierta.
    try {
      await this.applyEffects(effects);
    } catch (e) {
      wipe(session.encKey, session.macKey);
      throw e;
    }
    this.lock();
    this.session = session;
    return this.getIntegrity();
  }

  // ---------------------------------------------------------------- guardar
  save(credentials: VaultCredential[]): Promise<void> {
    return this.enqueue(async () => {
      const s = this.requireSession();
      const text = await encodeVaultFile(credentials, s.encKey, s.kdf, s.salt);
      s.chain = await this.commit(text, s.chain, s.macKey);
      s.credentials = credentials;
    });
  }

  // ---------------------------------------------------------------- bloquear
  lock(): void {
    if (this.session) wipe(this.session.encKey, this.session.macKey);
    this.session = null;
  }

  // ---------------------------------------------------------------- cambiar contraseña maestra (RF10)
  changePassword(current: string, next: string): Promise<void> {
    return this.enqueue(async () => {
      const s = this.requireSession();
      assertStrongEnough(next);

      const check = await deriveKeys(current, s.salt, s.kdf);
      const same = constantTimeEqual(toHex(check.encKey), toHex(s.encKey));
      wipe(check.encKey, check.macKey);
      if (!same) throw new VaultError("WRONG_PASSWORD", "La contraseña actual es incorrecta.");

      const salt = randomBytes(SALT_BYTES);
      const keys = await deriveKeys(next, salt, this.kdfParams);
      // La cadena se vuelve a firmar con la clave nueva (los hashes y enlaces no cambian).
      const resigned = await resignChain(s.chain, keys.macKey);
      const text = await encodeVaultFile(s.credentials, keys.encKey, this.kdfParams, salt);
      const chain = await this.commit(text, resigned, keys.macKey);

      wipe(s.encKey, s.macKey);
      this.session = { ...keys, salt, kdf: this.kdfParams, chain, credentials: s.credentials, recovery: "none" };
    });
  }

  // ---------------------------------------------------------------- copias de seguridad (RF09)
  // La copia son dos textos: el .pws y su cadena. Ambos son seguros de almacenar (el .pws va cifrado).
  async exportBackup(): Promise<{ vault: string; chain: string }> {
    const vault = await this.storage.readVault();
    const chain = await this.storage.readChain();
    if (vault === null || chain === null) throw new VaultError("NO_VAULT", "No hay bóveda para exportar.");
    return { vault, chain };
  }

  // Importa una copia. Se verifica completa (contraseña, cifrado, cadena y firmas) antes de escribir nada.
  importBackup(vaultText: string, chainText: string, password: string, replace = false): Promise<IntegrityStatus> {
    return this.enqueue(async () => {
      if (!replace && (await this.exists())) throw new VaultError("VAULT_EXISTS", "Ya existe una bóveda.");
      // Sin ancla previa en este dispositivo: se confía en la cadena firmada de la copia.
      const { session, effects } = await this.open(vaultText, chainText, null, password);
      await this.storage.writeChain(serializeChain(effects.chain ?? session.chain));
      await this.storage.writeVault(vaultText);
      await this.storage.writeHead(JSON.stringify(effects.head));
      this.lock();
      this.session = session;
      return this.getIntegrity();
    });
  }

  // Elimina la bóveda del dispositivo (archivo, cadena y ancla).
  async destroy(): Promise<void> {
    this.lock();
    await this.storage.deleteAll();
  }

  // ================================================================ internos
  private requireSession(): Session {
    if (!this.session) throw new VaultError("LOCKED", "La bóveda está bloqueada.");
    return this.session;
  }

  private async persist(vaultText: string, chain: Block[]): Promise<void> {
    const last = chain[chain.length - 1];
    await this.storage.writeChain(serializeChain(chain)); // (a)
    await this.storage.writeVault(vaultText); // (b)
    await this.storage.writeHead(JSON.stringify({ index: last.index, hash: last.hash })); // (c)
  }

  // Agrega el bloque de la nueva versión y escribe todo en el orden seguro.
  private async commit(vaultText: string, base: Block[], macKey: Uint8Array): Promise<Block[]> {
    const prev = base[base.length - 1];
    const block = await createBlock(prev.index + 1, await sha256Hex(utf8Encode(vaultText)), prev.hash, macKey);
    const chain = [...base, block];
    await this.persist(vaultText, chain);
    return chain;
  }

  private async applyEffects(effects: OpenEffects): Promise<void> {
    if (effects.chain) await this.storage.writeChain(serializeChain(effects.chain));
    if (effects.head) await this.storage.writeHead(JSON.stringify(effects.head));
  }

  /**
   * Núcleo de la verificación. Descifra y comprueba la cadena contra el archivo y el ancla.
   * No escribe nada: devuelve la sesión y los cambios que el llamador debe persistir.
   */
  private async open(
    vaultText: string,
    chainText: string | null,
    head: ChainHead | null,
    password: string,
  ): Promise<{ session: Session; effects: OpenEffects }> {
    let parsed;
    try {
      parsed = parseVaultFile(vaultText);
    } catch (e) {
      if (e instanceof VaultFormatError) throw new VaultError("BAD_FORMAT", e.message);
      throw e;
    }

    const fileHash = await sha256Hex(utf8Encode(vaultText));
    const keys = await deriveKeys(password, parsed.salt, parsed.kdf);
    const fail = (err: VaultError): never => {
      wipe(keys.encKey, keys.macKey);
      throw err;
    };
    const integrity = (reason: IntegrityReason, msg: string) => fail(new VaultError("INTEGRITY", msg, reason));

    const chain = parseChain(chainText);
    const credentials = await decodeVaultFile(parsed, keys.encKey);

    if (!credentials) {
      // ¿Contraseña equivocada o archivo alterado? El ancla y la cadena (sin clave) lo distinguen.
      if (chain && head && (await verifyChain(chain)).ok && chain[head.index]?.hash === head.hash) {
        const known = [chain[head.index]?.vaultHash, chain[head.index + 1]?.vaultHash];
        if (!known.includes(fileHash)) {
          return integrity("file-altered", "El archivo de la bóveda fue modificado.");
        }
      }
      return fail(new VaultError("WRONG_PASSWORD", "Contraseña incorrecta (o archivo dañado)."));
    }

    // Contenido auténtico para esta contraseña. Falta comprobar que sea LA versión vigente.
    if (!chain) return integrity("chain-missing", "Falta o está dañado el registro de integridad.");
    const check = await verifyChain(chain, keys.macKey);
    if (!check.ok) {
      return check.reason === "bad-signature"
        ? integrity("chain-bad-signature", `La firma del bloque ${check.index} no es válida.`)
        : integrity("chain-corrupt", `El registro de integridad está dañado (bloque ${check.index}).`);
    }

    const last = chain[chain.length - 1];
    const effects: OpenEffects = { chain: null, head: null };
    let recovery: Recovery = "none";
    let finalChain = chain;

    if (!head) {
      // Sin ancla (copia importada o SecureStore vacío): confianza en el primer uso.
      if (fileHash !== last.vaultHash) return integrity("file-altered", "El archivo no coincide con su registro.");
      effects.head = { index: last.index, hash: last.hash };
      recovery = "anchor-restored";
    } else {
      if (last.index < head.index) return integrity("chain-truncated", "El registro de integridad fue recortado.");
      if (chain[head.index].hash !== head.hash) return integrity("chain-diverged", "El registro de integridad no coincide con el ancla.");

      if (last.index === head.index) {
        if (fileHash !== last.vaultHash) {
          const older = chain.some((b) => b.vaultHash === fileHash);
          return older
            ? integrity("rollback", "Se detectó una versión anterior de la bóveda.")
            : integrity("file-altered", "El archivo de la bóveda fue modificado.");
        }
      } else if (last.index === head.index + 1) {
        // Un guardado quedó a medias (cierre de la app). Solo se acepta si es inequívoco.
        if (fileHash === last.vaultHash) {
          effects.head = { index: last.index, hash: last.hash }; // el archivo ya era el nuevo
          recovery = "save-completed";
        } else if (fileHash === chain[head.index].vaultHash) {
          finalChain = chain.slice(0, head.index + 1); // el archivo nuevo nunca se escribió
          effects.chain = finalChain;
          recovery = "save-discarded";
        } else {
          return integrity("file-altered", "El archivo de la bóveda fue modificado.");
        }
      } else {
        return integrity("chain-ahead", "El registro de integridad es inconsistente con el ancla.");
      }
    }

    return {
      session: { ...keys, salt: parsed.salt, kdf: parsed.kdf, chain: finalChain, credentials, recovery },
      effects,
    };
  }
}

function assertStrongEnough(password: string): void {
  if (password.length < MIN_MASTER_PASSWORD_LENGTH) {
    throw new VaultError("WEAK_PASSWORD", `La contraseña maestra debe tener al menos ${MIN_MASTER_PASSWORD_LENGTH} caracteres.`);
  }
}
