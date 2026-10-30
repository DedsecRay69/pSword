/**
 * Diseño raíz de navegación de Expo Router.
 * Define la estructura global de rutas y los proveedores que envuelven la app.
 */
import { VaultProvider } from "@/context/VaultContext";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

// Define el árbol raíz de navegación y los proveedores globales de la aplicación.
export default function RootLayout() {
  return (
    <VaultProvider>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }} />
    </VaultProvider>
  );
}