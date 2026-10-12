/**
 * Pantalla del generador de contraseñas.
 * Reúne los controles de longitud y tipos de caracteres, genera una contraseña,
 * estima su fortaleza y permite copiarla o consultar el historial de la sesión.
 */
import { useMemo, useState } from "react";

import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import * as Clipboard from "expo-clipboard";
import { router } from "expo-router";

import GeneratorCard from "@/components/boveda/GeneratorCard";
import HistoryCard from "@/components/boveda/HistoryCard";
import ParametersCard from "@/components/boveda/ParametersCard";

const GREEN = "#00ff66";
const BACKGROUND = "#202020";

type HistoryItem = {
  id: string;
  password: string;
  time: string;
};

export default function TestVaultScreen() {
  const [length, setLength] = useState(16);

  const [useUppercase, setUseUppercase] = useState(true);
  const [useLowercase, setUseLowercase] = useState(true);
  const [useNumbers, setUseNumbers] = useState(true);
  const [useSymbols, setUseSymbols] = useState(true);
  const [avoidAmbiguous, setAvoidAmbiguous] = useState(false);

  const [generatedPassword, setGeneratedPassword] =
    useState("T3SZ}PUxv4@dL*k>");

  const [history, setHistory] = useState<HistoryItem[]>([]);

// Reúne los grupos de caracteres usados por el generador de contraseñas.
  const characterSets = useMemo(() => {
    return {
      uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
      lowercase: "abcdefghijklmnopqrstuvwxyz",
      numbers: "0123456789",
      symbols: "!@#$%^&*()-_=+[]{}<>?",
      ambiguous: "O0Il1|`",
    };
  }, []);

// Genera una contraseña con la longitud y los grupos de caracteres seleccionados.
  const generatePassword = () => {
    let availableCharacters = "";

    if (useUppercase) {
      availableCharacters += characterSets.uppercase;
    }

    if (useLowercase) {
      availableCharacters += characterSets.lowercase;
    }

    if (useNumbers) {
      availableCharacters += characterSets.numbers;
    }

    if (useSymbols) {
      availableCharacters += characterSets.symbols;
    }

    if (avoidAmbiguous) {
      availableCharacters = availableCharacters
        .split("")
        .filter((character) => !characterSets.ambiguous.includes(character))
        .join("");
    }

    if (!availableCharacters) {
      Alert.alert(
        "Configuración inválida",
        "Seleccione al menos un tipo de carácter.",
      );
      return;
    }

    let password = "";

    for (let i = 0; i < length; i++) {
      const index = Math.floor(Math.random() * availableCharacters.length);

      password += availableCharacters[index];
    }

    setGeneratedPassword(password);

    const newHistoryItem: HistoryItem = {
      id: Date.now().toString(),
      password,
      time: "Ahora",
    };

    setHistory((currentHistory) =>
      [newHistoryItem, ...currentHistory].slice(0, 5),
    );
  };

// Copia al portapapeles la contraseña mostrada en pantalla.
  const copyPassword = async () => {
    await Clipboard.setStringAsync(generatedPassword);

    Alert.alert(
      "Contraseña copiada",
      "La contraseña fue copiada al portapapeles.",
    );
  };

// Guarda la contraseña generada como un registro de la bóveda compartida.
  const addToVault = () => {
    Alert.alert(
      "Bóveda",
      "La contraseña será agregada a la bóveda en la siguiente versión.",
    );
  };

// Estima la fortaleza de la contraseña para mostrar una indicación al usuario.
  const securityLevel = useMemo(() => {
    let score = 0;

    if (length >= 12) score += 25;
    if (length >= 16) score += 25;
    if (useUppercase) score += 10;
    if (useLowercase) score += 10;
    if (useNumbers) score += 10;
    if (useSymbols) score += 20;

    if (score >= 90) {
      return {
        text: "PENETRACIÓN IMPOSIBLE",
        percentage: 100,
      };
    }

    if (score >= 70) {
      return {
        text: "MUY SEGURA",
        percentage: 85,
      };
    }

    if (score >= 50) {
      return {
        text: "SEGURA",
        percentage: 65,
      };
    }

    return {
      text: "DÉBIL",
      percentage: 35,
    };
  }, [length, useUppercase, useLowercase, useNumbers, useSymbols]);

// Vacía el historial temporal de contraseñas generadas.
  const clearHistory = () => {
    setHistory([]);
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

            <Text style={styles.brandSection}>/ GENERADOR</Text>
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

        {/* CONTENIDO */}

        <View style={styles.mainColumn}>
          <GeneratorCard
            password={generatedPassword}
            length={length}
            securityLevel={securityLevel}
            onGenerate={generatePassword}
            onCopy={copyPassword}
            onAddToVault={addToVault}
          />

          <ParametersCard
            length={length}
            setLength={setLength}
            useUppercase={useUppercase}
            setUseUppercase={setUseUppercase}
            useLowercase={useLowercase}
            setUseLowercase={setUseLowercase}
            useNumbers={useNumbers}
            setUseNumbers={setUseNumbers}
            useSymbols={useSymbols}
            setUseSymbols={setUseSymbols}
            avoidAmbiguous={avoidAmbiguous}
            setAvoidAmbiguous={setAvoidAmbiguous}
          />

          <HistoryCard history={history} onClear={clearHistory} />

          {/* LEYENDA */}

          <View style={styles.legend}>
            <Text style={styles.legendText}>
              <Text style={styles.greenDot}>●</Text> Mayús
            </Text>

            <Text style={styles.legendText}>
              <Text style={styles.whiteDot}>●</Text> Minús
            </Text>

            <Text style={styles.legendText}>
              <Text style={styles.yellowDot}>●</Text> Núm
            </Text>

            <Text style={styles.legendText}>
              <Text style={styles.grayDot}>●</Text> Símb
            </Text>

            <Text style={styles.telemetry}>CERO TELEMETRÍA</Text>
          </View>

          {/* GENERAR */}

          <Pressable style={styles.generateButton} onPress={generatePassword}>
            <Text style={styles.generateButtonText}>
              GENERAR NUEVA CONTRASEÑA
            </Text>
          </Pressable>
        </View>

        {/* FOOTER */}

        <View style={styles.footer}>
          <Pressable onPress={() => router.replace("/boveda")}>
            <Text style={styles.footerItem}>
              ♧{"\n"}
              BÓVEDA
            </Text>
          </Pressable>

          <View style={styles.footerActive}>
            <Text style={styles.footerItemActive}>
              ▦{"\n"}
              GENERADOR
            </Text>
          </View>

        </View>

        {/* LOGOUT */}

        <Pressable style={styles.logout} onPress={() => router.replace("/")}>
          <Text style={styles.logoutText}>CERRAR SESIÓN</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

// Estilos de la interfaz del generador y sus componentes secundarios.
const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: BACKGROUND,
  },

  scrollContent: {
    width: "100%",
    maxWidth: 760,
    alignSelf: "center",
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 30,
  },

  header: {
    minHeight: 65,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#444",
    marginBottom: 20,
  },

  brandContainer: {
    flexDirection: "row",
    alignItems: "center",
  },

  brandPrefix: {
    color: GREEN,
    fontSize: 18,
    fontWeight: "bold",
  },

  brandSection: {
    color: GREEN,
    fontSize: 12,
    fontWeight: "bold",
    marginLeft: 6,
  },

  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  securityBadge: {
    backgroundColor: "#101010",
    borderWidth: 1,
    borderColor: "#183c28",
    borderRadius: 5,
    paddingHorizontal: 9,
    paddingVertical: 7,
  },

  securityBadgeText: {
    color: GREEN,
    fontSize: 11,
    fontWeight: "bold",
  },

  userButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: GREEN,
    alignItems: "center",
    justifyContent: "center",
  },

  userIcon: {
    color: GREEN,
    fontSize: 20,
  },

  mainColumn: {
    width: "100%",
    maxWidth: 680,
    alignSelf: "center",
    gap: 18,
  },

  legend: {
    width: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 4,
  },

  legendText: {
    color: "#aaa",
    fontSize: 9,
  },

  greenDot: {
    color: GREEN,
  },

  whiteDot: {
    color: "#fff",
  },

  yellowDot: {
    color: "#ffd34d",
  },

  grayDot: {
    color: "#888",
  },

  telemetry: {
    color: GREEN,
    fontSize: 9,
    fontWeight: "bold",
    marginLeft: "auto",
  },

  generateButton: {
    width: "100%",
    minHeight: 58,
    backgroundColor: GREEN,
    borderRadius: 7,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },

  generateButtonText: {
    color: "#000",
    fontSize: 15,
    fontWeight: "bold",
  },

  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 60,
    borderTopWidth: 1,
    borderTopColor: "#333",
    marginTop: 28,
    paddingTop: 18,
  },

  footerItem: {
    color: "#777",
    fontSize: 9,
    textAlign: "center",
    lineHeight: 18,
  },

  footerActive: {
    borderBottomWidth: 2,
    borderBottomColor: GREEN,
    paddingBottom: 5,
  },

  footerItemActive: {
    color: GREEN,
    fontSize: 9,
    textAlign: "center",
    lineHeight: 18,
  },

  logout: {
    alignSelf: "center",
    marginTop: 22,
    padding: 10,
  },

  logoutText: {
    color: "#666",
    fontSize: 10,
  },
});
