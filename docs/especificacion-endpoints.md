# Especificación propuesta de endpoints y separación de aplicaciones

## Objetivo

Definir la API base de la web pública del centro y de la intranet docente, separadas claramente para que cada aplicación tenga su propio backend, frontend y dependencias.

La web pública y la intranet no comparten autenticación ni lógica de negocio. Cada una debe tener interfaces definidas por separado y un dominio y permisos propios.

Esta especificación recoge contratos previstos, no implica que todos los
endpoints estén implementados. Actualmente solo está implementado el backend
de intranet descrito en su README. La web pública se desarrollará conforme al
stack oficial de la memoria (PHP sin framework y MySQL/MariaDB); sus contratos
no forman parte de la Fase 1 de intranet.

## Arquitectura general

```text
apps/
├─ web-publica/
│  ├─ frontend/
│  └─ backend/
├─ intranet/
│  ├─ frontend/
│  └─ backend/
└─ shared/
```

### Principio de separación

- Web pública: acceso libre, contenido informativo y público
- Intranet: acceso privado y autenticado, gestión docente y administrativa

## Base URL por aplicación

### Web pública

```text
/api/public/v1
```

### Intranet

```text
/api/intranet/v1
```

## Convenciones generales

- Todas las API responden en JSON.
- Los errores deben seguir un formato consistente:

```json
{
  "detail": "Mensaje descriptivo del error"
}
```

- Las respuestas exitosas adoptan códigos HTTP estándar.
- La web pública no requiere autenticación.
- La intranet requiere JWT para los endpoints protegidos.

## 1. Web pública

Las rutas de esta sección son propuestas para la futura API PHP. La memoria
define las entidades y secciones del sitio, pero no fija estos paths concretos.
Además de noticias y documentos, la API deberá contemplar la navegación y los
contenidos asociados a secciones, departamentos, programas, personas,
enseñanzas/materias optativas, configuración del centro y solicitudes de
Secretaría. La ruta de eventos incluida abajo es una propuesta para exponer el
calendario escolar.

La gestión CRUD de noticias, documentos y programas corresponde al backoffice
previsto en la memoria. Su autenticación y permisos deben definirse al diseñar
ese módulo; no se presuponen en esta especificación.

### 1.1 Obtener noticias

#### GET `/api/public/v1/news`

Devuelve una lista de noticias públicas.

**Respuesta exitosa (200 OK)**

```json
[
  {
    "id": "news-001",
    "title": "Inauguración del curso 2026/2027",
    "summary": "Resumen de la apertura del curso.",
    "published_at": "2026-09-15T10:00:00Z",
    "image_url": "https://example.com/image.jpg"
  }
]
```

**Errores**
- 500 Internal Server Error: error del servidor

---

### 1.2 Obtener una noticia concreta

#### GET `/api/public/v1/news/{id}`

Devuelve el contenido de una noticia concreta.

**Respuesta exitosa (200 OK)**

```json
{
  "id": "news-001",
  "title": "Inauguración del curso 2026/2027",
  "content": "Texto completo de la noticia.",
  "published_at": "2026-09-15T10:00:00Z",
  "author": "Dirección del centro"
}
```

**Errores**
- 404 Not Found: noticia no encontrada

---

### 1.3 Obtener eventos

#### GET `/api/public/v1/events`

Devuelve la agenda pública del centro.

**Respuesta exitosa (200 OK)**

```json
[
  {
    "id": "evt-001",
    "title": "Jornada de puertas abiertas",
    "date": "2026-10-12",
    "location": "Patio principal"
  }
]
```

---

### 1.4 Obtener documentos públicos

#### GET `/api/public/v1/documents`

Devuelve documentos accesibles para toda la comunidad.

**Respuesta exitosa (200 OK)**

```json
[
  {
    "id": "doc-001",
    "name": "Horario general",
    "type": "pdf",
    "url": "https://example.com/files/horario.pdf"
  }
]
```

### Recursos públicos que deben detallarse al diseñar su implementación

Los siguientes contratos quedan pendientes de diseño detallado e
implementación:

- `GET /api/public/v1/pages`: navegación jerárquica y páginas/secciones.
- `GET /api/public/v1/departments`: departamentos, con relación a programas.
- `GET /api/public/v1/programs`: programas y su categoría.
- `GET /api/public/v1/people`: personas por tipo (equipo directivo, claustro,
  consejo escolar).
- `GET /api/public/v1/education`: enseñanzas y materias optativas.
- `GET /api/public/v1/center-config`: datos públicos de configuración del
  centro.
- `POST /api/public/v1/secretariat/requests`: solicitudes de cita previa o
  trámites, con validación y estados por definir.

---

## 2. Intranet

### 2.1 Login

#### POST `/api/intranet/v1/auth/login`

Autentica a un usuario y devuelve un access token y un refresh token.

**Request body**

```json
{
  "email": "profesor@centro.es",
  "password": "Password123!"
}
```

**Respuesta exitosa (200 OK)**

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 1800
}
```

**Errores**
- 401 Unauthorized: credenciales incorrectas
- 422 Unprocessable Entity: datos inválidos

---

### 2.2 Refresh token

#### POST `/api/intranet/v1/auth/refresh`

Renueva la sesión con un refresh token válido. El refresh token anterior queda invalidado y la respuesta incluye el nuevo refresh token; el cliente debe sustituir ambos tokens.

**Request body**

```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Respuesta exitosa (200 OK)**

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 1800
}
```

**Errores**
- 401 Unauthorized: token inválido o expirado

---

### 2.3 Logout

#### POST `/api/intranet/v1/auth/logout`

Revoca la sesión autenticada. Los access y refresh tokens de esa sesión dejan de ser válidos.

**Headers**

```http
Authorization: Bearer <access_token>
```

**Respuesta exitosa (200 OK)**

```json
{
  "message": "Sesión cerrada correctamente"
}
```

**Errores**
- 401 Unauthorized: no autenticado

---

### 2.4 Registro de usuario

#### POST `/api/intranet/v1/users/register`

Crea un usuario del sistema interno. Requiere un JWT válido con el permiso `users.write` (asignado al rol `admin` por defecto); no hay registro público.

**Headers**

```http
Authorization: Bearer <access_token>
```

**Request body**

```json
{
  "name": "Ana",
  "surname": "García",
  "email": "ana.garcia@centro.es",
  "password": "Password123!",
  "role": "profesor"
}
```

**Respuesta exitosa (201 Created)**

```json
{
  "id": "64a1c3d2e42d9f8b7a5f2d13",
  "name": "Ana",
  "surname": "García",
  "email": "ana.garcia@centro.es",
  "roles": ["profesor"],
  "created_at": "2026-11-07T00:00:00Z"
}
```

**Errores**
- 409 Conflict: usuario ya existente
- 401 Unauthorized: no autenticado
- 403 Forbidden: sin permiso `users.write`
- 422 Unprocessable Entity: validación fallida

---

### 2.5 Obtener usuario autenticado

#### GET `/api/intranet/v1/users/me`

Devuelve la información del usuario autenticado.

**Headers**

```http
Authorization: Bearer <access_token>
```

**Respuesta exitosa (200 OK)**

```json
{
  "id": "64a1c3d2e42d9f8b7a5f2d13",
  "name": "Ana",
  "surname": "García",
  "email": "ana.garcia@centro.es",
  "roles": ["profesor"]
}
```

**Errores**
- 401 Unauthorized: token no válido

---

### 2.6 Listar usuarios

#### GET `/api/intranet/v1/users`

Lista los usuarios accesibles según el rol del autenticado. Requiere el permiso `users.read`.

**Headers**

```http
Authorization: Bearer <access_token>
```

**Respuesta exitosa (200 OK)**

```json
[
  {
    "id": "64a1c3d2e42d9f8b7a5f2d13",
    "name": "Ana",
    "surname": "García",
    "email": "ana.garcia@centro.es",
    "roles": ["profesor"]
  }
]
```

**Errores**
- 403 Forbidden: permisos insuficientes

---

### 2.7 Obtener roles

#### GET `/api/intranet/v1/roles`

Devuelve los roles disponibles en la intranet.

**Headers**

```http
Authorization: Bearer <access_token>
```

**Respuesta exitosa (200 OK)**

```json
[
  {"name": "admin", "description": "Acceso total al sistema"},
  {"name": "profesor", "description": "Acceso estándar del profesorado"}
]
```

**Errores**
- 403 Forbidden: permisos insuficientes

---

### 2.8 Permisos de un rol

#### GET `/api/intranet/v1/roles/{role_name}/permissions`

Devuelve los permisos asociados a un rol concreto.

**Respuesta exitosa (200 OK)**

```json
[
  "users.read",
  "users.write",
  "announcements.read"
]
```

**Errores**
- 404 Not Found: rol inexistente
- 403 Forbidden: permisos insuficientes

---

## Modelo de datos mínimo recomendado

El modelo de la web pública debe ser relacional (MySQL o MariaDB) y respetar la
normalización mínima en 3FN. La tabla de páginas/secciones debe mantener la
jerarquía del menú mediante `padre_id` y estar separada de las tablas de
contenido. La memoria propone estas entidades orientativas:

- `paginas` / `secciones`: árbol de navegación y tipo de contenido asociado.
- `documentos`: entidad reutilizable para documentos institucionales,
  familiares y de programas.
- `departamentos` y `programas`, con relación N:M.
- `noticias`.
- `personas`, diferenciadas por tipo.
- `ensenanzas` y `materias_optativas`.
- `configuracion_centro`, como tabla clave-valor.
- `solicitudes_secretaria`, para citas y trámites.

Los campos, claves foráneas e índices concretos se deben especificar en el
esquema inicial antes de implementar el backend público.

### Intranet - usuario

```json
{
  "_id": "UUID en formato string",
  "name": "string",
  "surname": "string",
  "email": "string",
  "password_hash": "string",
  "roles": ["string"],
  "is_active": true,
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

### Intranet - rol

```json
{
  "name": "string",
  "description": "string",
  "permissions": ["string"]
}
```

Además, la implementación de intranet usa:

- `sessions`: usuario, refresh token vigente identificado por `jti`, estado de
  revocación y fecha de expiración.
- `audit_logs`: acción, resultado, fecha UTC e identificadores internos
  opcionales del actor y del usuario objetivo. Actualmente registra login,
  logout y alta de usuario.

## Seguridad y control de acceso

### Web pública

- sin token requerido
- validación de entrada de formularios
- contenido público y seguro por defecto

### Intranet

La API debe proteger las rutas con dependencias de autenticación y permisos. Ejemplo:

```python
@app.get("/api/intranet/v1/users/me")
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user
```

Y con permisos:

```python
@app.get("/api/intranet/v1/users")
async def list_users(current_user: User = Depends(require_permission("users.read"))):
    return get_users()
```

Esto garantiza que:

- el usuario debe estar autenticado
- debe tener el rol requerido
- la lógica de permisos está centralizada

## Criterios de Fase 1 según la memoria oficial

La Fase 1 —Cimientos— se centra en:

- documentar el esquema de datos inicial
- completar la temporalización del proyecto
- implementar autenticación básica en la intranet
- implementar el núcleo mínimo de roles y permisos

La web pública funcional y los contratos propuestos en la sección 1 son parte
del proyecto global, pero no se deben presentar como entregables de esta fase.
Los endpoints de intranet enumerados arriba sí reflejan la implementación
actual; los de la web pública todavía no están implementados.

## Observaciones

Esta especificación deja claro que la web pública y la intranet son dos proyectos distintos con objetivos, flujos y permisos diferentes. El modelo de trabajo se basa en separar el contenido público del centro de la gestión privada del profesorado y del equipo directivo.
