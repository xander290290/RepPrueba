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
- Las fases y los módulos funcionales siguen la memoria técnica.
- Las duraciones incluyen implementación y pruebas básicas, pero pueden variar
  al concretar los requisitos, el nivel de experiencia y la carga académica.
- Para la web pública se toma como oficial el stack de la memoria: backend PHP
  sin framework y MySQL/MariaDB; frontend con TypeScript y framework a elegir
  por el equipo.
- La memoria define las fases 1–4 para la intranet. El desarrollo de la web
  pública se representa como una línea paralela, no como contenido oficial de
  las fases de intranet.

La estimación global es de **18 a 24 semanas de calendario** con las
dedicaciones anteriores. Algunas tareas de los dos productos pueden hacerse en
paralelo. Si la disponibilidad semanal cambia, las semanas deben recalcularse.

## Estado al preparar esta planificación

- El backend de intranet ya tiene FastAPI, MongoDB, autenticación JWT,
  usuarios, roles, permisos, auditoría básica y pruebas automatizadas.
- Su suite automatizada llegó a 9 pruebas aprobadas; se debe volver a ejecutar
  al cerrar la Fase 1.
- El esquema inicial de datos está documentado en
  `docs/esquema-inicial-datos.md`; falta que el equipo lo revise y apruebe.
  La temporalización también sigue pendiente de aprobación con la
  disponibilidad real del equipo.
- Las carpetas de los dos frontends y de la web pública son estructuras
  iniciales; todavía no son aplicaciones funcionales.
- No existe todavía un backend funcional para la web pública.

## Calendario relativo

| Periodo estimado | Fase y trabajo | Dependencias | Responsable orientativo | Entregable y criterio de cierre |
|---|---|---|---|---|
| Semanas 1–2 | **Cierre de Fase 1 — Cimientos (memoria).** Revisar y aprobar el esquema inicial ya documentado para intranet y web; completar y validar la temporalización; revisar la autenticación básica y el núcleo mínimo de roles/permisos; volver a ejecutar las pruebas del backend de intranet. | Ninguna. Las decisiones de datos y dependencias deben preceder a los módulos funcionales. | Persona A: revisar el modelo intranet y el backend. Persona B: revisar el modelo relacional público. Ambos: aprobar dependencias y calendario. | Esquemas iniciales revisados y aprobados; temporalización validada; API de intranet y pruebas comprobadas. La web pública funcional no forma parte de Fase 1 según la tabla de fases de la memoria. |
| Semanas 3–4 | **Línea paralela: inicio de la web pública.** Crear el frontend con TypeScript y framework acordado; iniciar backend PHP sin framework, base MySQL/MariaDB y estructura de navegación/contenido. Esto es trabajo del proyecto global, no una fase de intranet definida por la memoria. | Stack y modelo relacional definidos en Fase 1; requisitos de contenido acordados. | Persona A: PHP y modelo SQL. Persona B: frontend y navegación. | Ambos componentes arrancan localmente; separación entre menú y contenido y entre web pública e intranet. |
| Semanas 5–10 | **Fase 2 de intranet — Núcleo funcional.** Anuncios, seguimiento FEM, borradores de publicaciones RRSS con IA, retrasos, emplazamiento en aula, capa completa de roles/permisos, onboarding e incidencias RMI o compras según carga. En paralelo, avanzar páginas públicas, CRUD de noticias/documentos/programas y conexión PHP-frontend. | Fase 1 cerrada; reglas de negocio y modelos de cada módulo acordados. Definir servicio/API de IA antes de integrar generación. | Repartir módulos según carga; revisión cruzada de permisos, datos y pruebas. Mantener una persona responsable por módulo. | Módulos de intranet con API/UI, validación y pruebas; contenidos públicos gestionables desde el backoffice; sistemas separados. |
| Semanas 11–16 | **Fase 3 de intranet — Guardias y firma.** Ausencias, algoritmo de asignación de guardias por rondas, firma/documentos, aula de convivencia, comisiones de servicio y módulo restante de RMI/compras. En paralelo, completar secciones públicas, documentos, departamentos, enseñanzas y contenidos acordados. | Módulos de Fase 2 que aporten usuarios, roles y datos necesarios; reglas y estados aprobados antes de programar cada flujo. | Persona A: reglas de negocio y API de guardias/ausencias. Persona B: UI, firma y trabajo público; ambos revisan flujos críticos. | Casos de asignación y estados probados; permisos aplicados; flujos de firma probados; contenidos públicos revisados. |
| Semanas 17–20 | **Fase 4 — Integraciones.** OAuth de Google y alta pendiente de aprobación; sincronización con Google Calendar; notificaciones push y correo. | Flujos de usuario y permisos estables; credenciales de desarrollo y configuración local disponibles para cada servicio externo. | Persona A: OAuth y calendario. Persona B: notificaciones y frontend; ambos integran y prueban. | Integraciones funcionan en entorno local de pruebas; errores y credenciales ausentes se manejan de forma explícita; secretos fuera del repositorio. |
| Semanas 21–24 | **Cierre y entrega.** Pruebas de extremo a extremo; regresión de permisos y separación de aplicaciones; revisión de accesibilidad y responsive de la web; corrección de fallos; documentación técnica final (entregable de Fase 4), README de instalación/ejecución local y memoria del módulo. | Fases funcionales terminadas. | Ambos: pruebas, correcciones, documentación y revisión final. | Instalación desde instrucciones limpias; suites de pruebas aprobadas; entregables de código, README y memoria de módulo revisados. |

Las franjas se pueden desplazar si una fase requiere más trabajo. No se debe
empezar un módulo con reglas de negocio o modelo de datos sin acordar; se
replanifica primero y se actualizan sus dependencias.

## Desglose de la Fase 1

La Fase 1 definida en la memoria incluye:

1. **Esquema de datos inicial:** existe un diseño inicial en
   `docs/esquema-inicial-datos.md`, con colecciones MongoDB, tablas relacionales,
   campos, relaciones e índices. Falta su revisión y aprobación por el equipo.
2. **Temporalización completa:** revisar y aprobar este plan con la
   disponibilidad real del equipo.
3. **Autenticación básica:** comprobar login, emisión/renovación/revocación de
   JWT y protección de rutas.
4. **Núcleo mínimo de roles y permisos:** comprobar que los permisos se aplican
   correctamente a las operaciones protegidas.

La Fase 1 se considera cerrada cuando esos cuatro puntos están documentados,
revisados y verificados. OAuth de Google, Calendar, push y correo corresponden
a la Fase 4 de la memoria. La web pública funcional continúa como línea del
proyecto global, pero no se debe atribuir a la Fase 1 de intranet.

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
