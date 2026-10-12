/** Control reutilizable para activar o desactivar una opción del generador. */
import { StyleSheet, Switch, Text, View } from "react-native";

const GREEN = "#00ff66";

type ParameterSwitchProps = {
  symbol: string;
  title: string;
  description: string;
  value: boolean;
  onChange: (value: boolean) => void;
};

export default function ParameterSwitch({
  symbol,
  title,
  description,
  value,
  onChange,
}: ParameterSwitchProps) {
  return (
    <View style={styles.parameterRow}>
      <View style={styles.parameterSymbolContainer}>
        <Text style={styles.parameterSymbol}>{symbol}</Text>
      </View>

      <View style={styles.parameterTextContainer}>
        <Text style={styles.parameterName}>{title}</Text>

        <Text style={styles.parameterDescription}>{description}</Text>
      </View>

      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{
          false: "#333",
          true: "#064d25",
        }}
        thumbColor={value ? GREEN : "#888"}
      />
    </View>
  );
}

// Estilos del interruptor reutilizable para activar o desactivar un parámetro.
const styles = StyleSheet.create({
  parameterRow: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 64,
    borderTopWidth: 1,
    borderTopColor: "#222",
  },

  parameterSymbolContainer: {
    width: 50,
  },

  parameterSymbol: {
    color: GREEN,
    fontSize: 14,
    fontWeight: "bold",
  },

  parameterTextContainer: {
    flex: 1,
    paddingRight: 10,
  },

  parameterName: {
    color: GREEN,
    fontSize: 14,
    fontWeight: "bold",
  },

  parameterDescription: {
    color: "#888",
    fontSize: 10,
    marginTop: 3,
  },
});
