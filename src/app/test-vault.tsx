//todo esto sencillamente es una pantalla de prueba para validar el acceso
//no hay nada funional aqui (toca borrar esto despues)
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { router } from 'expo-router';

export default function TestVaultScreen() {
  const handleLogout = () => {
    router.replace('/');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>pSword</Text>

      <Text style={styles.message}>
        ¡Bienvenido a pSword!
      </Text>

      <Text style={styles.description}>
        Esta es la pantalla de prueba del flujo de autenticación.
      </Text>

      <Pressable style={styles.button} onPress={handleLogout}>
        <Text style={styles.buttonText}>CERRAR SESIÓN</Text>
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

  title: {
    color: '#00ff66',
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 30,
  },

  message: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },

  description: {
    color: '#888',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 40,
  },

  button: {
    width: '100%',
    maxWidth: 400,
    height: 50,
    backgroundColor: '#00ff66',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },

  buttonText: {
    color: '#000',
    fontSize: 15,
    fontWeight: 'bold',
  },
});