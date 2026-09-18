// Este script gestiona el inicio de sesión y la interacción entre la interfaz 
// y la lógica de la contraseña maestra definida en masterPassword.ts.
import { useEffect, useState } from 'react';

import {
  Image,
  Linking,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import {
  hasMasterPassword,
  verifyMasterPassword,
} from '@/core/masterPassword';
import { router } from 'expo-router';

export default function HomeScreen() {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [hasPassword, setHasPassword] = useState(false);
  const [error, setError] = useState('');

  // Comprueba si ya existe una contraseña maestra
  useEffect(() => {
    const checkPassword = async () => {
      try {
        const exists = await hasMasterPassword();

        setHasPassword(exists);

        // Primera ejecución: lleva a configurar la contraseña
        if (!exists) {
          router.replace('/setup-password');
        }
      } catch (error) {
        console.error('Error al comprobar la contraseña:', error);
      } finally {
        setLoading(false);
      }
    };

    checkPassword();
  }, []);

  // Comprueba la contraseña ingresada
  const handleLogin = async () => {
    if (!password) {
      setError('Ingrese su contraseña.');
      return;
    }

    try {
      setError('');

      const valid = await verifyMasterPassword(password);

      if (valid) {
        router.replace('/test-vault');
      } else {
        setError('Contraseña incorrecta.');
        setPassword('');
      }
    } catch (error) {
      console.error('Error al verificar la contraseña:', error);
      setError('No se pudo verificar la contraseña.');
    }
  };

  // Evita mostrar el login mientras se comprueba SecureStore
  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Cargando...</Text>
      </View>
    );
  }

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

      {/* Campo de contraseña */}
      <TextInput
        style={styles.input}
        placeholder="Ingrese su contraseña"
        placeholderTextColor="#777"
        value={password}
        onChangeText={(text) => {
          setPassword(text);
          setError('');
        }}
        secureTextEntry
      />

      {/* Mensaje de error */}
      {error !== '' && (
        <Text style={styles.errorText}>
          {error}
        </Text>
      )}

      {/* Botón ingresar */}
      <Pressable
        style={styles.button}
        onPress={handleLogin}
      >
        <Text style={styles.buttonText}>INGRESAR</Text>
      </Pressable>

      {/* Configuración de contraseña */}
      {!hasPassword && (
        <Pressable
          onPress={() => router.push('/setup-password')}
        >
          <Text style={styles.link}>
            ¿No tiene una contraseña?{' '}
            <Text style={styles.linkHighlight}>
              ingrese aquí
            </Text>
          </Text>
        </Pressable>
      )}

      {/* GitHub */}
      <Pressable
        style={styles.githubButton}
        onPress={() =>
          Linking.openURL('https://github.com/DedsecRay69/pSword')
        }
      >
        <Image
          source={require('../../assets/images/github.png')}
          style={styles.githubIcon}
          resizeMode="contain"
        />
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
    height: 200,
    marginBottom: 15,
  },

  logo: {
    width: 80,
    height: 80,
    marginBottom: 35,
  },

  input: {
    width: '100%',
    maxWidth: 400,
    height: 50,
    backgroundColor: '#e6e6e6',
    borderRadius: 8,
    paddingHorizontal: 15,
    color: '#000',
    fontSize: 16,
    marginBottom: 10,
  },

  button: {
    width: '100%',
    maxWidth: 400,
    height: 50,
    backgroundColor: '#00ff66',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 25,
    marginTop: 10,
  },

  buttonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },

  errorText: {
    color: '#ff4444',
    fontSize: 14,
    marginTop: 5,
  },

  link: {
    color: '#aaa',
    fontSize: 14,
    marginBottom: 25,
  },

  linkHighlight: {
    color: '#00ff66',
    fontWeight: 'bold',
  },

  githubButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    padding: 10,
  },

  githubIcon: {
    width: 35,
    height: 35,
  },

  loadingText: {
    color: '#00ff66',
    fontSize: 16,
  },
});

