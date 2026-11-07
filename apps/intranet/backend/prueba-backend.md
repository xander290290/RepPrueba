# Arranque del backend para realizar pruebas

Guia para preparar el entorno desde cero, instalar las dependencias, configurar MongoDB, arrancar la API y ejecutar las pruebas.

## Requisitos

- **Python 3.10 o superior**: ejecuta la aplicación y sus herramientas.
- **pip**: instala los paquetes Python declarados en `requirements.txt`.
- **MongoDB local**: almacena usuarios, roles, sesiones y auditoría cuando se ejecuta la API. Este proyecto se prepara y prueba localmente; no requiere MongoDB Atlas. MongoDB tampoco hace falta para las pruebas automatizadas, que usan una base simulada.
- **Navegador web**: solo hace falta para abrir y probar la documentación interactiva en `/docs`.
- **PowerShell**: permite copiar los comandos de esta guía en Windows. En otros sistemas, adapta los comandos al terminal correspondiente.

No se necesita instalar Node.js, `mongosh` ni otra herramienta adicional para arrancar este backend o ejecutar las pruebas. `mongosh` puede ser útil para inspeccionar MongoDB manualmente, pero es opcional.

## 1. Abrir la carpeta del backend

Desde PowerShell:

```powershell
Set-Location 'C:\Users\Xander\Desktop\Preba\apps\intranet\backend'
```

Si el proyecto está en otra ubicación, sustituye la ruta por la carpeta `apps\intranet\backend` de tu copia.

## 2. Crear y activar un entorno virtual

```powershell
py -m venv .venv
.\.venv\Scripts\Activate.ps1
```

Si PowerShell impide activar el entorno por la política de ejecución, puedes usar el intérprete del entorno sin activarlo:

```powershell
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
```

## 3. Instalar dependencias

Con el entorno virtual activado:

```powershell
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
```

Comprueba que las dependencias instaladas son compatibles entre sí:

```powershell
python -m pip check
```

Si todo está correcto, el comando muestra `No broken requirements found`.

### ¿Para qué se instala cada dependencia?

Todas estas dependencias se instalan con `python -m pip install -r requirements.txt`:

- **FastAPI** (`fastapi`): define la API HTTP, las rutas y la validación de solicitudes y respuestas.
- **Uvicorn** (`uvicorn[standard]`): servidor ASGI que ejecuta la aplicación para poder acceder a la API. Se usa al arrancarla en el paso 5; no es necesario para ejecutar las pruebas.
- **pydantic-settings**: carga la configuración desde variables de entorno y el archivo `.env`.
- **PyMongo** (`pymongo`): conecta la aplicación con MongoDB y permite consultar y guardar usuarios, roles y sesiones.
- **PyJWT**: crea y valida los tokens JWT de acceso y renovación.
- **pwdlib[argon2]**: crea y verifica hashes de contraseñas usando Argon2.
- **email-validator**: valida el formato de los correos usados en los esquemas de entrada.
- **HTTPX** (`httpx`): permite que el cliente de pruebas de FastAPI envíe solicitudes a la aplicación.
- **pytest**: descubre y ejecuta las pruebas automatizadas.
- **mongomock**: simula MongoDB durante las pruebas, sin conectarse a una base real.

FastAPI, PyMongo, PyJWT, pwdlib, pydantic-settings y email-validator son usados por el backend y también pueden intervenir en las pruebas. HTTPX, pytest y mongomock se usan para las pruebas; Uvicorn sirve para iniciar el servidor.

## 4. Configurar el entorno local

Crea `.env` a partir de la plantilla:

```powershell
Copy-Item .env.example .env
```

Genera un secreto JWT:

```powershell
python -c "import secrets; print(secrets.token_urlsafe(48))"
```

Edita `.env` y configura al menos:

```env
MONGO_URI=mongodb://localhost:27018
DATABASE_NAME=intranet
SECRET_KEY=pega_aqui_el_secreto_generado
```

En esta máquina el servicio local está configurado en el puerto `27018`, porque `27017` lo utiliza otra base de datos. En instalaciones donde el puerto predeterminado esté libre, usa `mongodb://localhost:27017`.

Para crear el primer administrador, configura también `INITIAL_ADMIN_EMAIL`, `INITIAL_ADMIN_NAME` e `INITIAL_ADMIN_PASSWORD`. La contraseña debe tener al menos 12 caracteres. El administrador solo se crea si la colección `users` está vacía. Tras crearlo, elimina esas tres variables de `.env`.

No publiques ni compartas el archivo `.env`; contiene secretos y datos de acceso.

## 5. Arrancar MongoDB y la API

La API se conecta al servicio local de MongoDB usando la URI de `MONGO_URI`.

Si MongoDB todavía no está instalado, desde PowerShell instálalo desde el origen oficial de winget:

```powershell
winget install --id MongoDB.Server --exact --source winget --accept-source-agreements --accept-package-agreements
```

La instalación crea el servicio de Windows `MongoDB` y puede solicitar permisos de administrador. Comprueba el estado del servicio:

```powershell
Get-Service MongoDB
```

MongoDB usa normalmente el puerto `27017`. Antes de iniciar el servicio, comprueba si ese puerto está libre:

```powershell
Test-NetConnection localhost -Port 27017
```

Si `TcpTestSucceeded` es `True`, hay un servicio escuchando en el puerto. Si es `False`, no se pudo conectar a un servicio en ese puerto. No detengas otros servicios que ocupen el puerto sin identificar a qué proyecto pertenecen. En este equipo, otro proyecto ocupa `27017`, así que el servicio MongoDB local está configurado en `27018`.

Si el puerto predeterminado está ocupado, edita como administrador el archivo de configuración `mongod.cfg` de tu instalación (en MongoDB 9 suele estar en `C:\Program Files\MongoDB\Server\9.0\bin\mongod.cfg`) y cambia `net.port` por un puerto libre antes de iniciar MongoDB. Después, inicia o reinicia el servicio:

```powershell
if ((Get-Service MongoDB).Status -eq 'Running') {
    Restart-Service MongoDB
} else {
    Start-Service MongoDB
}
```

Configura `MONGO_URI` en `.env` con el mismo puerto. En este equipo:

```env
MONGO_URI=mongodb://localhost:27018
```

```powershell
Test-NetConnection localhost -Port 27018
.\.venv\Scripts\python.exe -c "from pymongo import MongoClient; from app.core.config import get_settings; c=MongoClient(get_settings().mongo_uri, serverSelectionTimeoutMS=5000); print(c.admin.command('ping')); c.close()"
```

El primer comando debe indicar `TcpTestSucceeded : True` y el segundo mostrar una respuesta con `ok: 1.0`.

Arranca la API desde la carpeta del backend:

```powershell
.\.venv\Scripts\python.exe -m uvicorn app.main:app --reload
```

Al iniciar, la aplicación comprueba la conexión con MongoDB, crea índices y roles predeterminados y, si está configurado, el primer administrador. Si la conexión falla, revisa `MONGO_URI` y que MongoDB esté activo.

La documentación interactiva de FastAPI estará disponible en:

```text
http://127.0.0.1:8000/docs
```

El esquema OpenAPI estará disponible en:

```text
http://127.0.0.1:8000/openapi.json
```

Para detener el servidor, vuelve a la terminal donde está ejecutándose y pulsa `Ctrl+C`.
Para detener el servicio local de MongoDB cuando termines:

```powershell
Stop-Service MongoDB
```

## 6. Ejecutar las pruebas automatizadas

Desde la carpeta del backend, con el entorno virtual activado:

```powershell
.\.venv\Scripts\python.exe -m pytest
```

Las pruebas usan una base MongoDB simulada y separada mediante `mongomock`; no usan ni modifican la base local de desarrollo. Comprueban autenticación, renovación y revocación de tokens, permisos, usuarios, roles y auditoría.

Los archivos de pruebas están en `tests\`:

- `tests\test_auth.py`: login correcto e incorrecto, acceso protegido, renovación y revocación de sesión.
- `tests\test_users.py`: alta de usuario por un administrador y restricción de permisos para profesores.
- `tests\test_roles.py`: lectura de roles y permisos y respuesta para un rol inexistente.
- `tests\test_audit.py`: registro de login correcto e incorrecto, logout y alta de usuario; verifica que no se guarden correos, contraseñas ni tokens.
- `tests\conftest.py`: prepara la aplicación y los datos de prueba con MongoDB simulado.

La ejecución es correcta cuando pytest termina con código `0` y muestra que todos los tests han pasado. Con la salida breve (`-q`), el resultado esperado para la suite actual es similar a:

```text
.........                                                                [100%]
9 passed
```

El número de puntos y el tiempo pueden variar si cambia la suite. Pueden aparecer avisos de obsolescencia de dependencias; no son fallos si pytest termina con `9 passed` y sin `failed` ni `errors`.

Para una salida más breve:

```powershell
.\.venv\Scripts\python.exe -m pytest -q
```

### Comprobación de integración con MongoDB real

Las pruebas de pytest anteriores usan `mongomock`; no verifican una instancia real. Para probar el flujo HTTP contra MongoDB local, con el servicio de Windows iniciado y `.env` apuntando a él, ejecuta desde la carpeta del backend:

```powershell
.\.venv\Scripts\python.exe tests/smoke_mongodb.py
```

Este script es adicional porque la suite normal debe seguir siendo aislada y no depender de MongoDB instalado. No hace falta arrancar antes la API manualmente: el script inicia Uvicorn en un puerto libre, crea una base temporal con un administrador de prueba aleatorio, comprueba login, roles, creación de usuario, permisos, renovación, revocación y auditoría, y elimina esa base al terminar. Solo permite URI locales (`localhost` o `127.0.0.1`) para no crear ni borrar bases temporales en servidores remotos. No altera la base `DATABASE_NAME` normal de `.env`.

## Endpoints disponibles

- `POST /api/intranet/v1/auth/login`
- `POST /api/intranet/v1/auth/refresh`
- `POST /api/intranet/v1/auth/logout`
- `POST /api/intranet/v1/users/register`
- `GET /api/intranet/v1/users/me`
- `GET /api/intranet/v1/users`
- `GET /api/intranet/v1/roles`
- `GET /api/intranet/v1/roles/{role_name}/permissions`

El registro requiere autenticación y el permiso `users.write`; no está abierto al público.

## Seguridad

- Usa una `SECRET_KEY` única y aleatoria, distinta para cada entorno.
- No subas `.env` ni secretos al repositorio.
- Ejecuta la API localmente siguiendo este README; no la expongas a una red pública.
- No uses datos personales reales para las pruebas sin autorización y revisión de privacidad.

### Auditoría de acciones

La aplicación guarda eventos en la colección MongoDB `audit_logs` para inicios de sesión correctos e incorrectos, cierres de sesión y altas de usuarios. Cada evento registra la acción, el resultado y la fecha UTC; cuando se conoce, incluye el identificador interno del usuario que actuó y el del usuario creado. Los intentos de login fallidos no guardan correo ni identifican al usuario.

No se almacenan contraseñas, hashes, tokens ni contenido de solicitudes en estos eventos. La colección no tiene todavía una política automática de caducidad: antes de usar datos personales reales, el centro debe definir el plazo de conservación y quién puede consultar los registros, de acuerdo con su política de privacidad.

Para consultar el inventario de datos, los usos actuales, el acceso y las decisiones pendientes, véase [Privacidad y tratamiento de datos de la intranet](../docs/privacidad-datos.md). Es documentación técnica; no sustituye la política de privacidad ni una revisión legal del centro.
