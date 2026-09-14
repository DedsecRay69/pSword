import { useState } from 'react';

import {
    Image,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';

import { router } from 'expo-router';

export default function SetupPasswordScreen() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const passwordsMatch =
    password === confirmPassword && password.length > 0;

  return (
    <View style={styles.container}>

      {/* Logo ASCII */}
      <Image
        source={require('../../assets/images/pSword_banner.png')}
        style={styles.banner}
        resizeMode="contain"
      />

      {/* Candado */}
      <Image
        source={require('../../assets/images/pSword_logo.jpeg')}
        style={styles.logo}
        resizeMode="contain"
      />

      {/* Título */}
      <Text style={styles.title}>
        [ CONFIGURAR CONTRASEÑA MAESTRA ]
      </Text>

      {/* Nueva contraseña */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Nueva contraseña"
          placeholderTextColor="#777"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
        />

        <Pressable
          style={styles.eyeButton}
          onPress={() => setShowPassword(!showPassword)}
        >
          <Text style={styles.eyeText}>
            {showPassword ? 'OCULTAR' : 'MOSTRAR'}
          </Text>
        </Pressable>
      </View>

      {/* Confirmar contraseña */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Confirme su contraseña"
          placeholderTextColor="#777"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry={!showConfirmPassword}
        />

        <Pressable
          style={styles.eyeButton}
          onPress={() =>
            setShowConfirmPassword(!showConfirmPassword)
          }
        >
          <Text style={styles.eyeText}>
            {showConfirmPassword ? 'OCULTAR' : 'MOSTRAR'}
          </Text>
        </Pressable>
      </View>

      {/* Mensaje de validación */}
      {confirmPassword.length > 0 && (
        <Text
          style={
            passwordsMatch
              ? styles.successText
              : styles.errorText
          }
        >
          {passwordsMatch
            ? 'Las contraseñas coinciden.'
            : 'Las contraseñas no coinciden.'}
        </Text>
      )}

      {/* Recomendación */}
      <Text style={styles.recommendation}>
        Se recomienda utilizar una contraseña larga y difícil
        de adivinar. Esta contraseña será utilizada para
        proteger su bóveda.
      </Text>

      {/* Guardar */}
      <Pressable
        style={[
          styles.button,
          !passwordsMatch && styles.buttonDisabled,
        ]}
        disabled={!passwordsMatch}
        onPress={() => {
          console.log('Contraseña válida. Próximamente se almacenará de forma segura.');
        }}
      >
        <Text style={styles.buttonText}>
          GUARDAR CONTRASEÑA
        </Text>
      </Pressable>

      {/* Volver al login */}
      <Pressable
        onPress={() => router.back()}
        style={styles.backButton}
      >
        <Text style={styles.backText}>
          ¿Ya tiene una contraseña?{' '}
          <Text style={styles.linkHighlight}>
            volver al inicio
          </Text>
        </Text>
      </Pressable>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },

  banner: {
    width: '85%',
    height: 120,
    marginBottom: 10,
  },

  logo: {
    width: 70,
    height: 70,
    marginBottom: 20,
  },

  title: {
    color: '#00ff66',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 25,
  },

  inputContainer: {
    width: '100%',
    maxWidth: 400,
    height: 50,
    marginBottom: 15,
    position: 'relative',
  },

  input: {
    width: '100%',
    height: '100%',
    backgroundColor: '#e6e6e6',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingRight: 90,
    color: '#000',
    fontSize: 16,
  },

  eyeButton: {
    position: 'absolute',
    right: 10,
    top: 0,
    height: '100%',
    justifyContent: 'center',
  },

  eyeText: {
    color: '#333',
    fontSize: 11,
    fontWeight: 'bold',
  },

  successText: {
    width: '100%',
    maxWidth: 400,
    color: '#00ff66',
    fontSize: 12,
    marginBottom: 10,
  },

  errorText: {
    width: '100%',
    maxWidth: 400,
    color: '#ff4444',
    fontSize: 12,
    marginBottom: 10,
  },

  recommendation: {
    width: '100%',
    maxWidth: 400,
    color: '#888',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },

  button: {
    width: '100%',
    maxWidth: 400,
    height: 50,
    backgroundColor: '#00ff66',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },

  buttonDisabled: {
    opacity: 0.4,
  },

  buttonText: {
    color: '#000',
    fontSize: 15,
    fontWeight: 'bold',
  },

  backButton: {
    paddingVertical: 10,
  },

  backText: {
    color: '#aaa',
    fontSize: 13,
  },

  linkHighlight: {
    color: '#00ff66',
    fontWeight: 'bold',
  },
});