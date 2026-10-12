/** Componente que presenta las contraseñas generadas recientemente durante la sesión. */
import { Pressable, StyleSheet, Text, View } from "react-native";

import * as Clipboard from "expo-clipboard";

const GREEN = "#00ff66";

type HistoryItem = {
  id: string;
  password: string;
  time: string;
};

type HistoryCardProps = {
  history: HistoryItem[];
  onClear: () => void;
};

export default function HistoryCard({ history, onClear }: HistoryCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.historyHeader}>
        <View style={styles.historyTitleContainer}>
          <Text style={styles.historyIcon}>◷</Text>

          <Text style={styles.historyTitle}>Historial Efímero</Text>

          <Text style={styles.historyCount}>{history.length}</Text>
        </View>

        <Text style={styles.expiration}>EXPIRA EN 5M</Text>

        <Text style={styles.arrow}>⌄</Text>
      </View>

      <View style={styles.historyMemoryHeader}>
        <Text style={styles.memoryText}>MEMORIA EN RAM VOLÁTIL</Text>

        <Pressable onPress={onClear}>
          <Text style={styles.clearText}>▧ PURGAR AHORA</Text>
        </Pressable>
      </View>

      {history.length === 0 ? (
        <Text style={styles.emptyHistory}>
          No hay contraseñas generadas recientemente.
        </Text>
      ) : (
        history.map((item) => (
          <View key={item.id} style={styles.historyItem}>
            <Text style={styles.historyLock}>♧</Text>

            <Text style={styles.historyPassword} numberOfLines={1}>
              {item.password}
            </Text>

            <Text style={styles.historyTime}>{item.time}</Text>

            <Pressable onPress={() => Clipboard.setStringAsync(item.password)}>
              <Text style={styles.historyCopy}>▣</Text>
            </Pressable>
          </View>
        ))
      )}
    </View>
  );
}

// Estilos del historial de contraseñas generadas y su botón para limpiar.
const styles = StyleSheet.create({
  card: {
    width: "100%",
    backgroundColor: "#151515",
    borderWidth: 1,
    borderColor: "#292929",
    borderRadius: 8,
    padding: 16,
  },

  historyHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  historyTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  historyIcon: {
    color: "#ffcc33",
    fontSize: 19,
    marginRight: 7,
  },

  historyTitle: {
    color: GREEN,
    fontSize: 15,
    fontWeight: "bold",
  },

  historyCount: {
    backgroundColor: "#252525",
    color: GREEN,
    fontSize: 10,
    marginLeft: 7,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 3,
  },

  expiration: {
    color: "#d7bd72",
    fontSize: 9,
    fontWeight: "bold",
  },

  arrow: {
    color: "#aaa",
    fontSize: 19,
    marginLeft: 8,
  },

  historyMemoryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 20,
    marginBottom: 6,
    paddingHorizontal: 4,
  },

  memoryText: {
    color: "#777",
    fontSize: 9,
    fontWeight: "bold",
  },

  clearText: {
    color: "#ff6666",
    fontSize: 9,
    fontWeight: "bold",
  },

  emptyHistory: {
    color: "#555",
    fontSize: 11,
    textAlign: "center",
    paddingVertical: 30,
  },

  historyItem: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 46,
    borderTopWidth: 1,
    borderTopColor: "#222",
    gap: 8,
  },

  historyLock: {
    color: GREEN,
    fontSize: 14,
  },

  historyPassword: {
    color: "#ddd",
    fontSize: 12,
    flex: 1,
    fontFamily: "monospace",
  },

  historyTime: {
    color: "#888",
    fontSize: 9,
  },

  historyCopy: {
    color: "#aaa",
    fontSize: 15,
    paddingHorizontal: 5,
  },
});
