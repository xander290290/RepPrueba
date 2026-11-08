# Proyecto Intermodal DAW - Arquitectura separada de web pública e intranet

## Descripción

Este proyecto forma parte del Proyecto Intermodular de DAW del IES Ramón Arcas Meca y consiste en dos aplicaciones digitales independientes para el centro educativo:

1. una web pública e informativa del centro
2. una intranet privada de gestión docente

La diferencia fundamental es que cada una tiene su propia arquitectura y sus propias dependencias, aunque comparten el mismo contexto académico y el mismo objetivo de digitalizar servicios del centro.

La Fase 1, denominada "Cimientos" en la memoria técnica, cubre oficialmente el esquema de datos inicial, la temporalización completa, la autenticación básica de la intranet y su núcleo mínimo de roles y permisos. Para organizar el proyecto completo, esta temporalización también integra en la Fase 1 el arranque técnico de la web pública, aunque la memoria no lo enumera como entregable de esa fase. Ambos productos siguen siendo independientes.

## Objetivo de la fase 1

La primera entrega debe dejar definidos los cimientos de datos y planificación del proyecto y una base segura de acceso para la intranet, manteniendo separados ambos productos.

Los objetivos principales son:

- documentar el esquema inicial de datos de la intranet y de la web pública
- completar y validar la temporalización de todo el proyecto
- implementar autenticación básica en la intranet
- establecer el núcleo mínimo de roles y permisos
- mantener clara la separación entre la web pública y la intranet

## Enfoque arquitectónico

La solución se dividirá en dos bloques funcionalmente independientes:

### 1. Web pública del centro

- público y accesible sin autenticación
- orientada a familias, alumnado y comunidad educativa
- secciones definidas en la memoria: Inicio, Organización, Familias, Enseñanzas, Secretaría, Programas, Noticias y Contacto
- contenido institucional separado de la estructura jerárquica de navegación

Dependencias principales:
- frontend con TypeScript; el framework queda a elección del equipo
- backend en PHP sin framework, según la memoria
- base de datos relacional MySQL
- backoffice con CRUD para gestionar noticias, documentos y programas
- URLs amigables, `sitemap.xml` y revisión de accesibilidad WCAG
- sin acceso a datos internos de la intranet ni uso de su sesión o autenticación

### 2. Intranet de gestión docente

- privada, interna y protegida
- orientada a profesorado y equipo directivo
- requiere autenticación, roles y permisos
- almacena información operativa del centro

Dependencias principales:
- backend API REST con FastAPI
- autenticación JWT
- MongoDB como almacén principal; Redis es un complemento previsto para caché, sesiones o tareas en segundo plano, no un sustituto de MongoDB
- control con roles y permisos
- servicios e integraciones incorporados conforme a las fases del proyecto

## Stack técnico propuesto

### Web pública

#### Frontend
- Astro con TypeScript (decisión de implementación del equipo; la memoria deja el framework a elección)
- diseño responsive
- páginas renderizadas en servidor, con páginas, noticias y programas cargados desde PHP/MySQL
- acceso a la intranet mediante enlace configurable a su aplicación independiente; no comparte sesión ni autenticación

#### Backend y persistencia
- PHP sin framework (la memoria descarta Laravel)
- MySQL, con relaciones y claves foráneas
- backoffice CRUD para noticias, documentos y programas
- separación entre páginas/secciones y sus contenidos
- modelo relacional con normalización mínima en 3FN
- páginas/secciones con `padre_id`; documentos descargables reutilizables;
  relación N:M entre departamentos y programas

### Intranet

#### Backend
- Python
- FastAPI
- JWT (access/refresh)
- dependencias de seguridad con `Depends()`

#### Persistencia
- MongoDB como base principal; Redis se contempla como complemento en fases posteriores

#### Procesos y servicios previstos
- tareas de correo, generación de PDF y notificaciones mediante
  `BackgroundTasks`; Celery + Redis solo si el volumen lo justifica
- generación de PDF con WeasyPrint o ReportLab; Pillow para incorporar firmas
  manuscritas en los documentos cuando se implemente ese flujo
- Web Push con Service Worker y una librería como `pywebpush`
- mapas con Leaflet/OpenStreetMap y geocodificación Nominatim para FEM
- estos componentes corresponden a módulos posteriores, no a la Fase 1

#### Frontend
- framework moderno para aplicación privada
- autenticación e interfaz protegida
- diseño adaptable para escritorio y dispositivos móviles

### Integraciones previstas

Web pública:
- contenido institucional
- noticias, eventos y documentación pública
- mapas del centro

Intranet, según las fases de la memoria:
- Fase 2: IA para borradores de publicaciones en RRSS (además de los módulos funcionales indicados en la temporalización)
- Fase 3: generación de documentos y firma en los flujos previstos
- Fase 4: OAuth de Google, Google Calendar, notificaciones push y correo
- Otros servicios previstos: Nominatim/OpenStreetMap y AutoFirma, esta última como objetivo de mejor esfuerzo

## Estructura actual del proyecto

El árbol refleja todas las carpetas actuales e incluye los archivos
principales. Se omiten los `__init__.py` y `contenido.txt` repetidos en cada
paquete, así como `.venv`, `__pycache__` y `.pytest_cache`, que son contenido
local auxiliar o generado y no forman parte de la estructura fuente.

```text
Preba/
├─ apps/
│  ├─ contenido.txt
│  ├─ web-publica/
│  │  ├─ backend/
│  │  │  ├─ app/
│  │  │  │  ├─ config/
│  │  │  │  ├─ controllers/
│  │  │  │  ├─ database/
│  │  │  │  ├─ models/
│  │  │  │  ├─ repositories/
│  │  │  │  ├─ routes/
│  │  │  │  ├─ services/
│  │  │  │  └─ contenido.txt
│  │  │  ├─ database/
│  │  │  │  └─ contenido.txt
│  │  │  ├─ public/
│  │  │  │  └─ contenido.txt
│  │  │  ├─ tests/
│  │  │  │  └─ contenido.txt
│  │  │  └─ contenido.txt
│  │  ├─ docs/
│  │  │  └─ contenido.txt
│  │  └─ frontend/
│  │     ├─ public/
│  │     │  └─ contenido.txt
│  │     ├─ src/
│  │     │  ├─ components/
│  │     │  │  ├─ SiteFooter.astro
│  │     │  │  ├─ SiteHeader.astro
│  │     │  │  ├─ SiteLayout.astro
│  │     │  │  └─ contenido.txt
│  │     │  ├─ data/
│  │     │  │  ├─ sections.ts
│  │     │  │  └─ contenido.txt
│  │     │  ├─ pages/
│  │     │  │  ├─ [slug].astro
│  │     │  │  ├─ index.astro
│  │     │  │  └─ contenido.txt
│  │     │  ├─ services/
│  │     │  │  └─ contenido.txt
│  │     │  ├─ styles/
│  │     │  │  ├─ global.css
│  │     │  │  └─ contenido.txt
│  │     │  ├─ types/
│  │     │  │  └─ contenido.txt
│  │     │  ├─ env.d.ts
│  │     │  └─ contenido.txt
│  │     ├─ .env.example
│  │     ├─ astro.config.mjs
│  │     ├─ package.json
│  │     ├─ package-lock.json
│  │     ├─ tsconfig.json
│  │     ├─ README.md
│  │     └─ contenido.txt
│  └─ intranet/
│     ├─ backend/
│     │  ├─ app/
│     │  │  ├─ api/
│     │  │  │  ├─ auth.py
│     │  │  │  ├─ roles.py
│     │  │  │  └─ users.py
│     │  │  ├─ core/
│     │  │  │  ├─ config.py
│     │  │  │  └─ security.py
│     │  │  ├─ db/
│     │  │  │  ├─ init_db.py
│     │  │  │  └─ mongodb.py
│     │  │  ├─ models/
│     │  │  │  ├─ audit_log.py
│     │  │  │  ├─ permission.py
│     │  │  │  ├─ role.py
│     │  │  │  └─ user.py
│     │  │  ├─ schemas/
│     │  │  │  ├─ auth.py
│     │  │  │  ├─ role.py
│     │  │  │  └─ user.py
│     │  │  ├─ services/
│     │  │  │  ├─ audit_service.py
│     │  │  │  ├─ auth_service.py
│     │  │  │  ├─ role_service.py
│     │  │  │  └─ user_service.py
│     │  │  └─ main.py
│     │  ├─ tests/
│     │  │  ├─ conftest.py
│     │  │  ├─ smoke_mongodb.py
│     │  │  ├─ test_audit.py
│     │  │  ├─ test_auth.py
│     │  │  ├─ test_roles.py
│     │  │  └─ test_users.py
│     │  ├─ .env.example
│     │  ├─ .gitignore
│     │  ├─ guia-fastapi.txt
│     │  ├─ prueba-backend.md
│     │  └─ requirements.txt
│     ├─ docs/
│     │  ├─ contenido.txt
│     │  └─ privacidad-datos.md
│     └─ frontend/
│        └─ contenido.txt
├─ docs/
│  ├─ contenido.txt
│  ├─ especificacion-endpoints.md
│  └─ temporalizacion.md
├─ shared/
│  ├─ constants/
│  ├─ models/
│  └─ utils/
├─ .env.example
├─ Memoria_Tecnica_Proyecto_Intermodular_DAW.docx.pdf
└─ README.md
```

El frontend público usa Astro Node con TypeScript y carga el mapa de secciones,
las noticias y los programas desde la API PHP/MySQL en cada petición. El
backend PHP sin framework ofrece endpoints públicos de lectura y un entorno
local Docker Compose con MySQL. El frontend
de la intranet sigue siendo una estructura inicial. `shared/` también es una
estructura reservada. No existe todavía `docs/arquitectura-general.md`.

## Dependencias por aplicación

### Web pública

Debe depender de:
- frontend Astro con TypeScript
- backend PHP sin framework
- base de datos relacional MySQL
- backoffice CRUD para noticias, documentos y programas
- motor de rutas y renderizado para las páginas y el menú jerárquico

No debe depender directamente de:
- autenticación de usuarios internos
- roles de profesorado
- gestión de ausencias, guardias o incidencias internas

El frontend público renderiza dinámicamente páginas, navegación, noticias y
programas desde el backend. La API ofrece lectura; las herramientas de
escritura editorial y el backoffice siguen pendientes.

### Intranet

Debe depender de:
- backend con autenticación y permisos
- base de datos MongoDB
- Redis como complemento previsto para caché/sesiones/tareas, cuando se
  implementen esos módulos
- tareas en segundo plano para correo, documentos o notificaciones cuando
  correspondan a los módulos
- módulo de gestión docente y administrativa

No debe depender de:
- contenido público del centro como fuente de verdad del sistema interno
- lógica de presentación de la web pública

## Alcance de Fase 1 según la memoria oficial

La tabla de fases de la memoria técnica define el siguiente orden para la
intranet. Los módulos de cada fase son entregables oficiales; las semanas y
actividades de la web pública indicadas en la temporalización son una propuesta
de planificación del equipo, no fases ni fechas fijadas por la memoria.

| Fase oficial | Contenido que debe desarrollarse |
|---|---|
| **1 — Cimientos** | Esquema de datos inicial y temporalización completa del proyecto; autenticación básica; núcleo mínimo de roles y permisos. |
| **2 — Núcleo funcional** | Tablón de anuncios; seguimiento FEM; publicaciones RRSS como borrador con IA; gestión de retrasos; emplazamiento en el aula; capa completa de roles y permisos; primeros pasos (onboarding); incidencias RMI y/o gestión de compras, repartidos según la carga de trabajo. |
| **3 — Guardias y firma** | Guardias, incluyendo el flujo de ausencias y firma; aula de convivencia; comisiones de servicio con firma; el módulo de incidencias RMI o gestión de compras que haya quedado pendiente de la Fase 2. |
| **4 — Integraciones** | OAuth completo; integración con Google Calendar; notificaciones push y por email; documentación técnica final. |

La Fase 1 —Cimientos— tiene estos entregables:

- esquema de datos inicial
- temporalización completa del proyecto
- autenticación básica
- núcleo mínimo de roles y permisos

La memoria organiza estas cuatro fases para la intranet y no asigna la
construcción funcional de la web pública a una fase concreta. Para coordinar
el proyecto completo, la temporalización incorpora el arranque técnico de la
web pública dentro de la Fase 1 y planifica la continuación de sus contenidos
en las fases siguientes. Esto no cambia el alcance oficial de las fases de
intranet ni la separación entre aplicaciones.

El diseño inicial de datos de ambas aplicaciones está recogido en
[el documento de esquema](docs/esquema-inicial-datos.md) y ha sido aprobado por
el equipo. El backend público inicializa las tablas del modelo al crear un
volumen MySQL nuevo.

## Roles iniciales de la intranet

La memoria establece perfiles estándar para el profesorado, administrador y
perfiles definidos por competencias. La implementación actual usa:

- `admin`: acceso total al sistema
- `profesor`: acceso al uso estándar de la intranet
- `director`: perfil inicial de dirección y supervisión
- `staff`: perfil inicial de gestión general

Los perfiles específicos deben ampliarse o ajustarse según las competencias
que acuerde el centro.

## Requisitos de seguridad

### Web pública
- contenido accesible sin autenticación
- validación de formularios de contacto
- sanitización de contenido
- protección contra ataques comunes del front-end

### Intranet

La memoria establece como requisitos del sistema la autenticación OAuth de
Google y el alta manual o pendiente de aprobación, la auditoría consultable de
acciones relevantes, la gestión de consentimientos y derechos de acceso y
rectificación, y la trazabilidad de accesos a datos sensibles. La
implementación actual aún no cubre todos esos requisitos:

- La base actual de Fase 1 usa JWT y cuentas creadas manualmente por un
  administrador. OAuth completo se sitúa en Fase 4.
- La auditoría implementada registra login correcto/incorrecto, logout y alta
  de usuario; todavía no permite consultar los registros ni cubre todos los
  accesos a datos sensibles.
- La API aún no implementa flujos de consentimiento, acceso y rectificación.
- Las pruebas y configuración se preparan localmente con variables de entorno.

Este proyecto se ejecuta localmente siguiendo los pasos del README de cada
aplicación. No incluye configuración de publicación en Internet ni HTTPS para
un servidor remoto.

## Convención de endpoints

### Web pública

La web pública usará una API separada con estructura:

```text
/api/public/v1/{recurso}
```

Ejemplos:

```text
/api/public/v1/news
/api/public/v1/events
/api/public/v1/documents
```

### Intranet

La intranet usará una API separada con estructura:

```text
/api/intranet/v1/{recurso}
```

Ejemplos:

```text
/api/intranet/v1/auth/login
/api/intranet/v1/users/me
/api/intranet/v1/roles/
```

## Variables de entorno

Cada aplicación debe tener su propia configuración local y plantilla de
variables, sin compartir secretos ni bases de datos. El backend de intranet
usa [su plantilla `.env.example`](apps/intranet/backend/.env.example). El
backend público usa [su plantilla `.env.example`](apps/web-publica/backend/.env.example)
y Docker Compose. Las direcciones locales son:

```env
Web pública: frontend http://localhost:4321; backend http://127.0.0.1:8080
Intranet: backend http://127.0.0.1:8000
```

## Recomendación para la implementación

Se recomienda seguir las fases de la temporalización como un plan integrado:

1. iniciar en la Fase 1 los cimientos de la intranet y la base técnica de la web pública
2. avanzar los módulos de cada aplicación según las fases y dependencias acordadas
3. mantener APIs, datos y autenticación separados por aplicación
4. documentar cada aplicación por separado

## Criterio de aceptación de Fase 1 según la memoria

La Fase 1 se considera completada cuando se han preparado, revisado y
verificado:

- el esquema de datos inicial
- la temporalización completa del proyecto
- la autenticación básica de la intranet
- el núcleo mínimo de roles y permisos de la intranet

El equipo ha aprobado el esquema y la temporalización (dos personas, 8 horas
semanales por persona). La ejecución real de la persistencia pública aún debe
verificarse con Docker Desktop en marcha. La suite de intranet pasa sus 9
pruebas; por tanto, quedan verificados sus requisitos técnicos de autenticación
y permisos. La validación pendiente corresponde al arranque añadido de la web
pública en la planificación del equipo, no a un requisito adicional de la
memoria para la Fase 1.
El arranque técnico de la web pública se incluye como decisión de la
temporalización del proyecto, no como requisito explícito de la memoria para
la Fase 1 de intranet. La web pública completa, OAuth completo y los módulos
de las fases posteriores no se deben presentar como entregables oficiales de
esa fase.

## Documentación relacionada

- [Esquema inicial de datos](docs/esquema-inicial-datos.md)
- [Especificación de endpoints](docs/especificacion-endpoints.md)
- [Temporalización aprobada del proyecto](docs/temporalizacion.md)
- [Privacidad y tratamiento de datos de la intranet](apps/intranet/docs/privacidad-datos.md)

## Nota

El objetivo de esta propuesta es dejar explícita la separación entre la web pública del centro y la intranet docente, para que cada aplicación pueda desarrollarse con su propia estructura, tecnologías y dependencias sin mezclar responsabilidades ni modelos de datos.
