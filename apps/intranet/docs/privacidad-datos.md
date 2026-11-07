# Privacidad y tratamiento de datos de la intranet

## Alcance y advertencia

Este documento describe los datos que la versión actual del backend local de
la intranet guarda o procesa y las decisiones técnicas pendientes. El proyecto
se ejecuta localmente siguiendo su README; este documento no propone un
despliegue remoto. Es un inventario técnico para el proyecto, no una política
de privacidad para usuarios, un dictamen jurídico ni una certificación de
cumplimiento del RGPD.

El uso real de datos personales en un centro debe revisarse con la persona
responsable de protección de datos o asesoría competente, que debe confirmar
los fines y la base jurídica del tratamiento, informar a las personas afectadas
y aprobar las medidas de conservación y ejercicio de derechos.

## Datos tratados actualmente

| Categoría | Datos y almacenamiento | Finalidad técnica |
|---|---|---|
| Cuenta de usuario | Identificador interno, nombre, apellidos, correo, hash de contraseña, roles, estado activo y fechas de creación/actualización en `users`. | Identificar las cuentas y aplicar autenticación y permisos. |
| Credenciales durante el login | Correo y contraseña recibidos en la solicitud. La contraseña se compara con su hash Argon2; no se guarda en texto plano. | Verificar el acceso. Los fallos de login no incluyen correo ni identificador en el registro de auditoría. |
| Tokens | Los JWT contienen identificador de usuario, sesión, identificador del token, tipo y tiempos de emisión/caducidad. Se entregan al cliente; la base de datos no guarda el JWT en bruto. | Autenticar las solicitudes y renovar o revocar sesiones. Los JWT están firmados, no cifrados: quien tenga un token puede leer sus claims. |
| Sesiones | Identificador de sesión, identificador de usuario, identificador del refresh token vigente, estado de revocación y fecha de expiración en `sessions`. | Permitir rotar refresh tokens, revocar sesiones y rechazar tokens invalidados. |
| Auditoría | Acción, resultado, fecha UTC e identificadores internos opcionales de quien actuó y de la cuenta creada en `audit_logs`. | Dejar constancia de login correcto/incorrecto, logout y alta de usuarios. No se guardan correos, contraseñas, hashes, tokens ni cuerpos de solicitud. |
| Roles y permisos | Nombre y descripción del rol y lista de permisos en `roles`. | Autorizar operaciones según el rol asignado. No son datos personales por sí solos. |

El alta inicial del administrador usa variables `INITIAL_ADMIN_*` solo cuando
se aprovisiona una base sin usuarios. La contraseña se transforma en un hash
antes de almacenarse. Los valores configurados localmente en `.env` son
secretos de entorno y no deben compartirse ni subirse al repositorio.

## Acceso y exposición

- El propio usuario autenticado puede consultar su perfil mediante
  `GET /api/intranet/v1/users/me`.
- Un usuario con permiso `users.read` puede listar datos públicos de cuentas
  (nombre, apellidos, correo, roles y fecha de creación). No recibe hashes ni
  contraseñas.
- Un usuario con permiso `users.write` puede crear cuentas.
- Los permisos se asignan por rol y se comprueban en el backend. El rol `admin`
  tiene todos los permisos en la configuración inicial.
- No existe actualmente un endpoint para consultar o exportar `audit_logs`.
  Quien tenga credenciales y acceso directo a MongoDB sí puede leerlos; el
  acceso administrativo a la base debe limitarse y controlarse por separado.
- Los tokens deben tratarse como credenciales. No deben incluirse en informes,
  capturas compartidas, URLs ni registros de aplicación.

## Conservación y eliminación implementadas

- Los access tokens duran 30 minutos y los refresh tokens 7 días por defecto;
  ambos plazos se pueden cambiar mediante configuración.
- Las sesiones incluyen una fecha de expiración y un índice TTL de MongoDB para
  que las sesiones expiradas se eliminen automáticamente. La limpieza TTL de
  MongoDB es eventual, no una eliminación garantizada en el instante exacto.
- Las cuentas no tienen un flujo de baja, anonimización o eliminación
  implementado en la API.
- Los eventos de auditoría no tienen caducidad automática ni una tarea de
  borrado. Permanecen en MongoDB hasta que una operación administrativa los
  elimine.
- No se ha definido en el código la retención de copias de seguridad ni de
  registros del servidor o de la infraestructura.

Por tanto, el centro debe definir un plazo de conservación para cuentas
inactivas, sesiones, auditoría y cualquier copia local, además de un
procedimiento seguro de baja, rectificación y eliminación que contemple sus
obligaciones. No se deben inventar plazos sin esa decisión.

## Medidas técnicas presentes y límites

Presentes en esta versión:

- Hash de contraseñas mediante Argon2.
- JWT firmados con una clave configurada mediante variables de entorno; el
  backend valida que la clave tenga al menos 32 caracteres.
- Caducidad y rotación de refresh tokens y revocación de sesiones.
- Autorización por roles y permisos en el backend.
- Índice único para el correo de usuario y acceso separado a MongoDB mediante
  la configuración del servicio.
- Pruebas que verifican los flujos de autenticación, permisos y auditoría.

Límites del alcance local:

- Este proyecto no configura publicación remota ni HTTPS; las pruebas se hacen
  localmente siguiendo el README del backend.
- La memoria del proyecto contempla gestión de consentimientos, derechos de
  acceso y rectificación, y trazabilidad de accesos a datos sensibles. Esos
  flujos aún no están implementados en el backend.
- La política de privacidad del centro, la finalidad, la base jurídica, la
  información a usuarios, los derechos y los plazos de conservación deben
  validarse antes de usar datos personales reales.
- Proteger el acceso local a MongoDB, el archivo `.env`, las copias de
  seguridad locales y las credenciales administrativas.
- Decidir quién puede consultar/exportar auditoría, cómo se monitoriza el
  acceso y cuánto tiempo se conserva.
- Revisar los registros locales y definir si se crean copias de seguridad; el
  backend no implementa por sí mismo políticas de retención o restauración.

La existencia de estas medidas técnicas no basta, por sí sola, para afirmar que
el tratamiento cumple el RGPD. Esa conclusión requiere revisar el contexto,
las prácticas operativas y las decisiones del responsable del tratamiento.
