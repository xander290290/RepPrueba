# Desarrollo del frontend y relación con el backend

## Qué se ha creado

Este frontend es una aplicación independiente para la intranet docente,
construida con React, TypeScript y Vite. Incluye:

- Una pantalla de acceso conectada al backend y una zona privada autenticada.
- Gestión inicial de usuarios y consulta de roles/permisos.
- Navegación lateral en escritorio y barra inferior en móvil.
- Secciones informativas para los módulos que se implementarán en fases posteriores.
- Estilos globales en `src\index.css` y estilos de las pantallas en
  `src\App.css`.
- Un manifiesto PWA y un Service Worker generado por `vite-plugin-pwa`.
- Iconos PWA en `public\pwa-192x192.png` y `public\pwa-512x512.png`.
- La plantilla de configuración local `.env.example`.
- Archivos `contenido.txt` en las carpetas para explicar su finalidad.

Los módulos que aún no tienen endpoints se identifican expresamente como
pendientes y no simulan operaciones.

## Cómo se preparó

La carpeta del frontend ya contenía `contenido.txt`, por lo que el generador de
Vite no podía crear directamente la plantilla en esa carpeta no vacía. Se usó
un directorio temporal dentro del frontend para generar la plantilla oficial
React + TypeScript; después se copiaron sus archivos a la carpeta definitiva,
conservando los `contenido.txt` existentes, y se retiró el directorio
temporal.

Los comandos principales utilizados fueron:

```powershell
npm create vite@latest apps/intranet/frontend -- --template react-ts
```

El comando anterior no pudo escribir sobre la carpeta existente. En una
carpeta vacía, esa es la forma directa de generar la plantilla. Para una
carpeta que ya contiene documentación, se generó la plantilla en un directorio
temporal y se copiaron sus archivos sin reemplazar los inventarios.

Se añadió la integración PWA y después se sincronizaron las dependencias y el
archivo de bloqueo:

```powershell
Set-Location apps\intranet\frontend
npm install -D vite-plugin-pwa
npm install
```

La configuración del plugin está en `vite.config.ts`: crea el manifiesto y el
Service Worker, configura la actualización automática y precarga los recursos
estáticos del build. No se configura almacenamiento en caché de respuestas de
la API.

También se sustituyó el contenido de demostración de Vite por las pantallas de
acceso y de intranet, se adaptó `index.html`, se registró el Service Worker
desde `src\main.tsx` y se añadieron los iconos de instalación.

## Comandos de uso

Ejecutar desde `apps\intranet\frontend`:

```powershell
npm ci
if (-not (Test-Path .env)) { Copy-Item .env.example .env }
npm run dev
```

Vite imprime en la consola la dirección local donde abrir la aplicación. Para
comprobar y generar la versión de producción:

```powershell
npm run check
npm run lint
npm run build
npm run preview
```

`npm run build` ejecuta la comprobación de TypeScript y después Vite genera los
archivos en `dist\`, incluidos el manifiesto PWA y el Service Worker.

## Cómo se relaciona con el backend

El backend de la intranet es independiente y está en
`apps\intranet\backend`. Está desarrollado con FastAPI y MongoDB. FastAPI
registra sus rutas con el prefijo `/api/intranet/v1`; el frontend se comunica
con esa API mediante peticiones HTTP desde el navegador. El frontend no se
conecta directamente a MongoDB: las reglas de negocio, autenticación,
permisos y acceso a los datos corresponden al backend.

La plantilla `.env.example` contiene:

```dotenv
VITE_API_BASE_URL=/api/intranet/v1
```

El cliente `src\lib\api.ts` lee esta variable y centraliza las peticiones y sus
errores. En desarrollo, Vite reenvía `/api` al backend en
`http://127.0.0.1:8000` usando el proxy de `vite.config.ts`.

Entre las rutas ya disponibles en FastAPI están:

| Uso | Método y ruta |
|---|---|
| Iniciar sesión | `POST /auth/login` |
| Renovar tokens | `POST /auth/refresh` |
| Cerrar sesión | `POST /auth/logout` |
| Consultar usuario autenticado | `GET /users/me` |
| Consultar roles | `GET /roles` |
| Consultar permisos de un rol | `GET /roles/{role_name}/permissions` |

El formulario usa `POST /auth/login` y `GET /users/me`; la zona privada usa
`POST /auth/logout`, `GET /users`, `POST /users/register`, `GET /roles` y
`GET /roles/{role_name}/permissions`. Las rutas protegidas validan el token y
los permisos en FastAPI; ocultar opciones en la interfaz no sustituye esa
validación del servidor.

El access token permanece solo en memoria: no se persiste el refresh token ni
se guardan respuestas privadas en la caché PWA. Al recargar se vuelve a pedir
el inicio de sesión. El flujo de renovación y el almacenamiento definitivo de
credenciales quedan por definir antes de producción.

En producción habrá que establecer un proxy inverso a la API o permitir el
origen desplegado mediante CORS.

El backend puede iniciarse por separado desde `apps\intranet\backend`, con su
entorno virtual y sus variables configuradas:

```powershell
.\.venv\Scripts\Activate.ps1
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

La API requiere que MongoDB y la configuración del backend estén disponibles.
El frontend no levanta ni configura esos servicios; la coordinación mediante
Docker Compose propio para la intranet se abordará en un paso posterior. La
web pública también permanece independiente: no comparte API, base de datos
ni autenticación con esta aplicación.
