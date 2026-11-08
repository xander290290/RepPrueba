# Frontend de la intranet

Aplicación independiente de la intranet docente, creada con React, TypeScript
y Vite. Incluye una pantalla de acceso conectada al backend, un panel privado
adaptable y gestión inicial de usuarios y roles. Los módulos de fases
posteriores se identifican como pendientes hasta que tengan su API.

## Requisitos

- Node.js 22.12 o posterior.
- npm.
- Python y MongoDB para ejecutar también el backend.

## Poner en marcha la intranet en desarrollo

La intranet se compone de servicios independientes: MongoDB, la API FastAPI
y este frontend. MongoDB y la API deben estar disponibles para probar los
endpoints del backend. La carpeta del backend incluye una plantilla
`apps\intranet\backend\.env.example`; copia esa plantilla a `.env` y configura
sus valores, incluida una clave `SECRET_KEY` segura de al menos 32 caracteres
y la dirección real de MongoDB. Si ya existe un `.env`, conserva su
configuración en lugar de sobrescribirlo. No compartas ni subas ese archivo.

### 1. Iniciar MongoDB

Inicia la instancia MongoDB configurada en
`apps\intranet\backend\.env` (la plantilla apunta a `localhost:27018`). Si usas
Docker, inicia el servicio/contenedor MongoDB que hayas configurado para la
intranet. No hay todavía un Docker Compose propio para toda la intranet.

### 2. Iniciar la API FastAPI

Abre una terminal en la raíz del proyecto y ejecuta:

```powershell
Set-Location apps\intranet\backend
.\.venv\Scripts\Activate.ps1
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

La API debe poder conectar con MongoDB durante el arranque. Cuando esté lista,
su documentación interactiva estará en <http://127.0.0.1:8000/docs> y su
prefijo versionado será
`http://127.0.0.1:8000/api/intranet/v1`.

Si todavía no existe el entorno virtual, créalo e instala las dependencias
antes de arrancar la API:

```powershell
py -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
```

### 3. Iniciar el frontend

Abre otra terminal en la raíz del proyecto:

```powershell
Set-Location apps\intranet\frontend
npm ci
if (-not (Test-Path .env)) { Copy-Item .env.example .env }
npm run dev
```

Abre en el navegador la dirección que Vite indique en la terminal
(normalmente <http://localhost:5173>). El servidor de desarrollo reenvía las
peticiones `/api` a `http://127.0.0.1:8000`, según `vite.config.ts`; así se
puede probar el login local sin configurar CORS en desarrollo.

## Estado actual de la conexión

El formulario usa `POST /auth/login` y `GET /users/me`; el panel incluye
`POST /auth/logout`, `GET /users`, `POST /users/register`, `GET /roles` y
`GET /roles/{role_name}/permissions`. FastAPI aplica la autorización en cada
operación y puede responder con errores 401/403 que se muestran en la
interfaz.

El access token se mantiene en memoria mientras la aplicación está abierta:
no se guarda el refresh token en `localStorage` ni en la caché PWA. Al
recargar la página hay que iniciar sesión de nuevo. La renovación automática
de sesión y el almacenamiento definitivo de credenciales deben acordarse
antes de producción.

La navegación de escritorio usa un menú lateral y en móvil una barra
inferior. Las pantallas para tablón, FEM, retrasos, guardias y otros módulos
se muestran como previstas, no como funciones implementadas: se completarán
con sus APIs y reglas de negocio en sus fases correspondientes. El proyecto
sigue separado de la web pública Astro/PHP/MySQL; para despliegue habrá que
definir el proxy o los orígenes permitidos por CORS.

## Comprobar y compilar

Desde `apps\intranet\frontend`:

```powershell
npm run check
npm run lint
npm run build
npm run preview
```

El build genera los archivos de producción en `dist\`, incluidos el manifiesto
PWA y el Service Worker. El Service Worker precarga los recursos estáticos
generados por Vite; no se ha configurado caché de respuestas API ni datos
privados.

La aplicación y sus dependencias son independientes de `apps\web-publica`.
Docker Compose propio para la intranet e integración de módulos adicionales
se abordarán en pasos posteriores.

Consulta `contenido.txt` en las carpetas para el inventario de su función y
los archivos previstos.
