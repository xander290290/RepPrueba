<?php
declare(strict_types=1);

require_once __DIR__ . '/../app/routes/api.php';

foreach (['DB_HOST', 'DB_PORT', 'DB_NAME', 'DB_USER', 'DB_PASSWORD'] as $setting) {
    putenv($setting);
}

$cases = [
    [
        'method' => 'GET',
        'path' => '/api/public/v1/health',
        'expected' => [
            'status' => 200,
            'body' => ['status' => 'ok', 'service' => 'web-publica-api'],
        ],
    ],
    [
        'method' => 'POST',
        'path' => '/api/public/v1/health',
        'expected' => [
            'status' => 405,
            'body' => ['error' => 'method_not_allowed'],
        ],
    ],
    [
        'method' => 'GET',
        'path' => '/api/public/v1/unknown',
        'expected' => ['status' => 404, 'body' => ['error' => 'not_found']],
    ],
    [
        'method' => 'GET',
        'path' => '/api/public/v1/pages/inicio',
        'expected' => ['status' => 404, 'body' => ['error' => 'not_found']],
    ],
    [
        'method' => 'GET',
        'path' => '/api/public/v1/health/database',
        'expected' => [
            'status' => 503,
            'body' => ['status' => 'error', 'database' => 'unavailable'],
        ],
    ],
    [
        'method' => 'GET',
        'path' => '/api/public/v1/news',
        'query' => ['limit' => 'invalid'],
        'expected' => ['status' => 422, 'body' => ['error' => 'invalid_pagination']],
    ],
];

foreach ($cases as $case) {
    $actual = handle_api_request($case['method'], $case['path'], $case['query'] ?? []);
    if ($actual !== $case['expected']) {
        throw new RuntimeException(
            sprintf('Unexpected response for %s %s', $case['method'], $case['path'])
        );
    }
}

fwrite(STDOUT, sprintf("OK: %d API health cases\n", count($cases)));
