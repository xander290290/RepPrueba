<?php
declare(strict_types=1);

require_once __DIR__ . '/../repositories/public_content_repository.php';

function handle_api_request(string $method, string $path, array $query = []): array
{
    $basePath = '/api/public/v1';
    $path = rtrim($path, '/') ?: '/';

    if (!str_starts_with($path, $basePath . '/')) {
        return ['status' => 404, 'body' => ['error' => 'not_found']];
    }

    $route = substr($path, strlen($basePath));
    $newsMatch = preg_match('#^/news/([1-9][0-9]*)$#', $route, $newsMatches) === 1;
    $knownRoutes = ['/health', '/health/database', '/pages', '/news', '/programs'];
    if (!in_array($route, $knownRoutes, true) && !$newsMatch) {
        return ['status' => 404, 'body' => ['error' => 'not_found']];
    }

    if ($method !== 'GET') {
        return ['status' => 405, 'body' => ['error' => 'method_not_allowed']];
    }

    if ($route === '/health') {
        return [
            'status' => 200,
            'body' => ['status' => 'ok', 'service' => 'web-publica-api'],
        ];
    }

    try {
        if ($route === '/health/database') {
            database_connection()->query('SELECT 1');
            return ['status' => 200, 'body' => ['status' => 'ok', 'database' => 'ok']];
        }

        if ($route === '/pages') {
            return ['status' => 200, 'body' => list_public_pages()];
        }

        if ($route === '/news') {
            $limit = filter_var($query['limit'] ?? 20, FILTER_VALIDATE_INT);
            $offset = filter_var($query['offset'] ?? 0, FILTER_VALIDATE_INT);
            if ($limit === false || $limit < 1 || $limit > 100 || $offset === false || $offset < 0) {
                return ['status' => 422, 'body' => ['error' => 'invalid_pagination']];
            }

            return ['status' => 200, 'body' => list_published_news($limit, $offset)];
        }

        if ($newsMatch) {
            $news = get_published_news((int) $newsMatches[1]);
            return $news === null
                ? ['status' => 404, 'body' => ['error' => 'not_found']]
                : ['status' => 200, 'body' => $news];
        }

        if ($route === '/programs') {
            return ['status' => 200, 'body' => list_active_programs()];
        }
    } catch (PDOException | RuntimeException $exception) {
        error_log('Public API request failed: ' . $exception->getMessage());

        return $route === '/health/database'
            ? ['status' => 503, 'body' => ['status' => 'error', 'database' => 'unavailable']]
            : ['status' => 503, 'body' => ['error' => 'service_unavailable']];
    }

    return ['status' => 404, 'body' => ['error' => 'not_found']];
}
