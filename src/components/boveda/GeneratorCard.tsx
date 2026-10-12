/** Tarjeta de interfaz que muestra la contraseña generada y sus acciones principales. */
import { Pressable, StyleSheet, Text, View } from "react-native";

import ModuleHeader from "./ModuleHeader";

const GREEN = "#00ff66";
const INPUT = "#101010";

type SecurityLevel = {
  text: string;
  percentage: number;
};

type GeneratorCardProps = {
  password: string;
  length: number;
  securityLevel: SecurityLevel;
  onGenerate: () => void;
  onCopy: () => void;
  onAddToVault: () => void;
};

export default function GeneratorCard({
  password,
  length,
  securityLevel,
  onGenerate,
  onCopy,
  onAddToVault,
}: GeneratorCardProps) {
  return (
    <View style={styles.card}>
      <ModuleHeader
        icon="▣"
        title="TOKEN GENERADO"
        rightText={`${length} CARS`}
      />

      <View style={styles.passwordBox}>
        <Text
          style={styles.passwordText}
          numberOfLines={1}
          adjustsFontSizeToFit
        >
          {password}
        </Text>

        <Pressable style={styles.refreshButton} onPress={onGenerate}>
          <Text style={styles.refreshText}>↻</Text>
        </Pressable>
      </View>

      <View style={styles.strengthHeader}>
        <Text style={styles.strengthText}>
          Nivel de seguridad · {securityLevel.text}
        </Text>

        <Text style={styles.strengthPercentage}>
          {securityLevel.percentage}%
        </Text>
      </View>

      <View style={styles.strengthBar}>
        <View
          style={[
            styles.strengthFill,
            { width: `${securityLevel.percentage}%` },
          ]}
        />
      </View>

      <View style={styles.actionRow}>
        <Pressable
          style={[styles.actionButton, styles.primaryButton]}
          onPress={onCopy}
        >
          <Text style={styles.primaryButtonText}>▣ COPIAR</Text>
        </Pressable>

        <Pressable
          style={[styles.actionButton, styles.secondaryButton]}
          onPress={onAddToVault}
        >
          <Text style={styles.secondaryButtonText}>♢ A BÓVEDA</Text>
        </Pressable>
      </View>
    </View>
  );
}

// Estilos de la tarjeta que muestra la contraseña generada y las acciones relacionadas.
const styles = StyleSheet.create({
  card: {
    width: "100%",
    backgroundColor: "#151515",
    borderWidth: 1,
    borderColor: "#292929",
    borderRadius: 8,
    padding: 16,
  },

  passwordBox: {
    backgroundColor: INPUT,
    borderRadius: 7,
    minHeight: 72,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  passwordText: {
    color: GREEN,
    fontSize: 19,
    fontWeight: "bold",
    letterSpacing: 2,
    flex: 1,
  },

  refreshButton: {
    backgroundColor: "#262626",
    width: 42,
    height: 42,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 10,
  },

  refreshText: {
    color: "#dddddd",
    fontSize: 23,
  },

  strengthHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 15,
  },

  strengthText: {
    color: GREEN,
    fontSize: 11,
    fontWeight: "bold",
    flex: 1,
  },

  strengthPercentage: {
    color: GREEN,
    fontSize: 12,
    fontWeight: "bold",
  },

  strengthBar: {
    height: 6,
    backgroundColor: "#252525",
    borderRadius: 5,
    marginTop: 7,
    overflow: "hidden",
  },

  strengthFill: {
    height: "100%",
    backgroundColor: GREEN,
    borderRadius: 5,
  },

  actionRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 16,
  },

  actionButton: {
    flex: 1,
    minHeight: 50,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },

  primaryButton: {
    backgroundColor: GREEN,
  },

  secondaryButton: {
    backgroundColor: "#282828",
  },

  primaryButtonText: {
    color: "#000",
    fontSize: 13,
    fontWeight: "bold",
  },

  secondaryButtonText: {
    color: GREEN,
    fontSize: 13,
    fontWeight: "bold",
  },
});
