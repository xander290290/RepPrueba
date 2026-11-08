# Arranque local de la web pública

La web pública usa Astro Node para renderizar en servidor, PHP sin framework
para la API y MySQL para la navegación, las noticias y los programas. Cada
página informativa está escrita en su propio archivo Astro. Los cambios de
código deben incluirse en la imagen del frontend para publicarse.

## Requisitos

- Windows con PowerShell.
- Docker Desktop instalado y en ejecución, con Docker Compose.
- Node.js 22.23.4 o posterior y npm para desarrollo local del frontend.

## Preparación inicial del backend

El backend PHP ya forma parte del repositorio y no se genera con un
scaffolder ni necesita Composer: la API usa PHP, Apache y PDO MySQL. Docker
construye la imagen de PHP con `pdo_mysql` y `rewrite`, y Compose inicia
MySQL junto con la API y Astro. En el primer arranque con un volumen vacío,
MySQL ejecuta los scripts SQL del backend para crear las tablas y cargar las
páginas iniciales.

Desde la raíz del repositorio, estos son los comandos de preparación y
construcción para levantar la pila por primera vez:

```powershell
Set-Location .\apps\web-publica\backend
if (-not (Test-Path .env)) {
  $appPassword = [guid]::NewGuid().ToString("N") + [guid]::NewGuid().ToString("N")
  $rootPassword = [guid]::NewGuid().ToString("N") + [guid]::NewGuid().ToString("N")
  @"
DB_NAME=web_publica_dev
DB_USER=web_publica
DB_PASSWORD=$appPassword
DB_ROOT_PASSWORD=$rootPassword
"@ | Set-Content -Encoding ascii .env
}
docker compose config --quiet
docker compose up --build -d
docker compose ps
```

El archivo `.env` se crea solo si no existe, para conservar credenciales de
instalaciones anteriores. No hace falta ejecutar a mano los archivos SQL ni
crear las tablas: Compose los monta en el contenedor MySQL para su
inicialización. El script de datos fija la conexión en `utf8mb4` para que
acentos y caracteres como `ñ` se almacenen correctamente aunque el cliente
MySQL de inicialización use otro juego de caracteres. En un volumen ya
existente, esos scripts no se vuelven a ejecutar.

## Arrancar la web completa con Docker

Desde la raíz del repositorio:

```powershell
Set-Location .\apps\web-publica\backend
docker compose up -d
docker compose ps
```

`docker compose up -d` inicia Astro, la API PHP y MySQL reutilizando las
imágenes ya construidas. Si cambias el backend o el frontend, ejecuta
`docker compose up --build -d` para reconstruirlas. Abre el sitio en
`http://127.0.0.1:4321/`. La API queda disponible en `http://127.0.0.1:8080`;
MySQL permanece en la red privada de Docker. En el primer arranque, crea el
`.env` siguiendo la sección anterior; después puedes reutilizarlo.

Comprueba que el sitio y los datos responden:

```powershell
Invoke-RestMethod http://127.0.0.1:8080/api/public/v1/health
Invoke-RestMethod http://127.0.0.1:8080/api/public/v1/health/database
Invoke-RestMethod http://127.0.0.1:8080/api/public/v1/pages
Invoke-RestMethod http://127.0.0.1:8080/api/public/v1/news
Invoke-RestMethod http://127.0.0.1:8080/api/public/v1/programs
```

Al crear el volumen `mysql_data` por primera vez, MySQL crea las tablas y carga
la portada y las secciones iniciales. La contraseña del archivo `.env` local
no se versiona. Para detener los servicios sin borrar los datos:

```powershell
docker compose down
```

El volumen conserva el contenido. El SQL de inicialización no se vuelve a
ejecutar sobre un volumen ya existente; los cambios de esquema requieren una
migración explícita. No borres el volumen para forzar una inicialización si
contiene datos que debas conservar.

## Ejecutar Astro en modo desarrollo

Arranca primero MySQL y la API desde `apps\web-publica\backend`:

```powershell
Set-Location .\apps\web-publica\backend
docker compose up -d database api
```

En otra terminal, inicia Astro. Se conecta a la API publicada en el equipo:

```powershell
Set-Location .\apps\web-publica\frontend
npm ci
$env:API_BASE_URL = "http://127.0.0.1:8080/api/public/v1"
npm run dev -- --host 127.0.0.1
```

Astro muestra la URL local, normalmente `http://127.0.0.1:4321/`. Detén el
servidor con `Ctrl+C`. `API_BASE_URL` es una variable de entorno del servidor;
no se expone al navegador.

El acceso a la intranet continúa siendo un enlace independiente, configurado
por `PUBLIC_INTRANET_URL` en el frontend. La web pública no comparte su sesión
ni su autenticación.

## Comprobar el frontend y el backend

Desde `apps\web-publica\frontend`, verifica tipos y compilación:

```powershell
npm run check
npm run build
```

El build genera un servidor Astro Node en `dist\`; no genera un sitio HTML
prerenderizado. Para revisar PHP y sus pruebas desde la raíz:

```powershell
php -l .\apps\web-publica\backend\public\index.php
php -l .\apps\web-publica\backend\app\routes\api.php
php -l .\apps\web-publica\backend\app\repositories\public_content_repository.php
php .\apps\web-publica\backend\tests\health_test.php
```

## Contenido dinámico disponible

- La navegación se lee de `paginas`; el HTML de cada página está en un archivo
  Astro de `frontend/src/pages/`.
- Noticias: solo registros publicados con fecha no futura.
- Programas: solo registros marcados como activos.

Para modificar una página, edita su archivo `.astro` (marcado y CSS; JavaScript
opcional) y ejecuta `docker compose up --build -d frontend` desde el backend
para incorporar el cambio a la imagen. Para añadir una página, crea su archivo
con el slug como nombre y añade su título, visibilidad y orden a la tabla
`paginas`, que determina si aparece en el menú.

Las operaciones editoriales para noticias y programas y el backoffice todavía
no están implementados. Evita exponer credenciales o habilitar escrituras
públicas sin autenticación y permisos editoriales.
