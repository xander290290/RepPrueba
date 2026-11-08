# Temporalización provisional del proyecto

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
- Para la web pública se toma como oficial el stack de la memoria: backend PHP
  sin framework y MySQL/MariaDB; frontend con TypeScript y framework a elegir
  por el equipo.
- La memoria define las fases 1–4 para la intranet y no asigna fases a la web
  pública. En esta temporalización, la base técnica de la web pública se
  integra en la Fase 1 y su desarrollo continúa dentro de las fases siguientes.

La estimación global es de **18 a 24 semanas de calendario** con las
dedicaciones anteriores. Si la disponibilidad semanal cambia, las semanas
deben recalcularse.

## Estado al preparar esta planificación

- El backend de intranet ya tiene FastAPI, MongoDB, autenticación JWT,
  usuarios, roles, permisos, auditoría básica y pruebas automatizadas.
- Su suite automatizada llegó a 9 pruebas aprobadas; se debe volver a ejecutar
  al cerrar la Fase 1.
- El esquema inicial de datos está documentado en
  `docs/esquema-inicial-datos.md`; falta que el equipo lo revise y apruebe.
  La temporalización también sigue pendiente de aprobación con la
  disponibilidad real del equipo.
- El frontend público ya tiene un arranque Astro con TypeScript, páginas
  iniciales para las ocho secciones y compilación estática verificada.
- El backend PHP, la conexión MySQL/MariaDB y el frontend de la intranet
  todavía no son aplicaciones funcionales.
- No existe todavía un backend funcional para la web pública.

## Calendario relativo

| Periodo estimado | Fase y trabajo | Dependencias | Responsable orientativo | Entregable y criterio de cierre |
|---|---|---|---|---|
| Semanas 1–4 | **Fase 1 — Cimientos (memoria) y arranque de la web pública (plan del proyecto).** Revisar y aprobar el esquema inicial de datos de ambas aplicaciones; completar y validar la temporalización; verificar la autenticación básica y el núcleo mínimo de roles y permisos de la intranet; completar el arranque del frontend público Astro/TypeScript e iniciar el backend PHP sin framework y la base MySQL/MariaDB. | Ninguna; acordar modelos y stack antes de avanzar con los módulos. | Persona A: modelo intranet, autenticación y backend PHP. Persona B: modelo relacional público y frontend. Ambos: aprobar esquemas y calendario e integrar las bases. | Esquemas revisados y aprobados; temporalización validada; autenticación, permisos y pruebas comprobados; frontend público y backend con persistencia arrancan localmente y permanecen separados de la intranet. El arranque de la web es una ampliación de esta planificación, no un entregable explícito de la Fase 1 en la memoria. |
| Semanas 5–10 | **Fase 2 de intranet — Núcleo funcional (memoria) y gestión de contenidos públicos (plan del proyecto).** Tablón de anuncios; seguimiento FEM; borradores de publicaciones RRSS con IA; gestión de retrasos; emplazamiento en el aula; capa completa de roles y permisos; primeros pasos (onboarding); e incidencias RMI y/o gestión de compras, repartidos según carga. Para la web pública, implementar CRUD de noticias, documentos y programas, y conectar backend y frontend. | Fase 1 cerrada; reglas de negocio y modelos de cada módulo acordados. Definir servicio/API de IA antes de integrar generación. | Repartir módulos según carga; revisión cruzada de permisos, datos y pruebas. Mantener una persona responsable por módulo. | Módulos de intranet con API/UI, validación y pruebas; contenidos públicos gestionables desde el backoffice; sistemas separados. |
| Semanas 11–16 | **Fase 3 de intranet — Guardias y firma (memoria) y finalización de contenidos públicos (plan del proyecto).** Guardias con flujo de ausencias y firma; aula de convivencia; comisiones de servicio con firma; y el módulo restante de incidencias RMI o gestión de compras de la Fase 2. Completar las secciones públicas, documentos, departamentos, enseñanzas y contenidos acordados. | Fase 2 y reglas/estados de cada flujo acordados antes de implementarlos. | Persona A: reglas de negocio y API de guardias/ausencias. Persona B: UI y firma; ambos revisan flujos críticos y contenidos públicos. | Casos de asignación y estados probados; permisos aplicados; flujos de firma probados; contenidos públicos revisados. |
| Semanas 17–22 | **Fase 4 — Integraciones (memoria).** OAuth completo; integración con Google Calendar; notificaciones push y por email; documentación técnica final. Cerrar la integración, las pruebas y la documentación de la web pública. | Flujos de usuario y permisos estables; credenciales de desarrollo y configuración local disponibles para cada servicio externo. | Persona A: OAuth y calendario. Persona B: notificaciones y frontend; ambos integran, documentan y prueban. | Integraciones y documentación técnica final verificadas en entorno local; web pública revisada; errores y credenciales ausentes se manejan explícitamente; secretos fuera del repositorio. |
| Semanas 23–24 | **Cierre del proyecto (planificación del equipo, fuera de las fases oficiales).** Pruebas de extremo a extremo y regresión; revisión de la separación de aplicaciones, accesibilidad y diseño responsive de la web; corrección de fallos; revisión de README de instalación/ejecución local y memoria del módulo. | Fases funcionales terminadas y documentación técnica de Fase 4 preparada. | Ambos: pruebas, correcciones y revisión final. | Instalación desde instrucciones limpias; suites aprobadas; entregables de código, README y memoria revisados. |

Las franjas se pueden desplazar si una fase requiere más trabajo. No se debe
empezar un módulo con reglas de negocio o modelo de datos sin acordar; se
replanifica primero y se actualizan sus dependencias.

## Desglose de la Fase 1

La memoria define estos cuatro elementos oficiales para la Fase 1:

1. **Esquema de datos inicial:** existe un diseño inicial en
   `docs/esquema-inicial-datos.md`, con colecciones MongoDB, tablas relacionales,
   campos, relaciones e índices. Falta su revisión y aprobación por el equipo.
2. **Temporalización completa:** revisar y aprobar este plan con la
   disponibilidad real del equipo.
3. **Autenticación básica:** comprobar login, emisión/renovación/revocación de
   JWT y protección de rutas.
4. **Núcleo mínimo de roles y permisos:** comprobar que los permisos se aplican
   correctamente a las operaciones protegidas. La gestión completa de todos
   los roles y permisos pertenece a la Fase 2.

Además, esta planificación incorpora en la Fase 1 el arranque de la web
pública: usar Astro con TypeScript para las páginas y navegación iniciales e
iniciar el backend PHP y su persistencia relacional. El frontend Astro ya
genera las ocho rutas iniciales; quedan por arrancar el backend y la base de
datos. Esto es una decisión del plan del proyecto, no un entregable explícito
de la fase de intranet descrita en la memoria. La gestión dinámica de
contenidos continúa en las fases siguientes del plan.

La Fase 1 del plan se cierra cuando los entregables oficiales están
documentados, revisados y verificados, y la base técnica inicial de la web
pública está arrancada. OAuth completo, Google Calendar, notificaciones push
y email, y la documentación técnica final corresponden a la Fase 4.

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
