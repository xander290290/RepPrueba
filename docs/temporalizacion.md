# Temporalización aprobada del proyecto

## Alcance y supuestos

Esta planificación organiza el proyecto completo descrito en la memoria:
intranet docente y web pública. Es una estimación relativa, no un calendario
con fechas comprometidas.

Supuestos para poder estimar:

- Equipo de dos personas, con unas 8 horas semanales por persona (16 horas de
  equipo por semana).
- Trabajo local y validación siguiendo los README de cada aplicación. No se
  planifican publicación en Internet ni HTTPS remoto.
- Las fases y los módulos funcionales de la intranet siguen la memoria
  técnica. Esta planificación incorpora además el arranque de la web pública
  dentro de la Fase 1, como decisión del proyecto.
- La memoria fija el contenido y el orden de las fases de la intranet, pero no
  asigna semanas ni fechas. Las duraciones de esta tabla son una estimación del
  equipo y deben recalcularse con la disponibilidad real.
- Las duraciones incluyen implementación y pruebas básicas, pero pueden variar
  al concretar los requisitos, el nivel de experiencia y la carga académica.
  El equipo ha validado la estimación con dos personas y 8 horas semanales por
  persona (16 horas de equipo por semana).
- Para la web pública se adopta el stack de la memoria: backend PHP sin
  framework y MySQL; frontend con TypeScript y framework a elegir por el
  equipo.
- La memoria define las fases 1–4 para la intranet y no asigna fases a la web
  pública. En esta temporalización, la base técnica de la web pública se
  integra en la Fase 1 y su desarrollo continúa dentro de las fases siguientes.

La estimación global aprobada es de **18 a 24 semanas de calendario** con las
dedicaciones anteriores. Si la disponibilidad semanal cambia, las semanas
deben recalcularse con el equipo.

## Estado actual del proyecto

- El backend de intranet ya tiene FastAPI, MongoDB, autenticación JWT,
  usuarios, roles, permisos, auditoría básica y pruebas automatizadas.
- Su suite automatizada llegó a 9 pruebas aprobadas; se debe volver a ejecutar
  al cerrar la Fase 1.
- El esquema inicial de datos está documentado en
  `docs/esquema-inicial-datos.md` y ha sido aprobado por el equipo.
  La temporalización también está aprobada para dos personas con 8 horas
  semanales cada una.
- El frontend público usa Astro Node con TypeScript y SSR; cada sección tiene
  su archivo Astro independiente. Consulta en el backend los datos de navegación,
  noticias y programas en cada petición.
- El backend público ofrece endpoints de lectura PHP para navegación, noticias
  y programas, conectado con PDO a MySQL. Astro Node consulta la API al
  renderizar cada petición; Compose inicia los tres servicios y carga el menú
  inicial.
- El backoffice y los endpoints editoriales de escritura continúan pendientes.
- El frontend de la intranet todavía no es una aplicación funcional.

## Calendario relativo

| Periodo estimado | Fase y trabajo | Dependencias | Responsable orientativo | Entregable y criterio de cierre |
|---|---|---|---|---|
| Semanas 1–4 | **Fase 1 — Cimientos (memoria) y arranque de la web pública (plan del proyecto).** Aplicar el esquema y la temporalización aprobados; verificar la autenticación básica y el núcleo mínimo de roles y permisos de la intranet; completar el arranque del frontend público Astro/TypeScript e iniciar el backend PHP sin framework y la base MySQL. | Ninguna; acordar modelos y stack antes de avanzar con los módulos. | Persona A: modelo intranet, autenticación y backend PHP. Persona B: modelo relacional público y frontend. Ambos: integrar las bases y verificar los entregables. | Esquemas revisados y aprobados; temporalización validada; autenticación, permisos y pruebas comprobados; frontend público y backend con persistencia arrancan localmente y permanecen separados de la intranet. El arranque de la web es una ampliación de esta planificación, no un entregable explícito de la Fase 1 en la memoria. |
| Semanas 5–10 | **Fase 2 de intranet — Núcleo funcional (memoria) y gestión de contenidos públicos (plan del proyecto).** Tablón de anuncios; seguimiento FEM; borradores de publicaciones RRSS con IA; gestión de retrasos; emplazamiento en el aula; capa completa de roles y permisos; primeros pasos (onboarding); e incidencias RMI y/o gestión de compras, repartidos según carga. Para la web pública, implementar CRUD de noticias, documentos y programas, y conectar backend y frontend. | Fase 1 cerrada; reglas de negocio y modelos de cada módulo acordados. Definir servicio/API de IA antes de integrar generación. | Repartir módulos según carga; revisión cruzada de permisos, datos y pruebas. Mantener una persona responsable por módulo. | Módulos de intranet con API/UI, validación y pruebas; contenidos públicos gestionables desde el backoffice; sistemas separados. |
| Semanas 11–16 | **Fase 3 de intranet — Guardias y firma (memoria) y finalización de contenidos públicos (plan del proyecto).** Guardias con flujo de ausencias y firma; aula de convivencia; comisiones de servicio con firma; y el módulo restante de incidencias RMI o gestión de compras de la Fase 2. Completar las secciones públicas, documentos, departamentos, enseñanzas y contenidos acordados. | Fase 2 y reglas/estados de cada flujo acordados antes de implementarlos. | Persona A: reglas de negocio y API de guardias/ausencias. Persona B: UI y firma; ambos revisan flujos críticos y contenidos públicos. | Casos de asignación y estados probados; permisos aplicados; flujos de firma probados; contenidos públicos revisados. |
| Semanas 17–22 | **Fase 4 — Integraciones (memoria).** OAuth completo; integración con Google Calendar; notificaciones push y por email; documentación técnica final. Cerrar la integración, las pruebas y la documentación de la web pública. | Flujos de usuario y permisos estables; credenciales de desarrollo y configuración local disponibles para cada servicio externo. | Persona A: OAuth y calendario. Persona B: notificaciones y frontend; ambos integran, documentan y prueban. | Integraciones y documentación técnica final verificadas en entorno local; web pública revisada; errores y credenciales ausentes se manejan explícitamente; secretos fuera del repositorio. |
| Semanas 23–24 | **Cierre del proyecto (planificación del equipo, fuera de las fases oficiales).** Pruebas de extremo a extremo y regresión; revisión de la separación de aplicaciones, accesibilidad y diseño responsive de la web; corrección de fallos; revisión de README de instalación/ejecución local y memoria del módulo. | Fases funcionales terminadas y documentación técnica de Fase 4 preparada. | Ambos: pruebas, correcciones y revisión final. | Instalación desde instrucciones limpias; suites aprobadas; entregables de código, README y memoria revisados. |

Las franjas se pueden desplazar si una fase requiere más trabajo. No se debe
empezar un módulo con reglas de negocio o modelo de datos sin acordar; se
replanifica primero y se actualizan sus dependencias.

## Desglose de la Fase 1

La memoria define estos cuatro elementos oficiales para la Fase 1:

1. **Esquema de datos inicial:** existe un diseño inicial aprobado en
   `docs/esquema-inicial-datos.md`, con colecciones MongoDB, tablas relacionales,
   campos, relaciones e índices. La migración SQL inicial de la web pública
   está preparada.
2. **Temporalización completa:** este plan está aprobado para la disponibilidad
   declarada de dos personas con 8 horas semanales por persona.
3. **Autenticación básica:** comprobar login, emisión/renovación/revocación de
   JWT y protección de rutas.
4. **Núcleo mínimo de roles y permisos:** comprobar que los permisos se aplican
   correctamente a las operaciones protegidas. La gestión completa de todos
   los roles y permisos pertenece a la Fase 2.

Además, esta planificación incorpora en la Fase 1 el arranque de la web
pública: usar Astro con TypeScript para las páginas y navegación iniciales e
iniciar el backend PHP y su persistencia relacional. El frontend Astro ya
incluye las rutas iniciales como archivos independientes y el backend/MySQL ya
tienen un arranque técnico local con esquema y endpoints de lectura. La
navegación, las noticias y los programas se consultan durante el renderizado
SSR; el marcado de las páginas se mantiene en el código Astro. Esto es una
decisión del plan del proyecto, no un entregable explícito de la fase de
intranet descrita en la memoria. La gestión dinámica de contenidos continúa
en las fases siguientes del plan.

La Fase 1 del plan se cierra cuando los entregables oficiales están
documentados, revisados y verificados, y la base técnica inicial de la web
pública está arrancada. OAuth completo, Google Calendar, notificaciones push
y email, y la documentación técnica final corresponden a la Fase 4.

El equipo ya aprobó el esquema y esta temporalización; las 9 pruebas de la
intranet pasan. Para dar por validado también el arranque añadido de la web
pública, queda ejecutar el Compose y confirmar la conexión PDO/MySQL cuando
Docker Desktop esté disponible.

## Seguimiento y ajustes

- Revisar semanalmente tareas terminadas, bloqueos y estimaciones restantes.
- Mantener una tarea por módulo con responsable, dependencia y criterio de
  aceptación verificable.
- Ejecutar pruebas al cerrar cada módulo y una regresión al final de cada fase.
- Añadir al plan los bloqueos externos (credenciales, definición de reglas,
  contenidos o decisiones del centro) y ajustar fechas solo después de
  resolverlos.
- No registrar contraseñas, tokens ni credenciales de servicios en este
  documento ni en el repositorio.
