# Especificación propuesta de endpoints y separación de aplicaciones

## Objetivo

Definir la API base de la web pública del centro y de la intranet docente, separadas claramente para que cada aplicación tenga su propio backend, frontend y dependencias.

La web pública y la intranet no comparten autenticación ni lógica de negocio. Cada una debe tener interfaces definidas por separado y un dominio y permisos propios.

Esta especificación recoge contratos previstos, no implica que todos los
endpoints estén implementados. Actualmente solo está implementado el backend
de intranet descrito en su README. La web pública se desarrollará conforme al
stack del proyecto (PHP sin framework y MySQL), conforme a la memoria; sus contratos
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
- Las respuestas de descarga de archivos son una excepción y devuelven el
  contenido binario con su `Content-Type`.
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

Los contratos de esta sección son una propuesta de API para el backend PHP,
basada en las entidades del esquema inicial y el mapa de secciones de la
memoria. La memoria establece el contenido y la arquitectura, pero no fija
paths ni formatos JSON concretos.

**Estado actual:** el frontend Astro se renderiza en servidor. La navegación,
las noticias y los programas se consultan desde esta API en cada petición; las
páginas informativas se implementan como archivos Astro independientes. Estos
endpoints leen MySQL; no hay una API pública de escritura ni un backoffice
todavía. En un volumen nuevo, Compose crea las tablas y carga las secciones
iniciales del menú.

La API pública solo expondrá contenido publicado y datos aprobados para
difusión pública. No compartirá base de datos, sesión ni autenticación con la
intranet. Los contratos de escritura para el backoffice se concretarán cuando
se definan autenticación, permisos y protección contra abuso.

### 1.0 Comprobaciones de salud

Estas rutas verifican que responde la API y que puede acceder a MySQL.

#### GET `/api/public/v1/health`

Comprueba que PHP/Apache y el enrutado de la API responden.

**Respuesta actual (200 OK)**

```json
{ "status": "ok", "service": "web-publica-api" }
```

#### GET `/api/public/v1/health/database`

Comprueba la conexión configurada con MySQL mediante `SELECT 1`.

- 200 OK: `{ "status": "ok", "database": "ok" }`
- 503 Service Unavailable: `{ "status": "error", "database": "unavailable" }`

Los detalles de conexión solo se escriben en el log del servidor; no se
devuelven al cliente.

Al implementar los filtros de publicación se respetarán los campos del
esquema inicial: `paginas.visible`, `programas.activo` y `noticias.estado`.
El esquema de `documentos` no tiene aún un campo de publicación, por lo que
antes de exponerlos se debe acordar si todos serán públicos o si se añadirá un
estado/indicador de publicación. Para `personas` también debe acordarse qué
registros y datos se autorizan a difundir.

### 1.1 Navegación jerárquica

#### GET `/api/public/v1/pages`

Devuelve las páginas visibles para construir el menú, ordenadas por `orden`.
Los elementos hijos se representan en `children`.

**Respuesta actual (200 OK)**

```json
[
  {
    "slug": "organizacion",
    "title": "Organización",
    "parent_slug": null,
    "order": 2,
    "children": [
      {
        "slug": "departamentos",
        "title": "Departamentos",
        "parent_slug": "organizacion",
        "order": 1,
        "children": []
      }
    ]
  }
]
```

El cuerpo HTML de cada página informativa y sus estilos se mantienen en su
archivo Astro correspondiente bajo `apps/web-publica/frontend/src/pages/`.
No existe una ruta API `/pages/{slug}`: el endpoint de páginas se utiliza
únicamente para generar el menú.

### 1.2 Noticias

#### GET `/api/public/v1/news`

Devuelve noticias publicadas, de más reciente a más antigua. Parámetros
opcionales: `limit` (1–100, por defecto 20) y `offset` (por defecto 0).

**Respuesta actual (200 OK)**

```json
{
  "items": [
    {
      "id": 12,
      "title": "Inauguración del curso",
      "summary": "Resumen de la noticia.",
      "published_at": "2026-09-15T10:00:00Z"
    }
  ],
  "limit": 20,
  "offset": 0,
  "total": 1
}
```

#### GET `/api/public/v1/news/{id}`

Devuelve una noticia publicada con su contenido completo.

**Respuesta propuesta (200 OK)**

```json
{
  "id": 12,
  "title": "Inauguración del curso",
  "summary": "Resumen de la noticia.",
  "body": "Texto completo de la noticia.",
  "published_at": "2026-09-15T10:00:00Z"
}
```

**Errores**
- 404 Not Found: noticia inexistente o no publicada.

El frontend sirve las noticias en `/noticias/` y sus detalles en
`/noticias/{id}/`. Solo incluye registros con estado `publicada` y fecha de
publicación no futura.

### 1.3 Documentos descargables

#### GET `/api/public/v1/documents`

Lista documentos públicos. Filtros opcionales: `category` (`institucional`,
`familias` o `programa`), `page_id` y `program_id`.

**Respuesta actual (200 OK)**

```json
[
  {
    "id": 31,
    "name": "Calendario escolar",
    "category": "institucional",
    "mime_type": "application/pdf",
    "download_url": "/api/public/v1/documents/31/download"
  }
]
```

#### GET `/api/public/v1/documents/{id}/download`

Entrega el archivo de un documento público. El servidor debe comprobar que el
documento existe y está publicado, devolver su tipo MIME y un nombre de
descarga seguro; la ruta física del archivo no se expondrá.

**Errores**
- 404 Not Found: documento inexistente o no publicado.

### 1.4 Programas y departamentos

#### GET `/api/public/v1/programs`

Lista programas activos, agrupables por categoría. Admite el filtro opcional
`category`.

**Respuesta propuesta (200 OK)**

```json
[
  {
    "id": 7,
    "name": "Erasmus+",
    "category": "Programas educativos",
    "description": "Descripción pública del programa."
  }
]
```

#### GET `/api/public/v1/programs/{id}`

Devuelve el detalle público de un programa activo, incluidos documentos
adjuntos y departamentos asociados. Si el recurso no está publicado,
responderá 404.

#### GET `/api/public/v1/departments`

Lista departamentos publicados y sus programas relacionados.

**Respuesta propuesta (200 OK)**

```json
[
  {
    "id": 4,
    "name": "Departamento de ejemplo",
    "description": "Presentación pública.",
    "programs": []
  }
]
```

### 1.5 Personas

#### GET `/api/public/v1/people`

Lista las personas cuya publicación haya sido autorizada. El parámetro
`type` es opcional y admite los tipos aprobados por el centro, como
`equipo_directivo`, `claustro` o `consejo_escolar`.

**Respuesta propuesta (200 OK)**

```json
[
  {
    "id": 3,
    "name": "Nombre público",
    "surname": "Apellidos",
    "type": "equipo_directivo",
    "position": "Cargo"
  }
]
```

Los datos personales no se expondrán por defecto; el centro deberá aprobar
qué campos y personas pueden publicarse.

### 1.6 Enseñanzas

#### GET `/api/public/v1/education`

Devuelve las enseñanzas publicadas y sus materias optativas.

**Respuesta propuesta (200 OK)**

```json
[
  {
    "id": 2,
    "name": "Bachillerato",
    "description": "Descripción de la enseñanza.",
    "subjects": [
      {
        "id": 8,
        "name": "Materia optativa",
        "description": null
      }
    ]
  }
]
```

### 1.7 Configuración pública del centro

#### GET `/api/public/v1/center-config`

Devuelve únicamente claves públicas aprobadas de `configuracion_centro`, como
nombre, localización, teléfono, correo de contacto y redes sociales. No
devolverá claves internas ni valores secretos.

**Respuesta propuesta (200 OK)**

```json
{
  "name": "IES Ramón Arcas Meca",
  "location": "Totana, Murcia",
  "phone": null,
  "email": null,
  "social_links": []
}
```

### 1.8 Calendario y eventos

#### GET `/api/public/v1/events`

Ruta propuesta para eventos o calendario escolar. La memoria incluye un
calendario escolar dentro de Organización, pero el esquema inicial no define
una entidad de eventos. Antes de implementar este endpoint se debe decidir si
se representará como contenido de página/documento o si se añadirá un modelo
de eventos con fechas, ubicación y estado de publicación.

### 1.9 Solicitudes de Secretaría

#### POST `/api/public/v1/secretariat/requests`

Recibe una petición de cita previa o trámite. Antes de habilitarlo hay que
aprobar finalidad, campos, información de privacidad, destinatarios,
conservación y borrado. No se expondrá un endpoint público para consultar o
listar solicitudes.

**Request body propuesto**

```json
{
  "type": "cita_previa",
  "name": "Nombre de la persona solicitante",
  "email": "persona@example.es",
  "message": "Motivo de la solicitud",
  "privacy_accepted": true
}
```

**Respuesta propuesta (201 Created)**

```json
{
  "id": 104,
  "status": "recibida",
  "created_at": "2026-11-08T10:00:00Z"
}
```

**Errores**
- 422 Unprocessable Entity: datos incompletos o inválidos.
- 429 Too Many Requests: límite de solicitudes excedido.
- 500 Internal Server Error: error inesperado; no debe incluir datos personales.

### 1.10 Backoffice editorial

La memoria requiere un backoffice con CRUD para noticias, documentos y
programas, pero no define su autenticación ni el modelo de usuarios
editoriales. Por tanto, las rutas de escritura (`POST`, `PUT`/`PATCH` y
`DELETE` para esos recursos) quedan deliberadamente sin fijar hasta acordar
autenticación, autorización, auditoría y gestión de archivos. No deben
publicarse como endpoints abiertos.

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

El modelo de la web pública es relacional (MySQL) y respeta la
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
actual; los endpoints de lectura de páginas, noticias y programas de la web
pública también están implementados. Los endpoints de escritura siguen
pendientes.

## Observaciones

Esta especificación deja claro que la web pública y la intranet son dos proyectos distintos con objetivos, flujos y permisos diferentes. El modelo de trabajo se basa en separar el contenido público del centro de la gestión privada del profesorado y del equipo directivo.
