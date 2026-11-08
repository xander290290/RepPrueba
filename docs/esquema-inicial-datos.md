# Esquema inicial de datos

## Alcance y estado

Este documento define un esquema inicial para las dos aplicaciones descritas
en la memoria: las colecciones MongoDB de la intranet y las tablas relacionales
de la web pública. Es un diseño de Fase 1, no una indicación de que todas las
entidades estén ya implementadas.

El esquema de la intranet refleja las colecciones y campos que usa actualmente
el backend. El esquema relacional de la web pública se aprobó como diseño
inicial de Fase 1 y se materializa en
`apps/web-publica/backend/database/001_initial_schema.sql`. La memoria exige
normalizar el modelo relacional, como mínimo, hasta 3FN.

## 1. Intranet — MongoDB

La base de datos configurada para la aplicación contiene estas colecciones:

### `users`

| Campo | Tipo orientativo | Reglas y uso |
|---|---|---|
| `_id` | string UUID | Identificador del usuario. |
| `name` | string | Nombre; obligatorio, máximo 100 caracteres. |
| `surname` | string | Apellidos; puede estar vacío, máximo 100 caracteres. |
| `email` | string | Correo normalizado a minúsculas; único. |
| `password_hash` | string | Hash Argon2; nunca guardar la contraseña en claro ni devolver este campo por la API. |
| `roles` | array de string | Nombres de roles asignados; cada nombre debe existir en `roles.name`. |
| `is_active` | boolean | Permite bloquear una cuenta sin eliminarla. |
| `created_at` | datetime UTC | Fecha de alta. |
| `updated_at` | datetime UTC | Última actualización. |

**Índices:** índice único en `email`.

### `roles`

| Campo | Tipo orientativo | Reglas y uso |
|---|---|---|
| `_id` | ObjectId | Identificador generado por MongoDB; no lo usa la API como identificador público. |
| `name` | string | Nombre único del rol, usado como referencia desde `users.roles`. |
| `description` | string | Descripción del perfil. |
| `permissions` | array de string | Códigos de permisos, por ejemplo `users.read` o `announcements.read`; `*` representa acceso total para `admin`. |

Los permisos se guardan actualmente como códigos dentro del documento de rol.
Aunque existe un tipo Python `PermissionDocument`, el backend no mantiene una
colección independiente `permissions`.

**Índices:** índice único recomendado para `name` (la inicialización actual
usa `upsert` por este campo).

### `sessions`

| Campo | Tipo orientativo | Reglas y uso |
|---|---|---|
| `_id` | string UUID | Identificador de sesión; se incluye en los tokens como identificador de sesión. |
| `user_id` | string UUID | Referencia lógica a `users._id`. |
| `refresh_jti` | string UUID | Identificador del refresh token vigente; se rota al renovar la sesión. No se guarda el token en bruto. |
| `revoked` | boolean | Indica si se revocó la sesión. |
| `expires_at` | datetime UTC | Caducidad de la sesión. |

**Índices:** TTL en `expires_at` (`expireAfterSeconds=0`). La limpieza TTL de
MongoDB es eventual. `user_id` referencia a `users._id` lógicamente; MongoDB
no impone una clave foránea.

### `audit_logs`

| Campo | Tipo orientativo | Reglas y uso |
|---|---|---|
| `_id` | ObjectId | Identificador generado por MongoDB. |
| `action` | string | Acción registrada, por ejemplo `auth.login` o `users.register`. |
| `outcome` | string | Resultado, actualmente `success` o `failure`. |
| `occurred_at` | datetime UTC | Momento del evento. |
| `actor_id` | string o null | Referencia lógica a `users._id`, cuando se conoce al actor. |
| `target_id` | string o null | Identificador interno del recurso afectado, cuando corresponde. |

**Índices:** índice en `occurred_at`. El backend registra actualmente
inicios de sesión correctos e incorrectos, cierre de sesión y altas de usuario.
No se registran contraseñas, tokens ni cuerpos de solicitud.

### Relaciones de la intranet

```text
users.roles[*]  ── referencia lógica ──> roles.name
sessions.user_id ── referencia lógica ──> users._id
audit_logs.actor_id ── referencia lógica ──> users._id
```

Las referencias son valores embebidos o identificadores, no relaciones
validadas automáticamente por MongoDB. La API debe validar los roles al crear
usuarios y aplicar los permisos en cada operación protegida.

## 2. Web pública — MySQL

El backend todavía no implementa endpoints de contenido. Las tablas siguientes
constituyen el esquema inicial aprobado según las entidades orientativas de la
memoria; se crean desde `001_initial_schema.sql` al inicializar un volumen
MySQL nuevo. Se usan claves primarias, claves foráneas y tablas puente para
mantener relaciones normalizadas.

### Navegación y contenido

#### `paginas`

| Campo | Tipo orientativo | Uso |
|---|---|---|
| `id` | BIGINT, PK | Identificador de la página/sección. |
| `padre_id` | BIGINT, FK nullable → `paginas.id` | Padre del elemento del menú; `NULL` para secciones raíz. |
| `slug` | VARCHAR(160), único | Segmento estable para la URL. |
| `titulo` | VARCHAR(200) | Texto del elemento de navegación. |
| `orden` | INT | Orden entre elementos con el mismo padre. |
| `tipo_contenido` | VARCHAR(40) | Tipo de contenido asociado; valores a acordar. |
| `visible` | BOOLEAN | Control de publicación en el menú. |

La autorreferencia `padre_id` representa la jerarquía sin duplicar la ruta
completa en cada fila.

#### `contenidos_paginas`

| Campo | Tipo orientativo | Uso |
|---|---|---|
| `id` | BIGINT, PK | Identificador del contenido. |
| `pagina_id` | BIGINT, FK única → `paginas.id` | Página a la que pertenece; relación 1:1 para el contenido editorial básico. |
| `titulo` | VARCHAR(200) | Título del contenido, separado del rótulo de navegación. |
| `resumen` | TEXT nullable | Introducción opcional. |
| `cuerpo` | MEDIUMTEXT | Contenido principal. |
| `actualizado_en` | DATETIME | Última actualización. |

La separación permite cambiar el menú sin mezclarlo con el contenido. En la
implementación actual de la web pública, el marcado de cada página se mantiene
en su archivo Astro y esta tabla no es consumida por la web. Noticias,
programas y otras entidades con atributos propios se mantienen en sus tablas
específicas.

### Documentos, programas y departamentos

#### `documentos`

| Campo | Tipo orientativo | Uso |
|---|---|---|
| `id` | BIGINT, PK | Identificador del documento descargable. |
| `nombre` | VARCHAR(200) | Nombre visible. |
| `categoria` | VARCHAR(40) | Por ejemplo institucional, familias o programa. |
| `ruta_archivo` | VARCHAR(500) | Ruta local relativa o identificador del archivo; no almacenar el binario en esta tabla. |
| `mime_type` | VARCHAR(100) | Tipo MIME. |
| `subido_en` | DATETIME | Fecha de alta. |

#### `pagina_documentos`

| Campo | Tipo orientativo | Uso |
|---|---|---|
| `pagina_id` | BIGINT, PK/FK → `paginas.id` | Página que enlaza el documento. |
| `documento_id` | BIGINT, PK/FK → `documentos.id` | Documento reutilizable. |
| `orden` | INT | Orden de presentación dentro de la página. |

#### `programas`

| Campo | Tipo orientativo | Uso |
|---|---|---|
| `id` | BIGINT, PK | Identificador del programa. |
| `nombre` | VARCHAR(200) | Nombre del plan o programa. |
| `categoria` | VARCHAR(100) | Categoría del programa. |
| `descripcion` | TEXT | Descripción. |
| `activo` | BOOLEAN | Estado de publicación/uso. |

#### `programa_documentos`

| Campo | Tipo orientativo | Uso |
|---|---|---|
| `programa_id` | BIGINT, PK/FK → `programas.id` | Programa relacionado. |
| `documento_id` | BIGINT, PK/FK → `documentos.id` | Documento adjunto reutilizable. |

#### `departamentos`

| Campo | Tipo orientativo | Uso |
|---|---|---|
| `id` | BIGINT, PK | Identificador del departamento. |
| `nombre` | VARCHAR(160), único | Nombre del departamento. |
| `descripcion` | TEXT nullable | Presentación del departamento. |

#### `departamento_programa`

| Campo | Tipo orientativo | Uso |
|---|---|---|
| `departamento_id` | BIGINT, PK/FK → `departamentos.id` | Departamento. |
| `programa_id` | BIGINT, PK/FK → `programas.id` | Programa. |

La clave primaria compuesta evita duplicar una misma asociación. Esta tabla
resuelve la relación N:M indicada en la memoria.

### Noticias, personas y oferta educativa

#### `noticias`

| Campo | Tipo orientativo | Uso |
|---|---|---|
| `id` | BIGINT, PK | Identificador de la noticia. |
| `titulo` | VARCHAR(200) | Título. |
| `resumen` | TEXT nullable | Resumen opcional. |
| `cuerpo` | MEDIUMTEXT | Texto completo. |
| `publicada_en` | DATETIME nullable | Fecha de publicación; `NULL` mientras sea borrador. |
| `estado` | VARCHAR(20) | Borrador o publicada; valores definitivos a acordar. |

#### `personas`

| Campo | Tipo orientativo | Uso |
|---|---|---|
| `id` | BIGINT, PK | Identificador. |
| `nombre` | VARCHAR(100) | Nombre visible. |
| `apellidos` | VARCHAR(150) | Apellidos. |
| `tipo` | VARCHAR(40) | Equipo directivo, claustro o consejo escolar, según la memoria. |
| `cargo` | VARCHAR(160) nullable | Cargo o función pública. |
| `orden` | INT | Orden de presentación. |

#### `ensenanzas`

| Campo | Tipo orientativo | Uso |
|---|---|---|
| `id` | BIGINT, PK | Identificador de la etapa/oferta. |
| `nombre` | VARCHAR(160) | Enseñanza o etapa educativa. |
| `descripcion` | TEXT nullable | Descripción. |
| `orden` | INT | Orden de presentación. |

#### `materias_optativas`

| Campo | Tipo orientativo | Uso |
|---|---|---|
| `id` | BIGINT, PK | Identificador de la materia. |
| `ensenanza_id` | BIGINT, FK → `ensenanzas.id` | Enseñanza a la que pertenece. |
| `nombre` | VARCHAR(160) | Nombre de la materia optativa. |
| `descripcion` | TEXT nullable | Descripción. |

### Configuración del centro y solicitudes

#### `configuracion_centro`

| Campo | Tipo orientativo | Uso |
|---|---|---|
| `clave` | VARCHAR(100), PK | Clave estable, por ejemplo `nombre` o `telefono`. |
| `valor` | TEXT | Valor público. |

La tabla almacena configuración simple del centro (nombre, localización,
contacto y redes sociales), sin repetir una columna por cada dato configurable.

#### `solicitudes_secretaria`

| Campo | Tipo orientativo | Uso |
|---|---|---|
| `id` | BIGINT, PK | Identificador de la solicitud. |
| `tipo` | VARCHAR(40) | Cita previa o trámite solicitado. |
| `nombre_solicitante` | VARCHAR(160) | Nombre facilitado por la persona solicitante. |
| `email` | VARCHAR(254) | Correo para responder. |
| `mensaje` | TEXT | Detalle de la solicitud. |
| `estado` | VARCHAR(30) | Estado del trámite; ciclo y valores deben acordarse. |
| `creada_en` | DATETIME | Fecha de recepción. |
| `actualizada_en` | DATETIME | Último cambio de estado o datos. |

Esta tabla puede contener datos personales. Antes de habilitar el formulario se
deben definir finalidad, información al solicitante, acceso, conservación y
borrado. No se propone guardar datos sensibles ni documentos identificativos
sin una necesidad aprobada.

## 3. Relaciones principales de la web pública

```text
paginas.padre_id                -> paginas.id
contenidos_paginas.pagina_id    -> paginas.id (único; relación 1:1)
pagina_documentos.pagina_id     -> paginas.id
pagina_documentos.documento_id -> documentos.id
programa_documentos.programa_id -> programas.id
programa_documentos.documento_id -> documentos.id
departamento_programa.departamento_id -> departamentos.id
departamento_programa.programa_id -> programas.id
materias_optativas.ensenanza_id -> ensenanzas.id
```

Las tablas puente usan claves primarias compuestas por los dos identificadores
relacionados. Las claves foráneas deben definirse con reglas de borrado
explícitas; no se recomienda borrar en cascada contenido editorial o documentos
sin decidir antes cómo preservar sus referencias.

## 4. Índices y restricciones iniciales aprobados para MySQL

- PK en el identificador de cada entidad y FK en todas las relaciones descritas.
- `UNIQUE` en `paginas.slug`, `departamentos.nombre` y `contenidos_paginas.pagina_id`.
- PK compuesta en `pagina_documentos`, `programa_documentos` y
  `departamento_programa`.
- Índices en `paginas.padre_id`, `materias_optativas.ensenanza_id`,
  `noticias.estado`, `noticias.publicada_en` y `solicitudes_secretaria.estado`.
- Usar restricciones `NOT NULL` en los campos obligatorios y longitudes acordes
  al contenido. Los valores permitidos para categorías, estados y tipos deben
  cerrarse al aprobar las reglas editoriales y de Secretaría.

## 5. Decisiones de módulos posteriores

El diseño inicial y la temporalización han sido aprobados por el equipo. Las
siguientes decisiones concretan reglas funcionales que deben cerrarse antes de
implementar los módulos correspondientes; no bloquean la creación del esquema
inicial:

1. Acordar los valores permitidos para categorías, tipos de contenido y estados
   editoriales y de Secretaría.
2. Definir quién puede consultar solicitudes de Secretaría y sus reglas de
   privacidad, conservación y borrado antes de habilitar ese formulario.
3. Determinar qué registros de personas se autorizan a publicar.

Las claves foráneas del esquema inicial restringen el borrado de registros
relacionados para preservar contenido y documentos. El SQL implementa las
tablas y restricciones descritas en este documento, pero no inserta contenido
ni habilita endpoints editoriales o de Secretaría.
