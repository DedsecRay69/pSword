/**
 * Diseño raíz de navegación de Expo Router.
 * Define la estructura global de rutas y los proveedores que envuelven la app.
 */
import { Stack } from "expo-router";
import { VaultProvider } from "@/context/VaultContext";

// Define el árbol raíz de navegación y los proveedores globales de la aplicación.
export default function RootLayout() {
  return (
    <VaultProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </VaultProvider>
  );
}
