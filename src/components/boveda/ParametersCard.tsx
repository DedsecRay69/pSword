/** Panel con los parámetros que controlan la generación de contraseñas. */
import { StyleSheet, Text, View } from "react-native";

import Slider from "@react-native-community/slider";

import ModuleHeader from "./ModuleHeader";
import ParameterSwitch from "./ParameterSwitch";

const GREEN = "#00ff66";

type ParametersCardProps = {
  length: number;
  setLength: (value: number) => void;
  useUppercase: boolean;
  setUseUppercase: (value: boolean) => void;
  useLowercase: boolean;
  setUseLowercase: (value: boolean) => void;
  useNumbers: boolean;
  setUseNumbers: (value: boolean) => void;
  useSymbols: boolean;
  setUseSymbols: (value: boolean) => void;
  avoidAmbiguous: boolean;
  setAvoidAmbiguous: (value: boolean) => void;
};

export default function ParametersCard({
  length,
  setLength,
  useUppercase,
  setUseUppercase,
  useLowercase,
  setUseLowercase,
  useNumbers,
  setUseNumbers,
  useSymbols,
  setUseSymbols,
  avoidAmbiguous,
  setAvoidAmbiguous,
}: ParametersCardProps) {
  return (
    <View style={styles.card}>
      <ModuleHeader
        icon="☷"
        title="REGLAS Y PARÁMETROS"
        rightText="CONFIG. PRIVADA"
      />

      <View style={styles.parameterHeader}>
        <Text style={styles.parameterTitle}>Longitud</Text>
        <Text style={styles.parameterValue}>{length} CARACTERES</Text>
      </View>

      <View style={styles.sliderContainer}>
        <Slider
          style={styles.slider}
          minimumValue={8}
          maximumValue={20}
          step={1}
          value={length}
          onValueChange={(value) => setLength(Math.round(value))}
          minimumTrackTintColor={GREEN}
          maximumTrackTintColor="#333"
          thumbTintColor={GREEN}
        />
      </View>

      <View style={styles.minMaxRow}>
        <Text style={styles.minMaxText}>MIN: 08</Text>
        <Text style={styles.sliderCurrentValue}>{length}</Text>
        <Text style={styles.minMaxText}>MAX: 20</Text>
      </View>

      <ParameterSwitch
        symbol="AZ"
        title="Mayúsculas"
        description="A-Z alfabético"
        value={useUppercase}
        onChange={setUseUppercase}
      />

      <ParameterSwitch
        symbol="az"
        title="Minúsculas"
        description="a-z alfabético estándar"
        value={useLowercase}
        onChange={setUseLowercase}
      />

      <ParameterSwitch
        symbol="09"
        title="Números"
        description="0 al 9 dígitos decimales"
        value={useNumbers}
        onChange={setUseNumbers}
      />

      <ParameterSwitch
        symbol="#$"
        title="Símbolos Especiales"
        description="!@#$%^&*()-_=+"
        value={useSymbols}
        onChange={setUseSymbols}
      />

      <ParameterSwitch
        symbol="01"
        title="Evitar Ambiguos"
        description="Excluir 0, O, 1, l, I"
        value={avoidAmbiguous}
        onChange={setAvoidAmbiguous}
      />
    </View>
  );
}

// Estilos del panel que agrupa longitud y opciones del generador.
const styles = StyleSheet.create({
  card: {
    width: "100%",
    backgroundColor: "#151515",
    borderWidth: 1,
    borderColor: "#292929",
    borderRadius: 8,
    padding: 16,
  },

  parameterHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  parameterTitle: {
    color: GREEN,
    fontSize: 14,
    fontWeight: "bold",
  },

  parameterValue: {
    color: GREEN,
    fontSize: 11,
    fontWeight: "bold",
  },

  sliderContainer: {
    marginTop: 20,
    paddingHorizontal: 2,
  },

  slider: {
    width: "100%",
    height: 40,
  },

  minMaxRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 2,
    marginBottom: 12,
  },

  minMaxText: {
    color: "#777",
    fontSize: 8,
    fontWeight: "bold",
  },

  sliderCurrentValue: {
    color: GREEN,
    fontSize: 12,
    fontWeight: "bold",
  },
});
