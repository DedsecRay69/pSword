# pSword

<p align="center">
  <img src="assets/images/pSword_logo.jpeg" width="100" alt="pSword Logo">
</p>

## Descripción

**pSword** es una aplicación móvil de código abierto orientada a la **gestión segura de credenciales y contraseñas**.

El proyecto nace como una alternativa accesible para ayudar a mitigar una problemática común: el uso de contraseñas débiles, repetidas o fáciles de adivinar.

pSword busca proporcionar una interfaz sencilla para que los usuarios puedan gestionar sus credenciales de forma segura mediante una **bóveda protegida por una contraseña maestra**.

---

## Características

### Implementadas

- Interfaz de autenticación.
- Configuración de contraseña maestra.
- Validación de confirmación de contraseña.
- Mostrar u ocultar la contraseña.
- Navegación entre las pantallas de autenticación.
- Acceso al repositorio de GitHub desde la aplicación.
- Interfaz adaptada para dispositivos móviles.

### En desarrollo

- Almacenamiento seguro de la contraseña maestra.
- Bóveda de credenciales.
- Agregar, editar y eliminar credenciales.
- Generador de contraseñas seguras.
- Cifrado de la información almacenada.
- Verificación de integridad de la bóveda.
- Implementación de blockchain como mecanismo adicional de integridad.

---

## Tecnologías

pSword utiliza las siguientes tecnologías:

- **React Native** — Desarrollo de la aplicación móvil.
- **Expo** — Entorno y herramientas para el desarrollo con React Native.
- **TypeScript** — Lenguaje utilizado para el desarrollo.
- **Expo Router** — Navegación basada en archivos.
- **Git** — Control de versiones.
- **GitHub** — Repositorio y colaboración.

Para los componentes de seguridad se contempla el uso de:

- **Criptografía** para proteger la información almacenada.
- **Funciones de derivación de claves (KDF)** para el manejo seguro de la contraseña maestra.
- **Cifrado autenticado** para proteger la bóveda.
- **Blockchain / hashes encadenados** como mecanismo de verificación de integridad.

> Las tecnologías de seguridad se encuentran actualmente en fase de diseño e implementación.

---

## Estructura del proyecto

```text
pSword/
├── assets/
│   └── images/
│       ├── pSword_banner.png
│       ├── pSword_logo.jpeg
│       └── ...
│
├── src/
│   ├── app/
│   │   ├── index.tsx
│   │   ├── setup-password.tsx
│   │   └── _layout.tsx
│   │
│   ├── components/
│   ├── constants/
│   └── hooks/
│
├── package.json
├── tsconfig.json
└── README.md