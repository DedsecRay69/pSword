import { useState } from 'react';
import {
  Image,
  Linking,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { router } from 'expo-router';

export default function HomeScreen() {
  const [password, setPassword] = useState('');

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
        onChangeText={setPassword}
        secureTextEntry
      />

      {/* Botón ingresar */}
      <Pressable style={styles.button}>
        <Text style={styles.buttonText}>INGRESAR</Text>
      </Pressable>

      {/* Configuración de contraseña */}
      <Pressable
        onPress={() => router.push('/setup-password')}
      >
        <Text style={styles.link}>
          ¿No tiene una contraseña?{' '}
          <Text style={styles.linkHighlight}>ingrese aquí</Text>
        </Text>
      </Pressable>

      {/* GitHub */}
      <Pressable
        style={styles.githubButton}
        onPress={() => Linking.openURL('https://github.com/DedsecRay69/pSword')}
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
    marginBottom: 25,
  },

  buttonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
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

  githubText: {
    color: '#00ff66',
    fontSize: 14,
    fontWeight: 'bold',
  },
});