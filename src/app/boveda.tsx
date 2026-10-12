/**
 * Pantalla principal de la bóveda.
 * Muestra las credenciales compartidas, permite buscarlas y filtrarlas, ocultar
 * o revelar contraseñas, copiarlas y navegar al formulario de nueva credencial.
 */
import * as Clipboard from "expo-clipboard";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import { useVault } from "@/context/VaultContext";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

const GREEN = "#00ff66";
const BACKGROUND = "#202020";
const PANEL = "#151515";
const INPUT = "#101010";
const TEXT = "#eeeeee";
const MUTED = "#777777";
const BORDER = "#292929";

export default function VaultScreen() {
  const { credentials } = useVault();
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("TODOS");
  const [visiblePasswords, setVisiblePasswords] = useState<string[]>([]);

// Filtra la lista por nombre, usuario o categoría y aplica el filtro seleccionado.
  const filteredCredentials = useMemo(() => {
    const text = search.toLowerCase().trim();

    return credentials.filter((item) => {
      const matchesText = !text || item.name.toLowerCase().includes(text) ||
        item.username.toLowerCase().includes(text) || item.category.toLowerCase().includes(text);
      const matchesFilter = activeFilter === "TODOS" ||
        (activeFilter === "LOGINS" && /login|web|2fa|totp|hardware|yubikey|generada/i.test(item.category)) ||
        (activeFilter === "TARJETAS" && /tarjeta|card/i.test(item.category)) ||
        (activeFilter === "NOTAS" && /nota|note/i.test(item.category));
      return matchesText && matchesFilter;
    });
  }, [search, activeFilter, credentials]);

// Alterna la visibilidad de una contraseña sin modificar los demás registros.
  const togglePassword = (id: string) => {
    setVisiblePasswords((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  };

// Envía la contraseña elegida al portapapeles y confirma la operación al usuario.
  const copyPassword = async (password: string) => {
    await Clipboard.setStringAsync(password);

    Alert.alert(
      "Contraseña copiada",
      "La contraseña fue copiada al portapapeles.",
    );
  };

// Regresa a la pantalla de acceso para simular el bloqueo de la bóveda.
  const lockVault = () => {
    router.replace("/");
  };

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* HEADER */}

        <View style={styles.header}>
          <View style={styles.brandContainer}>
            <Text style={styles.brandPrefix}>&gt;pSword</Text>
            <Text style={styles.brandSection}>/ BÓVEDA</Text>
          </View>

          <View style={styles.headerActions}>
            <View style={styles.securityBadge}>
              <Text style={styles.securityBadgeText}>🔒 AES-256</Text>
            </View>

            <Pressable
              style={styles.userButton}
              onPress={() => Alert.alert("pSword", "Perfil y configuración")}
            >
              <Text style={styles.userIcon}>♙</Text>
            </Pressable>
          </View>
        </View>

        {/* AUDITORÍA */}

        <View style={styles.auditCard}>
          <View style={styles.auditHeader}>
            <Text style={styles.auditTitle}>
              ◉ AUDITORÍA DE SALUD CRIPTOGRÁFICA
            </Text>

            <Text style={styles.auditStatus}>96% ÓPTIMO</Text>
          </View>

          <View style={styles.auditStats}>
            <AuditStat title="FUERTES" value="12" />
            <AuditStat title="DÉBILES" value="02" />
            <AuditStat title="EXPUESTAS" value="00" />
          </View>
        </View>

        {/* RUTA / UBICACIÓN */}

        <View style={styles.locationRow}>
          <Text style={styles.locationText}>● LOCAL_STORE:/ /REUNTEd</Text>

          <Text style={styles.itemCount}>{credentials.length} ITEMS</Text>

          <Pressable style={styles.lockButton} onPress={lockVault}>
            <Text style={styles.lockButtonText}>🔒 BLOQUEAR</Text>
          </Pressable>
        </View>

        {/* BUSCADOR */}

        <View style={styles.searchContainer}>
          <Text style={styles.searchIcon}>&gt;</Text>

          <TextInput
            style={styles.searchInput}
            placeholder="buscar credencial o servicio..."
            placeholderTextColor="#777"
            value={search}
            onChangeText={setSearch}
          />

          <Text style={styles.searchShortcut}>⌘</Text>
        </View>

        {/* NUEVA CREDENCIAL */}

        <View style={styles.filtersRow}>
          {["TODOS", "LOGINS", "TARJETAS", "NOTAS"].map((filter) => (
            <Pressable key={filter} onPress={() => setActiveFilter(filter)}
              style={[styles.filterChip, activeFilter === filter && styles.filterChipActive]}>
              <Text style={[styles.filterText, activeFilter === filter && styles.filterTextActive]}>
                {filter === "TODOS" ? `▣ TODOS (${credentials.length})` : filter === "LOGINS" ? "LOGINS" : filter}
              </Text>
            </Pressable>
          ))}
        </View>

        <Pressable style={styles.newCredentialButton} onPress={() => router.push("/nueva-credencial")}>
          <Text style={styles.newCredentialText}>⊞ [ + NUEVA CREDENCIAL ]</Text>
        </Pressable>

        {/* CREDENCIALES */}

        <View style={styles.credentialsContainer}>
          {filteredCredentials.map((credential) => {
            const passwordVisible = visiblePasswords.includes(credential.id);

            return (
              <CredentialCard
                key={credential.id}
                credential={credential}
                passwordVisible={passwordVisible}
                onTogglePassword={() => togglePassword(credential.id)}
                onCopy={() => copyPassword(credential.password)}
              />
            );
          })}

          {filteredCredentials.length === 0 && (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                NO SE ENCONTRARON CREDENCIALES
              </Text>
            </View>
          )}
        </View>

        {/* PIE DE SEGURIDAD */}

        <View style={styles.securityFooter}>
          <Text style={styles.securityFooterText}>
            &gt; EDIF / RAM BUFFER PERSISTED
          </Text>

          <Text style={styles.securityFooterText}>
            ● SHA-256 INTEGRITY FALLS
          </Text>
        </View>

        {/* NAVEGACIÓN */}

        <View style={styles.footer}>
          <View style={styles.footerActive}>
            <Text style={styles.footerItemActive}>
              ♧{"\n"}
              BÓVEDA
            </Text>
          </View>

          <Pressable onPress={() => router.replace("/generador")}>
            <Text style={styles.footerItem}>
              ▦{"\n"}
              GENERADOR
            </Text>
          </Pressable>

        </View>
      </ScrollView>
    </View>
  );
}

/* =========================================================
   AUDITORÍA
========================================================= */

// Componente pequeño que presenta una métrica de la auditoría de seguridad.
function AuditStat({ title, value }: { title: string; value: string }) {
  return (
    <View style={styles.auditStat}>
      <Text style={styles.auditStatTitle}>{title}</Text>
      <Text style={styles.auditStatValue}>{value}</Text>
    </View>
  );
}

/* =========================================================
   CREDENCIAL
========================================================= */

// Tarjeta reutilizable que presenta una credencial y sus acciones disponibles.
function CredentialCard({
  credential,
  passwordVisible,
  onTogglePassword,
  onCopy,
}: {
  credential: Credential;
  passwordVisible: boolean;
  onTogglePassword: () => void;
  onCopy: () => void;
}) {
  return (
    <View style={styles.credentialCard}>
      {/* Encabezado */}

      <View style={styles.credentialHeader}>
        <View style={styles.credentialIdentity}>
          <View style={styles.initials}>
            <Text style={styles.initialsText}>{credential.initials}</Text>
          </View>

          <View style={styles.credentialNameContainer}>
            <Text style={styles.credentialName}>{credential.name}</Text>

            <Text style={styles.credentialUsername}>{credential.username}</Text>
          </View>
        </View>

        <Text style={styles.strength}>100% {credential.strength}</Text>
      </View>

      {/* Contraseña */}

      <View style={styles.passwordRow}>
        <Text style={styles.passwordDots}>
          {passwordVisible ? credential.password : "••••••••••••••••"}
        </Text>

        <Pressable onPress={onTogglePassword}>
          <Text style={styles.eye}>{passwordVisible ? "◉" : "◌"}</Text>
        </Pressable>

        <Pressable onPress={onCopy}>
          <Text style={styles.copyIcon}>▣</Text>
        </Pressable>
      </View>

      {/* Información */}

      <View style={styles.credentialFooter}>
        <Text style={styles.credentialCategory}>{credential.category}</Text>

        <Text style={styles.modified}>MODIF. {credential.modified}</Text>
      </View>
    </View>
  );
}

/* =========================================================
   ESTILOS
========================================================= */

// Estilos visuales de tarjetas, filtros, cabecera y navegación inferior.
const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: BACKGROUND,
  },

  scrollContent: {
    width: "100%",
    maxWidth: 760,
    alignSelf: "center",
    paddingHorizontal: 14,
    paddingTop: 5,
    paddingBottom: 25,
  },

  /* HEADER */

  header: {
    minHeight: 58,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#444",
  },

  brandContainer: {
    flexDirection: "row",
    alignItems: "center",
  },

  brandPrefix: {
    color: GREEN,
    fontSize: 17,
    fontWeight: "bold",
  },

  brandSection: {
    color: "#aaa",
    fontSize: 10,
    fontWeight: "bold",
    marginLeft: 5,
  },

  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },

  securityBadge: {
    backgroundColor: "#101010",
    borderWidth: 1,
    borderColor: "#183c28",
    borderRadius: 4,
    paddingHorizontal: 7,
    paddingVertical: 5,
  },

  securityBadgeText: {
    color: GREEN,
    fontSize: 8,
    fontWeight: "bold",
  },

  userButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: GREEN,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#eeeeee",
  },

  userIcon: {
    color: "#222",
    fontSize: 16,
  },

  /* AUDITORÍA */

  auditCard: {
    backgroundColor: PANEL,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 5,
    marginTop: 10,
    padding: 9,
  },

  auditHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },

  auditTitle: {
    color: GREEN,
    fontSize: 9,
    fontWeight: "bold",
  },

  auditStatus: {
    color: GREEN,
    fontSize: 9,
    fontWeight: "bold",
  },

  auditStats: {
    flexDirection: "row",
    gap: 5,
  },

  auditStat: {
    flex: 1,
    backgroundColor: "#101010",
    padding: 7,
  },

  auditStatTitle: {
    color: "#777",
    fontSize: 7,
    fontWeight: "bold",
  },

  auditStatValue: {
    color: GREEN,
    fontSize: 15,
    fontWeight: "bold",
    marginTop: 2,
  },

  /* UBICACIÓN */

  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 9,
    marginBottom: 8,
    gap: 7,
  },

  locationText: {
    color: GREEN,
    fontSize: 8,
    fontWeight: "bold",
    flex: 1,
  },

  itemCount: {
    color: "#aaa",
    fontSize: 8,
    fontWeight: "bold",
  },

  lockButton: {
    backgroundColor: "#321b1b",
    borderWidth: 1,
    borderColor: "#572626",
    borderRadius: 3,
    paddingHorizontal: 7,
    paddingVertical: 4,
  },

  lockButtonText: {
    color: "#ff7777",
    fontSize: 7,
    fontWeight: "bold",
  },

  /* BUSCADOR */

  searchContainer: {
    height: 42,
    backgroundColor: INPUT,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 5,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
  },

  searchIcon: {
    color: GREEN,
    fontSize: 14,
    fontWeight: "bold",
  },

  searchInput: {
    flex: 1,
    color: TEXT,
    fontSize: 11,
    marginLeft: 7,
  },

  searchShortcut: {
    color: "#777",
    fontSize: 12,
  },

  /* NUEVA CREDENCIAL */

  filtersRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 10,
  },
  filterChip: {
    backgroundColor: "#101010",
    borderWidth: 1,
    borderColor: "#303030",
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  filterChipActive: { backgroundColor: GREEN, borderColor: GREEN },
  filterText: { color: "#999", fontSize: 8, fontWeight: "bold" },
  filterTextActive: { color: "#001b0a" },

  newCredentialButton: {
    height: 43,
    backgroundColor: GREEN,
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 9,
    marginBottom: 10,
  },

  newCredentialText: {
    color: "#000",
    fontSize: 11,
    fontWeight: "bold",
  },

  /* CREDENCIALES */

  credentialsContainer: {
    gap: 8,
  },

  credentialCard: {
    backgroundColor: PANEL,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 5,
    padding: 9,
  },

  credentialHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  credentialIdentity: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  initials: {
    width: 28,
    height: 28,
    borderRadius: 4,
    backgroundColor: "#202020",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },

  initialsText: {
    color: GREEN,
    fontSize: 9,
    fontWeight: "bold",
  },

  credentialNameContainer: {
    flex: 1,
  },

  credentialName: {
    color: "#ddd",
    fontSize: 11,
    fontWeight: "bold",
  },

  credentialUsername: {
    color: "#777",
    fontSize: 8,
    marginTop: 2,
  },

  strength: {
    color: GREEN,
    fontSize: 7,
    fontWeight: "bold",
  },

  passwordRow: {
    minHeight: 35,
    backgroundColor: INPUT,
    borderRadius: 4,
    marginTop: 7,
    paddingHorizontal: 8,
    flexDirection: "row",
    alignItems: "center",
  },

  passwordDots: {
    color: "#ddd",
    fontSize: 10,
    flex: 1,
    fontFamily: "monospace",
  },

  eye: {
    color: "#888",
    fontSize: 13,
    paddingHorizontal: 7,
  },

  copyIcon: {
    color: GREEN,
    fontSize: 13,
    paddingHorizontal: 4,
  },

  credentialFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 6,
  },

  credentialCategory: {
    color: "#777",
    fontSize: 7,
    fontWeight: "bold",
  },

  modified: {
    color: "#777",
    fontSize: 7,
    fontWeight: "bold",
  },

  /* VACÍO */

  emptyContainer: {
    paddingVertical: 40,
    alignItems: "center",
  },

  emptyText: {
    color: MUTED,
    fontSize: 10,
  },

  /* PIE */

  securityFooter: {
    alignItems: "center",
    marginTop: 12,
    gap: 3,
  },

  securityFooterText: {
    color: "#555",
    fontSize: 7,
    fontWeight: "bold",
  },

  /* NAVEGACIÓN */

  footer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#333",
    marginTop: 20,
    paddingTop: 13,
  },

  footerItem: {
    color: "#777",
    fontSize: 8,
    textAlign: "center",
    lineHeight: 16,
  },

  footerActive: {
    borderBottomWidth: 2,
    borderBottomColor: GREEN,
    paddingBottom: 5,
  },

  footerItemActive: {
    color: GREEN,
    fontSize: 8,
    textAlign: "center",
    lineHeight: 16,
  },
});
