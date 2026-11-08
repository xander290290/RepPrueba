# Creación y ejecución del backend público

Este documento describe cómo se preparó el backend inicial de la web pública
y cómo ejecutar sus comprobaciones y servicios en Windows con PowerShell. El
backend usa PHP sin framework, Apache, PDO MySQL y MySQL 8.4 en Docker Compose.
La API sirve la navegación, las noticias publicadas y los programas activos
para el frontend Astro Node, que renderiza cada petición. El HTML de las
páginas informativas se mantiene en archivos Astro del frontend. Todavía no
hay rutas públicas de escritura ni backoffice.

## Estructura creada

- `Dockerfile`: parte de `php:8.5-apache`, activa `pdo_mysql` y `rewrite`, y
  coloca el código privado fuera del document root.
- `compose.yaml`: define Astro Node, la API PHP y MySQL 8.4, la red interna, el
  volumen persistente, los estados de salud y la carga inicial de esquema y
  páginas.
- `.env.example`: plantilla de las variables de conexión. El archivo `.env`
  con credenciales locales se genera en cada equipo y no se versiona.
- `public/index.php` y `public/.htaccess`: punto de entrada HTTP y reescritura
  de rutas.
- `app/routes/api.php`: endpoints de salud, navegación, noticias y programas.
- `app/repositories/public_content_repository.php`: consultas de lectura con
  PDO y parámetros.
- `app/database/connection.php`: conexión PDO, validación de configuración,
  errores explícitos y consultas preparadas nativas.
- `database/001_initial_schema.sql`: creación de las 14 tablas del esquema
  inicial aprobado.
- `database/002_seed_public_pages.sql`: elementos iniciales del menú del sitio.
- `tests/health_test.php`: casos automatizados de las rutas y errores.
- `.dockerignore`: excluye del contexto de construcción los archivos locales,
  pruebas y configuraciones de Compose.

## Cómo se preparó

1. Se mantuvo la arquitectura sin framework PHP y se separó el código
   interno (`app/`) de la entrada expuesta por Apache (`public/`).
2. Se añadió la conexión PDO, obteniendo host, puerto, base de datos y usuario
   desde variables de entorno. La contraseña nunca se escribe en el código.
3. Se implementaron las dos rutas de salud para verificar, por separado, que
   responde la API y que esta puede ejecutar `SELECT 1` contra MySQL. La ruta
   de base de datos devuelve `503` si la conexión falla y no expone detalles
   internos en su respuesta.
4. Tras la aprobación del esquema del equipo, se materializaron sus tablas en
   `database/001_initial_schema.sql` y el menú inicial en
   `database/002_seed_public_pages.sql`. MySQL ejecuta ambos archivos
   automáticamente solo al inicializar un volumen de datos vacío.
5. Se añadieron pruebas de rutas y errores, y se configuró Astro para consultar
   desde MySQL la navegación, las noticias y los programas. Las páginas
   informativas se escriben directamente en archivos Astro.

## Requisitos

- Windows y PowerShell.
- Docker Desktop instalado y en ejecución, con Docker Compose.
- PHP CLI para ejecutar las comprobaciones locales opcionales.

## Configuración y arranque con Docker

Desde la raíz del repositorio:

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
```

El bloque crea contraseñas aleatorias solo si aún no existe `.env`; no
sustituyas un archivo existente si quieres conservar las credenciales de una
instalación anterior. Comprueba la configuración e inicia los contenedores:

```powershell
docker compose config --quiet
docker compose up --build -d
docker compose ps
```

Compose construye la API y el frontend Astro Node, y arranca MySQL. La API se
publica en `127.0.0.1:8080`, el sitio en `127.0.0.1:4321`; MySQL no publica su
puerto al equipo anfitrión. En un volumen `mysql_data` nuevo, MySQL crea la
base, las tablas y los elementos iniciales del menú.

Comprueba ambas rutas:

```powershell
Invoke-RestMethod http://127.0.0.1:8080/api/public/v1/health
Invoke-RestMethod http://127.0.0.1:8080/api/public/v1/health/database
Invoke-RestMethod http://127.0.0.1:8080/api/public/v1/pages
Invoke-RestMethod http://127.0.0.1:8080/api/public/v1/news
Invoke-RestMethod http://127.0.0.1:8080/api/public/v1/programs
```

La página se sirve desde `http://127.0.0.1:4321/`. La primera ruta responde
con el estado del servicio PHP; las demás leen contenido desde MySQL. Si algo
falla, consulta los registros:

```powershell
docker compose logs api
docker compose logs database
docker compose logs frontend
```

Para detener los contenedores, conservando el volumen y sus datos:

```powershell
docker compose down
```

La inicialización SQL no vuelve a ejecutarse en un volumen ya existente. En
esta instalación se aplicó manualmente el seed del menú porque el volumen se
había creado antes de añadirlo. Los cambios posteriores del esquema deben
aplicarse mediante una migración explícita; no borres un volumen que contenga
datos para forzar la inicialización.

Para crear una página informativa con HTML, CSS y JavaScript propios, sigue
[`../docs/crear-pagina-personalizada.md`](../docs/crear-pagina-personalizada.md).

## Comprobaciones PHP sin Docker

Desde la raíz del repositorio se puede revisar la sintaxis y ejecutar los
casos de ruta:

```powershell
php -l .\apps\web-publica\backend\public\index.php
php -l .\apps\web-publica\backend\app\routes\api.php
php -l .\apps\web-publica\backend\app\database\connection.php
php -l .\apps\web-publica\backend\tests\health_test.php
php .\apps\web-publica\backend\tests\health_test.php
```

La suite no necesita MySQL: el caso de disponibilidad comprueba la respuesta
`503` cuando falta la configuración de base de datos.

Para probar la API de salud sobre HTTP con el servidor de desarrollo de PHP:

```powershell
Set-Location .\apps\web-publica\backend\public
php -S 127.0.0.1:8098 .\index.php
```

En otra terminal, consulta `http://127.0.0.1:8098/api/public/v1/health`.
Este servidor local no sustituye la comprobación de PDO/MySQL. Deténlo con
`Ctrl+C`.

## Estado y alcance

La configuración de Compose, la sintaxis PHP, los casos de ruta, la conexión
PDO/MySQL y las respuestas de la API se comprueban con los contenedores
activos.

Las operaciones de escritura y el backoffice siguen pendientes; no se exponen
rutas públicas que permitan modificar contenido sin autenticación editorial.
