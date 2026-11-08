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

Se añadieron los componentes de cabecera, pie y layout; una página Astro
independiente para cada sección; los datos iniciales de navegación y los
estilos globales. La navegación corresponde a Inicio, Organización, Familias,
Enseñanzas, Secretaría, Programas, Noticias y Contacto.

## Editar o añadir una página

Cada página tiene su propio archivo `.astro` en `src/pages\`, con su marcado
HTML y una sección `<style>` para el CSS específico. Se puede añadir
JavaScript del navegador dentro de una sección `<script>` en ese mismo
archivo. La portada está en `src/pages\index.astro`; por ejemplo,
Organización está en `src/pages\organizacion.astro`. Las páginas de noticias
y programas conservan sus llamadas a la API para mostrar contenido de MySQL.

Para añadir una ruta nueva, crea un archivo como
`src/pages\admision.astro` y añade su título, slug, visibilidad y orden a la
tabla `paginas`, que es la fuente del menú. El slug del archivo y el de la
tabla deben coincidir. Por ejemplo, desde el cliente MySQL:

```sql
INSERT INTO paginas (slug, titulo, orden, tipo_contenido, visible)
VALUES ('admision', 'Admisión', 8, 'pagina', TRUE);
```

No hace falta introducir el HTML en JSON ni en MySQL. En desarrollo
(`npm run dev`) Astro recoge el archivo al guardarlo. En Docker, reconstruye
únicamente el frontend para incluir el cambio:

```powershell
Set-Location .\apps\web-publica\backend
docker compose up --build -d frontend
```

Los archivos fuente se guardan en el repositorio y se copian a la imagen del
frontend. No edites archivos dentro del contenedor: sus cambios no son una
forma persistente de modificar el proyecto.

La tabla `contenidos_paginas` sigue en el esquema inicial aprobado, pero estas
páginas no la consultan. Los registros antiguos que pueda haber en MySQL se
conservan y no afectan al HTML que se muestra.

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

El frontend obtiene el contenido mediante `API_BASE_URL`. Al ejecutarlo fuera
de Docker, apunta a la API local:

```powershell
$env:API_BASE_URL = "http://127.0.0.1:8080/api/public/v1"
```

## 4. Comprobar y compilar

Estos son los comandos ejecutados para validar el frontend:

```powershell
npm run check
npm run build
```

`check` valida los archivos Astro y TypeScript. `build` genera el servidor
Astro Node en `dist\`; las páginas que necesitan datos consultan el backend
cuando se solicitan.

## 5. Arrancar el servidor local

Desde `apps\web-publica\frontend`:

```powershell
npm run dev -- --host 127.0.0.1
```

Astro muestra la dirección local en la consola; con este comando es
`http://127.0.0.1:4321/`. Abre esa URL en el navegador y deja la terminal
abierta mientras pruebas la página. Para detener el servidor, pulsa `Ctrl+C`.

Para usar producción localmente se recomienda arrancar la pila completa con
Docker Compose desde `apps\web-publica\backend`, como se explica en
`apps\web-publica\backend\README.md`. `npm run preview` sirve para previsualizar
el build, pero debes configurar `API_BASE_URL` para que alcance al backend.

La navegación, las noticias y los programas usan la API PHP. Las páginas
informativas están implementadas en archivos Astro independientes.
