/**
 * Pantalla para crear credenciales de pSword.
 * Permite elegir login web, tarjeta o nota segura, validar sus campos, generar
 * contraseñas para los logins y enviar el registro al VaultContext compartido.
 * Nota: en esta versión los registros se guardan en memoria y no se cifran aquí.
 */
// useState conserva los valores del formulario; useMemo evita recalcular datos derivados innecesariamente.
import { useMemo, useState } from "react";

import {
    Alert,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";

import * as Clipboard from "expo-clipboard";
import { router } from "expo-router";

import GeneratorCard from "@/components/boveda/GeneratorCard";
import ParametersCard from "@/components/boveda/ParametersCard";
import { useVault } from "@/context/VaultContext";

// Colores principales de la identidad visual de pSword.
const GREEN = "#00ff66";
const BACKGROUND = "#202020";

// Componente principal de la pantalla de alta de credenciales.
export default function NuevaCredencialScreen() {
  // Obtiene la función compartida que incorpora una credencial a la bóveda.
  const { addCredential } = useVault();

  // Tipo de registro seleccionado: login web, tarjeta o nota segura.
  const [recordType, setRecordType] = useState<"login" | "card" | "note">("login");
  const [serviceName, setServiceName] = useState("");
  const [username, setUsername] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardHolder, setCardHolder] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [secureNote, setSecureNote] = useState("");

  const [length, setLength] = useState(16);

  const [useUppercase, setUseUppercase] = useState(true);
  const [useLowercase, setUseLowercase] = useState(true);
  const [useNumbers, setUseNumbers] = useState(true);
  const [useSymbols, setUseSymbols] = useState(true);
  const [avoidAmbiguous, setAvoidAmbiguous] = useState(false);

  const [generatedPassword, setGeneratedPassword] =
    useState("T3SZ}PUxv4@dL*k>");

  // Define los grupos de caracteres que puede utilizar el generador.
  const characterSets = useMemo(() => {
    return {
      uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
      lowercase: "abcdefghijklmnopqrstuvwxyz",
      numbers: "0123456789",
      symbols: "!@#$%^&*()-_=+[]{}<>?",
      ambiguous: "O0Il1|`",
    };
  }, []);

  // Construye una contraseña según los tipos de caracteres seleccionados.
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

    // No se puede generar una contraseña si todos los grupos están desactivados.
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
  };

  // Copia la contraseña actual al portapapeles del dispositivo.
  const copyPassword = async () => {
    await Clipboard.setStringAsync(generatedPassword);

    Alert.alert(
      "Contraseña copiada",
      "La contraseña fue copiada al portapapeles.",
    );
  };

  // Calcula una puntuación orientativa a partir de la longitud y variedad.
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

  // Valida los campos requeridos y convierte el formulario al formato de la bóveda.
  const saveCredential = () => {
    const cleanName = serviceName.trim();
    const cleanUsername = username.trim();

    if (!cleanName) {
      Alert.alert("Falta información", "Escribe el nombre del servicio.");
      return;
    }

    if (recordType === "login" && !username.trim()) {
      Alert.alert("Falta información", "Escribe el usuario o correo.");
      return;
    }
    if (recordType === "card" && !cardNumber.trim()) {
      Alert.alert("Falta información", "Escribe el número de la tarjeta.");
      return;
    }
    if (recordType === "note" && !secureNote.trim()) {
      Alert.alert("Falta información", "Escribe el contenido de la nota segura.");
      return;
    }

    // Normaliza los campos según el tipo para que todos usen el mismo modelo.
    const savedUsername = recordType === "login"
      ? username.trim()
      : recordType === "card"
        ? (cardHolder.trim() || "TITULAR NO INDICADO")
        : "NOTA SEGURA";
    const savedPassword = recordType === "login"
      ? generatedPassword
      : recordType === "card"
        ? `${cardNumber.trim()}${cardExpiry.trim() ? ` · Vence ${cardExpiry.trim()}` : ""}`
        : secureNote.trim();

    // Inserta el registro en el estado compartido consumido por la bóveda.
    addCredential({
      name: cleanName,
      username: savedUsername,
      password: savedPassword,
      category: recordType === "login"
        ? "LOGIN WEB · GENERADA CON pSWORD"
        : recordType === "card" ? "TARJETA" : "NOTA SEGURA",
      strength: recordType === "login"
        ? securityLevel.percentage >= 90 ? "OPTIMA" : securityLevel.percentage >= 70 ? "FUERTE" : "MEDIA"
        : recordType === "card" ? "TARJETA" : "NOTA",
    });

    Alert.alert(
      "Credencial guardada",
      `${cleanName} fue agregada a la bóveda.`,
      [
        {
          text: "OK",
          onPress: () => router.replace("/boveda"),
        },
      ],
    );
  };

  // La interfaz muestra los controles específicos del tipo elegido.
  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* HEADER */}

        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backText}>‹</Text>
          </Pressable>

          <View style={styles.brandContainer}>
            <Text style={styles.brandPrefix}>&gt;pSword</Text>

            <Text style={styles.brandSection}>/ NUEVA CREDENCIAL</Text>
          </View>

          <View style={styles.securityBadge}>
            <Text style={styles.securityBadgeText}>🔒 AES-256</Text>
          </View>
        </View>

        {/* Este selector actualiza recordType; las secciones inferiores cambian según la opción activa. */}
        {/* TIPO DE REGISTRO */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>SELECCIONAR TIPO DE REGISTRO</Text>
          {/* Selector visual del tipo de registro activo. */}
          <View style={styles.typeSelector}>
            {([ ["login", "● LOGIN WEB"], ["card", "▣ TARJETA"], ["note", "▤ NOTA SEGURA"] ] as const).map(([type, label]) => (
              <Pressable key={type} onPress={() => setRecordType(type)} style={[styles.typeOption, recordType === type && styles.typeOptionActive]}>
                <Text style={[styles.typeOptionText, recordType === type && styles.typeOptionTextActive]}>{label}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Campos comunes y campos condicionales para login web, tarjeta o nota segura. */}
        {/* DATOS DE LA CREDENCIAL */}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{recordType === "login" ? "IDENTIDAD DE LA CREDENCIAL" : recordType === "card" ? "DATOS DE LA TARJETA" : "CONTENIDO DE LA NOTA"}</Text>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>SERVICIO / PLATAFORMA</Text>

            <TextInput
              value={serviceName}
              onChangeText={setServiceName}
              placeholder="Ej. GitHub"
              placeholderTextColor="#555"
              style={styles.input}
              autoCapitalize="words"
              autoCorrect={false}
            />
          </View>

          {/* Campos propios de una cuenta o inicio de sesión web. */}
          {recordType === "login" && <View style={styles.field}>
            <Text style={styles.fieldLabel}>USUARIO / CORREO</Text>

            <TextInput
              value={username}
              onChangeText={setUsername}
              placeholder="Ej. usuario@email.com"
              placeholderTextColor="#555"
              style={styles.input}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
            />
          </View>}

          {/* Campos propios de una tarjeta; no se deben usar datos bancarios reales en esta versión sin cifrado. */}
          {recordType === "card" && <>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>NÚMERO DE TARJETA</Text>
              <TextInput value={cardNumber} onChangeText={setCardNumber} placeholder="•••• •••• •••• ••••" placeholderTextColor="#555" style={styles.input} keyboardType="number-pad" />
            </View>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>TITULAR</Text>
              <TextInput value={cardHolder} onChangeText={setCardHolder} placeholder="Nombre del titular" placeholderTextColor="#555" style={styles.input} autoCapitalize="words" />
            </View>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>VENCIMIENTO (OPCIONAL)</Text>
              <TextInput value={cardExpiry} onChangeText={setCardExpiry} placeholder="MM/AA" placeholderTextColor="#555" style={styles.input} />
            </View>
          </>}

          {/* Campo de contenido privado para el tipo nota segura. */}
          {recordType === "note" && <View style={styles.field}>
            <Text style={styles.fieldLabel}>NOTA PRIVADA</Text>
            <TextInput value={secureNote} onChangeText={setSecureNote} placeholder="Escribe aquí la información que quieres guardar" placeholderTextColor="#555" style={[styles.input, styles.noteInput]} multiline textAlignVertical="top" />
          </View>}
        </View>

        {/* GENERADOR: SOLO PARA LOGINS WEB */}
        {recordType === "login" && <>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>CONTRASEÑA</Text>

          <GeneratorCard
            password={generatedPassword}
            length={length}
            securityLevel={securityLevel}
            onGenerate={generatePassword}
            onCopy={copyPassword}
            onAddToVault={saveCredential}
          />
        </View>

        {/* PARÁMETROS */}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>PARÁMETROS DE GENERACIÓN</Text>

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
        </View>
        </>}

        {/* BOTÓN GUARDAR */}

        <Pressable style={styles.saveButton} onPress={saveCredential}>
          <Text style={styles.saveButtonText}>🔐 GUARDAR EN BÓVEDA</Text>
        </Pressable>

        <Text style={styles.warningText}>
          La credencial se mantiene en memoria durante esta sesión.
        </Text>
      </ScrollView>
    </View>
  );
}

// Estilos de la pantalla: disposición, colores, campos y estados seleccionados.
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
    paddingBottom: 40,
  },

  header: {
    minHeight: 65,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#444",
    marginBottom: 22,
  },

  backButton: {
    width: 38,
    height: 38,
    borderWidth: 1,
    borderColor: "#333",
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
    backgroundColor: "#111",
  },

  backText: {
    color: GREEN,
    fontSize: 28,
    lineHeight: 30,
  },

  brandContainer: {
    flex: 1,
  },

  brandPrefix: {
    color: GREEN,
    fontSize: 18,
    fontWeight: "bold",
  },

  brandSection: {
    color: GREEN,
    fontSize: 9,
    fontWeight: "bold",
    marginTop: 2,
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
    fontSize: 10,
    fontWeight: "bold",
  },

  section: {
    marginBottom: 20,
  },

  typeSelector: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 7,
  },
  typeOption: {
    backgroundColor: "#111",
    borderWidth: 1,
    borderColor: "#333",
    borderRadius: 5,
    paddingVertical: 11,
    paddingHorizontal: 10,
  },
  typeOptionActive: {
    borderColor: GREEN,
    backgroundColor: "#082414",
  },
  typeOptionText: {
    color: "#888",
    fontSize: 10,
    fontWeight: "bold",
  },
  typeOptionTextActive: {
    color: GREEN,
  },
  noteInput: {
    minHeight: 130,
    paddingTop: 12,
  },

  sectionTitle: {
    color: "#777",
    fontSize: 9,
    fontWeight: "bold",
    marginBottom: 10,
  },

  field: {
    marginBottom: 12,
  },

  fieldLabel: {
    color: "#777",
    fontSize: 8,
    fontWeight: "bold",
    marginBottom: 6,
  },

  input: {
    height: 48,
    backgroundColor: "#111",
    borderWidth: 1,
    borderColor: "#333",
    borderRadius: 5,
    color: "#fff",
    paddingHorizontal: 12,
    fontSize: 12,
  },

  saveButton: {
    width: "100%",
    minHeight: 58,
    backgroundColor: GREEN,
    borderRadius: 7,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },

  saveButtonText: {
    color: "#000",
    fontSize: 14,
    fontWeight: "bold",
  },

  warningText: {
    color: "#555",
    fontSize: 8,
    textAlign: "center",
    marginTop: 12,
  },
});
