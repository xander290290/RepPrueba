# Plan del frontend de la intranet

## Requisitos de la memoria técnica

La memoria técnica del proyecto define la intranet como una aplicación privada
para el profesorado y el equipo directivo, separada de la web pública. Para el
frontend especifica:

- Una **PWA instalable**, construida con un único código base.
- Un framework a elegir entre **React o Vue**, junto con **TypeScript**.
- Consumo de la API REST de la intranet.
- Componentes reactivos y una interfaz adaptable a cada dispositivo.
- Un sistema de diseño compartido por los diseños de escritorio y móvil.
- En escritorio, una aplicación completa con menú de navegación lateral
  izquierdo.
- En móvil, una navegación inferior y tarjetas de mayor tamaño, pensadas para
  interacción táctil y con una estética próxima a las versiones recientes de
  iOS.
- Contenerización con Docker/Docker Compose, configuración por variables de
  entorno, API versionada y pruebas automatizadas.

Estas decisiones están en los apartados 5.12–5.14 de la
[memoria técnica](../Memoria_Tecnica_Proyecto_Intermodular_DAW.docx.pdf).
La elección concreta entre React y Vue corresponde al equipo. Como propuesta
de implementación, se recomienda **React + TypeScript**.

## Estado actual

La carpeta `apps/intranet/frontend` aún no contiene una aplicación funcional.
El backend de intranet sí está implementado con FastAPI y MongoDB e incluye
autenticación JWT, usuarios, roles, permisos y auditoría básica. La entrada de
la API está en `apps/intranet/backend/app/main.py`; sus rutas se organizan en
`apps/intranet/backend/app/api/`.

La API tiene el prefijo `/api/intranet/v1` y actualmente ofrece:

- `POST /auth/login`, `POST /auth/refresh` y `POST /auth/logout`.
- `GET /users/me`, `GET /users` y `POST /users/register`.
- `GET /roles` y `GET /roles/{role_name}/permissions`.

Los contratos y ejemplos de estas rutas están en la
[especificación de endpoints](especificacion-endpoints.md).

## Organización e independencia

La intranet debe permanecer como una aplicación propia:

```text
apps/
├─ intranet/
│  ├─ frontend/   # PWA React + TypeScript
│  └─ backend/    # API FastAPI + MongoDB
└─ web-publica/
   ├─ frontend/   # Astro
   └─ backend/    # PHP + MySQL
```

La intranet y la web pública no deben compartir API, base de datos, sesión,
autenticación ni dependencias de ejecución. La web pública seguirá usando
Astro con su API PHP y MySQL; la intranet usará React con su API FastAPI y
MongoDB. Se puede mantener una identidad visual coherente —por ejemplo,
colores y tipografía— sin compartir lógica ni hacer que una aplicación dependa
de la otra. El vínculo entre ellas será únicamente el enlace de acceso a la
intranet desde la web pública.

La intranet necesita configuración y secretos propios en variables de entorno.
También debe tener su propio Docker Compose para coordinar el frontend, la API
y MongoDB; actualmente no dispone de ese Compose. La configuración de CORS de
FastAPI debe permitir solo los orígenes del frontend que se hayan autorizado
para desarrollo y despliegue.

## Integración del frontend con FastAPI

El frontend tendrá un cliente API propio y una URL base configurable que, en
desarrollo local, apunte al backend —actualmente previsto en
`http://127.0.0.1:8000`—. Las peticiones usarán el prefijo
`/api/intranet/v1`.

El flujo de autenticación previsto con los endpoints existentes es:

1. La pantalla de acceso envía correo y contraseña a `POST /auth/login`.
2. El backend devuelve un access token y un refresh token.
3. Las peticiones protegidas envían el access token en
   `Authorization: Bearer <token>`.
4. Cuando el access token caduca, el cliente puede enviar el refresh token a
   `POST /auth/refresh`, guardar la nueva pareja de tokens y repetir la
   petición que falló.
5. Al cerrar sesión, llama a `POST /auth/logout` y elimina las credenciales
   locales.

Antes de cerrar el almacenamiento de credenciales para producción hay que
definir el mecanismo con el backend. La API actual devuelve los tokens en
JSON y recibe el refresh token en el cuerpo de la petición. Se debe evitar
guardar el refresh token en `localStorage`; una opción a valorar es adaptarlo
para usar una cookie `HttpOnly`, con las medidas CSRF adecuadas. Esta decisión
debe resolverse antes de fijar el flujo definitivo.

El cliente distinguirá los errores de autenticación y autorización:

- **401 Unauthorized:** sesión ausente, inválida o caducada; intentar la
  renovación cuando corresponda y, si falla, volver al acceso.
- **403 Forbidden:** sesión válida pero permiso insuficiente; informar al
  usuario sin mostrar acciones que no puede realizar.

La interfaz puede ocultar opciones que no correspondan a los permisos del
usuario, pero esto solo mejora la experiencia: **la autorización efectiva
siempre la aplica FastAPI** mediante sus dependencias en cada endpoint.

## Diseño según dispositivo

Se mantendrá un solo conjunto de rutas, componentes y lógica de negocio, con
dos presentaciones responsivas:

- **Escritorio:** menú lateral izquierdo persistente, área principal de
  trabajo y navegación completa para los módulos.
- **Móvil:** barra inferior para las secciones principales, áreas táctiles
  cómodas, tarjetas más grandes y formularios adecuados a pantallas pequeñas.

Los estilos, componentes, estados de carga, mensajes de error y controles de
accesibilidad se compartirán cuando sea apropiado para conservar una
experiencia coherente. La navegación cambia según el tamaño de pantalla, no
la aplicación ni la identidad del usuario.

La PWA incluirá un manifiesto instalable y un Service Worker. El Service
Worker puede encargarse de los recursos estáticos de la aplicación; no debe
guardar en caché respuestas privadas ni datos personales de la API sin una
decisión explícita de seguridad y privacidad. La instalación como PWA no
significa que los flujos privados funcionen sin conexión.

## Orden de desarrollo por fases

La [temporalización](temporalizacion.md) organiza las fases de intranet de
acuerdo con la memoria:

1. **Fase 1 — Cimientos:** esquema de datos inicial, temporalización,
   autenticación básica y núcleo mínimo de roles y permisos. Una pantalla de
   acceso puede servir para comprobar los endpoints actuales, pero el
   desarrollo completo del frontend no es un entregable explícito de esta
   fase en la memoria.
2. **Fase 2 — Núcleo funcional:** construir las pantallas de los módulos de
   esta fase junto con sus contratos API y permisos: tablón de anuncios,
   seguimiento FEM, borradores de RRSS con IA, retrasos, emplazamiento en el
   aula, roles y permisos completos, onboarding e incidencias RMI o gestión
   de compras según el reparto acordado.
3. **Fase 3 — Guardias y firma:** incorporar los flujos de guardias y
   ausencias, aula de convivencia, comisiones de servicio y firma, además del
   módulo restante de incidencias RMI o compras.
4. **Fase 4 — Integraciones:** completar OAuth, Google Calendar,
   notificaciones push y correo, junto con la documentación técnica final.

Se implementará cada pantalla cuando estén acordados su flujo, modelo de
datos, permisos y contrato de API. Así se evita construir una interfaz para
operaciones que el backend aún no ofrece.

## Resumen

La propuesta es desarrollar una PWA independiente con React y TypeScript,
adaptable a escritorio y móvil, que consuma exclusivamente la API FastAPI de
la intranet. Docker coordinará los servicios propios de esa aplicación. La
web pública seguirá funcionando por separado con Astro, PHP y MySQL; no se
compartirán sus datos ni su autenticación con la intranet.
