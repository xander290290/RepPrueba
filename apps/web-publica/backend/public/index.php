<?php
declare(strict_types=1);

require_once __DIR__ . '/../app/routes/api.php';

$path = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH);
$response = handle_api_request(
    $_SERVER['REQUEST_METHOD'] ?? 'GET',
    is_string($path) ? $path : '/',
    $_GET
);

http_response_code($response['status']);
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

if ($response['status'] === 405) {
    header('Allow: GET');
}

echo json_encode($response['body'], JSON_THROW_ON_ERROR);
