<?php
declare(strict_types=1);

function database_connection(): PDO
{
    $host = getenv('DB_HOST');
    $configuredPort = getenv('DB_PORT');
    $port = $configuredPort === false || $configuredPort === '' ? '3306' : $configuredPort;
    $name = getenv('DB_NAME');
    $user = getenv('DB_USER');
    $password = getenv('DB_PASSWORD');

    foreach (['DB_HOST' => $host, 'DB_NAME' => $name, 'DB_USER' => $user] as $key => $value) {
        if ($value === false || $value === '') {
            throw new RuntimeException("Missing required database setting: {$key}");
        }
    }

    if ($password === false || $password === '') {
        throw new RuntimeException('Missing required database setting: DB_PASSWORD');
    }

    if (!ctype_digit($port) || (int) $port < 1 || (int) $port > 65535) {
        throw new RuntimeException('DB_PORT must be a valid TCP port');
    }

    $dsn = sprintf(
        'mysql:host=%s;port=%d;dbname=%s;charset=utf8mb4',
        $host,
        (int) $port,
        $name
    );

    return new PDO($dsn, $user, $password, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ]);
}
