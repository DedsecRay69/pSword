/** Encabezado reutilizable del módulo generador, con título e información contextual. */
import { StyleSheet, Text, View } from "react-native";

const GREEN = "#00ff66";

type ModuleHeaderProps = {
  icon: string;
  title: string;
  rightText: string;
};

export default function ModuleHeader({
  icon,
  title,
  rightText,
}: ModuleHeaderProps) {
  return (
    <View style={styles.moduleHeader}>
      <View style={styles.moduleHeaderLeft}>
        <Text style={styles.moduleIcon}>{icon}</Text>

        <Text style={styles.moduleHeaderTitle}>{title}</Text>
      </View>

      <Text style={styles.moduleHeaderRight}>{rightText}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  moduleHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },

  moduleHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  moduleIcon: {
    color: GREEN,
    fontSize: 14,
    marginRight: 7,
  },

  moduleHeaderTitle: {
    color: GREEN,
    fontSize: 15,
    fontWeight: "bold",
  },

  moduleHeaderRight: {
    color: GREEN,
    fontSize: 11,
    fontWeight: "bold",
  },
});
