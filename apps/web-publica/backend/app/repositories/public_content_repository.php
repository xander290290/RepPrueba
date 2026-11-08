<?php
declare(strict_types=1);

require_once __DIR__ . '/../database/connection.php';

function list_public_pages(): array
{
    $statement = database_connection()->query(
        'SELECT page.id, page.slug, page.titulo, page.padre_id, parent.slug AS parent_slug, page.orden
         FROM paginas AS page
         LEFT JOIN paginas AS parent ON parent.id = page.padre_id
         WHERE page.visible = 1
         ORDER BY page.padre_id IS NOT NULL, page.orden, page.titulo'
    );

    $pages = [];
    foreach ($statement->fetchAll() as $row) {
        $id = (int) $row['id'];
        $pages[$id] = [
            'id' => $id,
            'slug' => $row['slug'],
            'title' => $row['titulo'],
            'parent_slug' => $row['parent_slug'],
            'order' => (int) $row['orden'],
            'children' => [],
        ];
    }

    $tree = [];
    foreach ($pages as $id => &$page) {
        if ($page['parent_slug'] === null) {
            $tree[] = &$page;
            continue;
        }

        foreach ($pages as &$parent) {
            if ($parent['slug'] === $page['parent_slug']) {
                $parent['children'][] = &$page;
                break;
            }
        }
        unset($parent);
    }
    unset($page);

    return $tree;
}

function list_published_news(int $limit, int $offset): array
{
    $connection = database_connection();
    $count = $connection->query(
        'SELECT COUNT(*) FROM noticias
         WHERE estado = \'publicada\' AND publicada_en IS NOT NULL AND publicada_en <= UTC_TIMESTAMP()'
    );
    $total = (int) $count->fetchColumn();

    $statement = $connection->prepare(
        'SELECT id, titulo AS title, resumen AS summary,
                DATE_FORMAT(publicada_en, \'%Y-%m-%dT%H:%i:%sZ\') AS published_at
         FROM noticias
         WHERE estado = \'publicada\' AND publicada_en IS NOT NULL AND publicada_en <= UTC_TIMESTAMP()
         ORDER BY publicada_en DESC, id DESC
         LIMIT :limit OFFSET :offset'
    );
    $statement->bindValue('limit', $limit, PDO::PARAM_INT);
    $statement->bindValue('offset', $offset, PDO::PARAM_INT);
    $statement->execute();

    return [
        'items' => $statement->fetchAll(),
        'limit' => $limit,
        'offset' => $offset,
        'total' => $total,
    ];
}

function get_published_news(int $id): ?array
{
    $statement = database_connection()->prepare(
        'SELECT id, titulo AS title, resumen AS summary, cuerpo AS body,
                DATE_FORMAT(publicada_en, \'%Y-%m-%dT%H:%i:%sZ\') AS published_at
         FROM noticias
         WHERE id = :id AND estado = \'publicada\' AND publicada_en IS NOT NULL AND publicada_en <= UTC_TIMESTAMP()
         LIMIT 1'
    );
    $statement->execute(['id' => $id]);
    $news = $statement->fetch();

    return $news === false ? null : $news;
}

function list_active_programs(): array
{
    $statement = database_connection()->query(
        'SELECT id, nombre AS name, categoria AS category, descripcion AS description
         FROM programas
         WHERE activo = 1
         ORDER BY categoria, nombre, id'
    );

    return $statement->fetchAll();
}
