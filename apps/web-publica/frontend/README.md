# Frontend de la web pública

Este documento recoge los pasos y comandos usados para crear y arrancar el
frontend en Windows con PowerShell. Está construido con Astro y TypeScript.
La memoria técnica deja el framework del frontend a elección del equipo;
Astro es la decisión adoptada para este proyecto.

## Requisitos

- Node.js 22.23.4 o posterior.
- npm.

Comprueba que están instalados:

```powershell
node --version
npm --version
```

## 1. Crear la estructura inicial

Desde la raíz del repositorio, se preparó esta estructura:

```text
apps\web-publica\frontend\
├─ public\
├─ src\
│  ├─ components\
│  ├─ data\
│  ├─ pages\
│  └─ styles\
├─ .env.example
├─ astro.config.mjs
├─ package.json
└─ tsconfig.json
```

Se añadieron los componentes de cabecera, pie y layout; la portada; una ruta
para las páginas informativas; los datos iniciales de las secciones y los
estilos globales. La navegación corresponde a Inicio, Organización, Familias,
Enseñanzas, Secretaría, Programas, Noticias y Contacto.

Los archivos de configuración y código se crean en el proyecto; no hay un
comando de scaffolding que haya que repetir. En `package.json` se definieron
los scripts `dev`, `build`, `preview` y `check`, además de Astro, TypeScript y
la herramienta de comprobación de Astro.

## 2. Instalar dependencias

Desde la raíz del repositorio:

```powershell
Set-Location .\apps\web-publica\frontend
npm install
```

`npm install` instala las dependencias definidas en `package.json` y genera
`package-lock.json`. En instalaciones posteriores, usa `npm ci` para instalar
las versiones fijadas en el lockfile:

```powershell
npm ci
```

## 3. Preparar la configuración local

Crea `.env` a partir de la plantilla si todavía no existe:

```powershell
if (-not (Test-Path .env)) { Copy-Item .env.example .env }
```

`PUBLIC_INTRANET_URL` establece el destino del enlace «Acceso a la intranet».
El valor de ejemplo es `http://localhost:5173`; cámbialo por la dirección que
corresponda cuando la intranet esté disponible. La web pública solo enlaza a
la intranet: no implementa ni comparte su login o sesión.

## 4. Comprobar y compilar

Estos son los comandos ejecutados para validar el frontend:

```powershell
npm run check
npm run build
```

`check` valida los archivos Astro y TypeScript. `build` genera las páginas
estáticas en `dist\`.

## 5. Arrancar el servidor local

Desde `apps\web-publica\frontend`:

```powershell
npm run dev -- --host 127.0.0.1
```

Astro muestra la dirección local en la consola; con este comando es
`http://127.0.0.1:4321/`. Abre esa URL en el navegador y deja la terminal
abierta mientras pruebas la página. Para detener el servidor, pulsa `Ctrl+C`.

Para inspeccionar localmente la compilación de producción, en lugar del
servidor de desarrollo:

```powershell
npm run preview
```

El contenido del frontend es estático por ahora. El backend PHP y la conexión
a MySQL/MariaDB se implementarán por separado; todavía no son necesarios para
arrancar estas páginas.
