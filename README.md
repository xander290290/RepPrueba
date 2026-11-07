# Proyecto Intermodal DAW - Arquitectura separada de web pública e intranet

## Descripción

Este proyecto forma parte del Proyecto Intermodular de DAW del IES Ramón Arcas Meca y consiste en dos aplicaciones digitales independientes para el centro educativo:

1. una web pública e informativa del centro
2. una intranet privada de gestión docente

La diferencia fundamental es que cada una tiene su propia arquitectura y sus propias dependencias, aunque comparten el mismo contexto académico y el mismo objetivo de digitalizar servicios del centro.

La Fase 1 del proyecto, denominada "Cimientos" en la memoria técnica, cubre el esquema de datos inicial, la temporalización completa, la autenticación básica de la intranet y su núcleo mínimo de roles y permisos. La web pública es un proyecto independiente; sus requisitos generales se describen aquí, pero la memoria no la incluye como aplicación funcional dentro de esa fase.

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
- base de datos relacional MySQL o MariaDB
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
- Framework a elegir por el equipo, combinado con TypeScript
- diseño responsive
- páginas públicas alineadas con el mapa de secciones de la memoria

#### Backend y persistencia
- PHP sin framework (la memoria descarta Laravel)
- MySQL o MariaDB, con relaciones y claves foráneas
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
│  │  │  └─ contenido.txt
│  │  ├─ docs/
│  │  │  └─ contenido.txt
│  │  └─ frontend/
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

Las carpetas de la web pública, el frontend de la intranet y `shared/` están
creadas como estructura inicial; sus archivos `contenido.txt` son descriptivos
y no representan aplicaciones funcionales. El backend funcional implementado
actualmente es el de la intranet. No existen todavía `docker-compose.yml`,
`package.json` ni `docs/arquitectura-general.md`.

## Dependencias por aplicación

### Web pública

Debe depender de:
- frontend con TypeScript y un framework elegido por el equipo
- backend PHP sin framework
- base de datos relacional MySQL o MariaDB
- backoffice CRUD para noticias, documentos y programas
- motor de rutas y renderizado para las páginas y el menú jerárquico

No debe depender directamente de:
- autenticación de usuarios internos
- roles de profesorado
- gestión de ausencias, guardias o incidencias internas

El backend público todavía no está implementado; sus carpetas son solo la
estructura inicial.

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

La memoria define la Fase 1 —Cimientos— con estos entregables:

- esquema de datos inicial
- temporalización completa del proyecto
- autenticación básica
- núcleo mínimo de roles y permisos

La memoria no asigna la construcción funcional de la web pública a esta fase.
Su arquitectura y sus requisitos globales se detallan por separado y se
planifican como línea de trabajo del proyecto.

El diseño inicial de datos de ambas aplicaciones está recogido en
[el documento de esquema](docs/esquema-inicial-datos.md); debe revisarse y
aprobarse antes de dar por cerrado este entregable.

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
usa [su plantilla `.env.example`](apps/intranet/backend/.env.example). La
configuración de la web pública se definirá al implementar su backend PHP.
Las direcciones locales previstas son:

```env
Web pública: frontend http://localhost:3000; backend local (puerto por definir)
Intranet: backend http://127.0.0.1:8000
```

## Recomendación para la implementación

Se recomienda trabajar con dos frentes paralelos:

1. construir la base de contenido público
2. construir la base de autenticación y permisos de la intranet
3. dejar una API separada por dominio de negocio
4. documentar cada aplicación por separado
5. mantener un esquema claro de dependencias para cada proyecto

## Criterio de aceptación de Fase 1 según la memoria

La Fase 1 se considera completada cuando se han preparado y revisado:

- el esquema de datos inicial
- la temporalización completa del proyecto
- la autenticación básica de la intranet
- el núcleo mínimo de roles y permisos de la intranet

Las pruebas automatizadas de autenticación y permisos verifican el
funcionamiento de esta base. La web pública funcional, OAuth completo y los
módulos posteriores no se deben presentar como entregables de Fase 1.

## Documentación relacionada

- [Esquema inicial de datos](docs/esquema-inicial-datos.md)
- [Especificación de endpoints](docs/especificacion-endpoints.md)
- [Temporalización provisional del proyecto](docs/temporalizacion.md)
- [Privacidad y tratamiento de datos de la intranet](apps/intranet/docs/privacidad-datos.md)

## Nota

El objetivo de esta propuesta es dejar explícita la separación entre la web pública del centro y la intranet docente, para que cada aplicación pueda desarrollarse con su propia estructura, tecnologías y dependencias sin mezclar responsabilidades ni modelos de datos.
