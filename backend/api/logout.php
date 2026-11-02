<?php

declare(strict_types=1);

/* =========================================
   RESPONSE CONFIGURATION
========================================= */

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, no-cache, must-revalidate');
header('Pragma: no-cache');


function sendResponse(
    int $status,
    bool $success,
    string $message
): never {

    http_response_code($status);

    echo json_encode([
        'success' => $success,
        'message' => $message
    ]);

    exit;

}


/* =========================================
   ALLOW POST REQUESTS ONLY
========================================= */

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {

    header('Allow: POST');

    sendResponse(
        405,
        false,
        'Method not allowed.'
    );

}


/* =========================================
   LOAD AUTHENTICATION CONFIGURATION
========================================= */

require_once __DIR__ . '/../config/auth.php';


/* =========================================
   DELETE CURRENT REMEMBER TOKEN
========================================= */

$rememberCookieName = 'tasty_hub_remember';

$cookiePath = '/tasty-hub/';

$isSecure = (
    isset($_SERVER['HTTPS']) &&
    $_SERVER['HTTPS'] !== 'off'
);


if (!empty($_COOKIE[$rememberCookieName])) {

    $cookieParts = explode(
        ':',
        $_COOKIE[$rememberCookieName],
        2
    );

    if (count($cookieParts) === 2) {

        $selector = $cookieParts[0];

        if (preg_match('/^[a-f0-9]{32}$/', $selector)) {

            $stmt = $conn->prepare(
                "DELETE FROM auth_tokens WHERE selector = ?"
            );

            $stmt->bind_param('s', $selector);

            $stmt->execute();

            $stmt->close();

        }

    }

}


/* =========================================
   CLEAR REMEMBER ME COOKIE
========================================= */

setcookie($rememberCookieName, '', [
    'expires' => time() - 3600,
    'path' => $cookiePath,
    'secure' => $isSecure,
    'httponly' => true,
    'samesite' => 'Lax'
]);


/* =========================================
   DESTROY PHP SESSION
========================================= */

$_SESSION = [];


if (ini_get('session.use_cookies')) {

    setcookie(
        session_name(),
        '',
        [
            'expires' => time() - 3600,
            'path' => $cookiePath,
            'secure' => $isSecure,
            'httponly' => true,
            'samesite' => 'Lax'
        ]
    );

}


session_destroy();


/* =========================================
   SUCCESS RESPONSE
========================================= */

sendResponse(
    200,
    true,
    'You have been logged out successfully.'
);