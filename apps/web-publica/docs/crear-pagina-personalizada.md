# Añadir una página propia al menú

Esta guía crea una página de demostración llamada **Aula creativa**. La página
usa HTML, CSS y JavaScript propios; no guarda su contenido en JSON ni en
MySQL. La navegación sigue viniendo de MySQL y el resto de páginas no necesita
modificarse.

## 1. Crear el archivo Astro

Astro asigna la URL a partir del nombre del archivo:

```text
apps\web-publica\frontend\src\pages\aula-creativa.astro
```

El HTML de la página se escribe en el componente. Astro procesa el bloque
`<style>` como CSS local de esta página, y el `<script>` se empaqueta para esta
ruta. El script busca elementos dentro del contenedor `data-creative-lab`, no
registra manejadores globales ni cambia otros componentes.

Este es el ejemplo real añadido al proyecto:

```astro
---
import SiteLayout from "../components/SiteLayout.astro";
---

<SiteLayout
  title="Aula creativa"
  description="Una página de demostración con estilos y JavaScript aislados para el proyecto."
>
  <section class="page-hero">
    <div class="page-hero-inner">
      <p class="eyebrow">Laboratorio de ideas · Página de demostración</p>
      <h1>Aula creativa</h1>
      <p>Un espacio inventado para aprender experimentando y compartir nuevas ideas.</p>
    </div>
  </section>

  <section class="content-section creative-lab" data-creative-lab>
    <article class="creative-lab__card">
      <p class="creative-lab__label">Reto de hoy</p>
      <h2>Diseña una escuela más sostenible</h2>
      <p>Piensa en un cambio pequeño que podamos probar esta semana en el centro.</p>
      <button class="creative-lab__button" type="button" data-new-challenge>
        Proponer otra idea
      </button>
      <p class="creative-lab__idea" data-challenge aria-live="polite">
        Tu propuesta aparecerá aquí.
      </p>
    </article>
    <aside class="creative-lab__note">
      <span class="creative-lab__icon" aria-hidden="true">✦</span>
      <h2>Aprender haciendo</h2>
      <p>Esta tarjeta, sus colores y el botón interactivo pertenecen solo a esta página de ejemplo.</p>
    </aside>
  </section>
</SiteLayout>

<style>
  .creative-lab {
    display: grid;
    grid-template-columns: minmax(0, 1.5fr) minmax(220px, 0.8fr);
    gap: 1.25rem;
    align-items: stretch;
  }

  .creative-lab__card,
  .creative-lab__note {
    padding: clamp(1.5rem, 4vw, 2.5rem);
    border: 1px solid #e5d7fa;
    border-radius: 20px;
    background: #fbf8ff;
    box-shadow: 0 14px 36px rgb(68 43 105 / 9%);
  }

  .creative-lab__label {
    color: #7042a2;
    font-size: 0.8rem;
    font-weight: 750;
    letter-spacing: 0.1em;
    text-transform: uppercase;
  }

  .creative-lab__card h2,
  .creative-lab__note h2 {
    color: #392454;
    font-family: Georgia, "Times New Roman", serif;
  }

  .creative-lab__button {
    padding: 0.75rem 1rem;
    border: 0;
    border-radius: 999px;
    background: #7042a2;
    color: #fff;
    font: inherit;
    font-weight: 700;
    cursor: pointer;
  }

  .creative-lab__button:hover {
    background: #512e7a;
  }

  .creative-lab__button:focus-visible {
    outline: 3px solid #d5b6fb;
    outline-offset: 3px;
  }

  .creative-lab__idea {
    min-height: 3rem;
    margin: 1.25rem 0 0;
    color: #512e7a;
    font-weight: 650;
  }

  .creative-lab__note {
    background: #f4edff;
  }

  .creative-lab__icon {
    display: inline-grid;
    width: 2.5rem;
    height: 2.5rem;
    margin-bottom: 1rem;
    place-items: center;
    border-radius: 50%;
    background: #e6d5fb;
    color: #512e7a;
    font-size: 1.3rem;
  }

  @media (max-width: 700px) {
    .creative-lab {
      grid-template-columns: 1fr;
    }
  }
</style>

<script>
  const lab = document.querySelector("[data-creative-lab]");

  if (lab) {
    const button = lab.querySelector("[data-new-challenge]");
    const output = lab.querySelector("[data-challenge]");
    const ideas = [
      "Reto: convierte un rincón del patio en un espacio lleno de plantas.",
      "Reto: inventa una forma de reutilizar papel en clase.",
      "Reto: crea una señal para recordar cómo ahorrar agua.",
    ];
    let nextIdea = 0;

    button?.addEventListener("click", () => {
      if (output) {
        output.textContent = ideas[nextIdea];
        nextIdea = (nextIdea + 1) % ideas.length;
      }
    });
  }
</script>
```

Los estilos generales y la cabecera se reutilizan desde el layout común. El
CSS con prefijo `.creative-lab` y el JavaScript limitado a `data-creative-lab`
son específicos de esta página; no hay que modificar `global.css`,
`SiteLayout.astro` ni los archivos de las demás rutas.

## 2. Añadir la entrada al menú de MySQL

El archivo de migración que añade únicamente la entrada del menú es:

```text
apps\web-publica\backend\database\003_add_aula_creativa_page.sql
```

La migración usa `utf8mb4` y `ON DUPLICATE KEY UPDATE` para poder aplicarse
más de una vez sin crear duplicados. Se monta en la carpeta de inicialización
de MySQL para que también se ejecute al crear una base de datos nueva.

## 3. Guardar y publicar con Docker

Abre PowerShell desde la raíz del repositorio. Estos comandos actualizan la
configuración del servicio MySQL sin borrar su volumen, aplican la migración a
la base existente, y reconstruyen únicamente el frontend:

```powershell
Set-Location .\apps\web-publica\backend
docker compose up -d --wait database
docker compose exec -T database sh -c 'mysql --default-character-set=utf8mb4 -uroot -p"$MYSQL_ROOT_PASSWORD" "$MYSQL_DATABASE" < /docker-entrypoint-initdb.d/003_add_aula_creativa_page.sql'
docker compose up --build -d frontend
docker compose ps
```

La primera línea espera a que MySQL esté saludable y no borra los datos: el
volumen `mysql_data` se conserva.
No ejecutes `docker compose down -v`, porque la opción `-v` sí eliminaría los
datos persistidos de MySQL.

El `.astro` permanece en el repositorio y Docker lo copia a la imagen del
frontend al reconstruirla. La fila del menú se conserva en `mysql_data`. En
un volumen nuevo, MySQL ejecuta la migración montada al inicializarse. No
edites dentro del contenedor ni guardes ahí la única copia del código: los
contenedores pueden reemplazarse.

Al terminar, la ruta será
`http://127.0.0.1:4321/aula-creativa/` y **Aula creativa** aparecerá en el
banner de navegación.

## 4. Comprobar el resultado

```powershell
Invoke-RestMethod http://127.0.0.1:8080/api/public/v1/pages
Invoke-WebRequest http://127.0.0.1:4321/aula-creativa/ -UseBasicParsing
```

Comprueba también el botón **Proponer otra idea** y reduce el ancho del
navegador para verificar el diseño adaptable. Para confirmar que las demás
páginas conservan su propio diseño, abre por ejemplo
`http://127.0.0.1:4321/organizacion/`.
