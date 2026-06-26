# MusicXpress - Reproductor de Música Premium para Google Drive

MusicXpress es un cliente de música web estático e interactivo (inspirado en la interfaz de Spotify) diseñado con una estética oscura y acentos morados neón, glassmorphic panels y un visualizador de ondas reactivo en Canvas.

Esta aplicación te permite conectar y reproducir tus propios archivos de audio alojados en una carpeta de **Google Drive** de manera directa, sin servidores intermediarios. Toda la autenticación y transmisión ocurre 100% en el navegador (client-side), lo cual la hace ideal para alojarse gratis en **GitHub Pages**.

---

## 🚀 Características Principales

* 🎨 **Diseño Moderno:** Estética Premium en negro y morado con efectos de cristal y desenfoque.
* ☁️ **Sincronización con Google Drive:** Conéctate con tus credenciales y carga canciones en tiempo real desde una carpeta específica.
* 📻 **Modo Demostración:** Prueba el reproductor, controles y el visualizador inmediatamente con música de prueba libre de derechos sin necesidad de configurar Google Drive primero.
* 🎛️ **Controles de Audio Completos:** Play, pausa, avanzar, retroceder, reproducción aleatoria (Shuffle), repetición (Repeat), barra de progreso seekable y control de volumen/mute.
* 🌌 **Visualizador Reactivo:** Un lienzo de HTML5 Canvas que genera ondas o barras neón que pulsan al ritmo de los graves y agudos usando la Web Audio API.
* 🔍 **Buscador en Tiempo Real:** Filtra tus canciones cargadas por título o artista instantáneamente.
* 🔒 **Seguridad y Privacidad:** Tus credenciales de cliente se guardan localmente en el navegador (`localStorage`). El token de acceso OAuth se maneja sólo en memoria para evitar filtraciones.

---

## 🛠️ Requisitos e Instalación

### 1. Clona o Inicializa el Proyecto
Asegúrate de tener [Node.js](https://nodejs.org/) instalado. En la carpeta del proyecto, ejecuta:

```bash
# Instalar dependencias
npm install
```

### 2. Ejecuta en Desarrollo
Para levantar el servidor de desarrollo local:

```bash
npm run dev
```
Abre tu navegador en `http://localhost:5173`.

---

## ⚙️ Configuración de Google Drive API (OAuth 2.0)

Dado que la aplicación corre completamente en tu navegador (sin servidor backend), necesitas crear tu propio **Client ID de Google OAuth** para que la app pueda comunicarse de manera segura con tu cuenta de Drive.

### Paso 1: Crear Credenciales en Google Cloud Console
1. Abre [Google Cloud Console](https://console.cloud.google.com/).
2. Crea un proyecto nuevo.
3. Ve a la **Biblioteca de APIs** y busca **Google Drive API**. Actívala.
4. Ve a la pestaña **Pantalla de consentimiento de OAuth** (OAuth Consent Screen):
   - Elige el tipo de usuario **Externo**.
   - Ingresa los detalles requeridos de contacto.
   - En la sección de **Permisos (Scopes)**, añade el scope: `.../auth/drive.readonly` (para que la app sólo pueda leer tus archivos y nada más).
   - En **Usuarios de prueba** (Test users), añade tu propia dirección de correo de Google.
5. Ve a la sección de **Credenciales**:
   - Haz clic en **+ Crear Credenciales** y selecciona **ID de cliente de OAuth** (OAuth Client ID).
   - Tipo de aplicación: **Aplicación Web**.
   - **Orígenes autorizados de JavaScript**: Añade `http://localhost:5173` (desarrollo local) y el dominio de tu GitHub Pages (`https://<tu-usuario>.github.io`).
   - Haz clic en Guardar y copia el **ID de cliente** generado.

### Paso 2: Obtener el ID de tu Carpeta de Música
1. Ve a tu Google Drive y crea una carpeta (por ejemplo, "Mi Música").
2. Sube tus archivos de audio (MP3, WAV, OGG, etc.) a ella.
3. Entra a la carpeta y mira la URL en tu navegador:
   `https://drive.google.com/drive/folders/1A2B3C4D5E6F7G8H9I0J...`
4. Copia la cadena larga de caracteres al final (ese es tu **Folder ID**).

### Paso 3: Conectar la App
1. Abre tu app MusicXpress (local o en GitHub).
2. Ve a la pestaña **Ajustes** en la barra lateral.
3. Pega tu **ID de Cliente de Google** y el **ID de tu Carpeta**.
4. Haz clic en **Guardar Configuración**.
5. Haz clic en **Iniciar Sesión con Google** y concede los permisos. ¡Listo! Tus canciones se cargarán y reproducirán al instante.

---

## 📦 Cómo Subir tu Aplicación a GitHub Pages

Para publicar tu reproductor de música de forma gratuita en GitHub:

1. Crea un repositorio público en GitHub llamado `MusicXpress`.
2. Conecta tu proyecto local a tu repositorio de GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/TU_USUARIO/MusicXpress.git
   ```
3. Ejecuta el script de despliegue:
   ```bash
   npm run deploy
   ```
   *Este comando construirá la versión optimizada de producción (`dist`) y la subirá automáticamente a una rama llamada `gh-pages` usando la dependencia `gh-pages`.*

4. Ve a la configuración de tu repositorio en GitHub (Settings -> Pages) y asegúrate de que esté configurado para servir desde la rama `gh-pages`. ¡Tu app estará disponible públicamente en `https://TU_USUARIO.github.io/MusicXpress/`!
