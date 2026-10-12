<?php

declare(strict_types=1);

/*
|--------------------------------------------------------------------------
| Tasty Hub — Database Configuration
|--------------------------------------------------------------------------
| Local XAMPP development configuration.
| Never expose database credentials in frontend JavaScript.
*/

$host = 'localhost';
$port = 3306;
$database = 'tasty_hub';
$username = 'root';
$password = '';

mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

try {
    $conn = new mysqli(
        $host,
        $username,
        $password,
        $database,
        $port
    );

    $conn->set_charset('utf8mb4');

} catch (mysqli_sql_exception $exception) {

    error_log(
        'Tasty Hub database connection failed: ' .
        $exception->getMessage()
    );

    http_response_code(500);

    exit(
        'Database connection failed. Please try again later.'
    );
}