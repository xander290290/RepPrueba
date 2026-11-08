# Arranque del frontend de la web pública

Esta guía explica cómo preparar y ejecutar localmente el frontend público,
construido con Astro y TypeScript. La memoria técnica deja la elección del
framework del frontend al equipo; Astro es la elección de implementación del
proyecto.

> Esta guía arranca solo el frontend. El backend PHP y la conexión a MySQL o
> MariaDB todavía no están implementados. Las páginas usan contenido inicial
> estático y no necesitan una base de datos para ejecutarse.

## Requisitos

- Windows con PowerShell.
- Node.js 22.23.4 o posterior y npm.
- Comprobar las versiones instaladas:

```powershell
node --version
npm --version
```

## Instalar y arrancar en desarrollo

Desde la raíz del repositorio:

```powershell
Set-Location .\apps\web-publica\frontend
npm ci
if (-not (Test-Path .env)) { Copy-Item .env.example .env }
npm run dev
```

Astro mostrará la dirección local en la consola; por defecto es
`http://localhost:4321/`. Deja esa terminal abierta mientras trabajas. Para
parar el servidor, pulsa `Ctrl+C`.

Si ejecutas los comandos desde otra carpeta, cambia primero a la carpeta
`apps\web-publica\frontend` del repositorio.

## Configurar el enlace a la intranet

El archivo `.env` puede definir `PUBLIC_INTRANET_URL`, la dirección a la que
apuntan los enlaces «Acceso a la intranet». El valor de ejemplo es
`http://localhost:5173`; cámbialo cuando conozcas la dirección local de la
intranet:

```env
PUBLIC_INTRANET_URL=http://localhost:5173
```

Este enlace solo dirige a la aplicación independiente. El frontend público
no ofrece el formulario de login ni comparte sesión o autenticación con la
intranet. Reinicia el servidor de desarrollo después de cambiar `.env`.

## Comprobar y generar la versión de producción

Desde `apps\web-publica\frontend`:

```powershell
npm run check
npm run build
```

`npm run check` comprueba los componentes Astro y TypeScript. `npm run build`
genera el sitio estático dentro de `dist\`.

Para previsualizar localmente la compilación:

```powershell
npm run preview
```

El comando mostrará la dirección local de previsualización. Pulsa `Ctrl+C`
para detenerlo.

## Secciones disponibles

La navegación inicial incluye Inicio, Organización, Familias, Enseñanzas,
Secretaría, Programas, Noticias y Contacto. El contenido es provisional y
estático hasta que se implemente y conecte el backend editorial en PHP.
