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
    string $message,
    array $extra = []
): never {

    http_response_code($status);

    echo json_encode(
        array_merge([
            'success' => $success,
            'message' => $message
        ], $extra),
        JSON_UNESCAPED_SLASHES
    );

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
   DATABASE CONNECTION
========================================= */

require_once __DIR__ . '/../config/auth.php';



/* =========================================
   REMEMBER ME COOKIE CONFIGURATION
========================================= */

$rememberCookieName = 'tasty_hub_remember';

$cookiePath = '/tasty-hub/';

$rememberDuration = 60 * 60 * 24 * 30;


/* =========================================
   REMOVE EXISTING REMEMBER TOKEN
   PREVENTS OLD TOKENS FROM ACCUMULATING
========================================= */

function removeRememberToken(
    mysqli $conn,
    string $cookieName,
    string $cookiePath,
    bool $isSecure
): void {

    if (!empty($_COOKIE[$cookieName])) {

        $parts = explode(
            ':',
            $_COOKIE[$cookieName],
            2
        );

        if (count($parts) === 2) {

            $selector = $parts[0];

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

    setcookie($cookieName, '', [
        'expires' => time() - 3600,
        'path' => $cookiePath,
        'secure' => $isSecure,
        'httponly' => true,
        'samesite' => 'Lax'
    ]);

}


/* =========================================
   READ JSON REQUEST
========================================= */

$input = json_decode(
    file_get_contents('php://input'),
    true
);

if (!is_array($input)) {

    sendResponse(
        400,
        false,
        'Invalid request data.'
    );

}


$email = strtolower(trim($input['email'] ?? ''));

$password = $input['password'] ?? '';

$rememberMe = filter_var(
    $input['remember_me'] ?? false,
    FILTER_VALIDATE_BOOLEAN
);


/* =========================================
   VALIDATE INPUT
========================================= */

if (
    $email === '' ||
    !filter_var($email, FILTER_VALIDATE_EMAIL)
) {

    sendResponse(
        422,
        false,
        'Please enter a valid email address.'
    );

}

if (
    !is_string($password) ||
    trim($password) === ''
) {

    sendResponse(
        422,
        false,
        'Please enter your password.'
    );

}


/* =========================================
   FIND USER ACCOUNT
========================================= */

try {

    $stmt = $conn->prepare(
        "SELECT id, full_name, email, password
         FROM users
         WHERE email = ?
         LIMIT 1"
    );

    $stmt->bind_param('s', $email);

    $stmt->execute();

    $result = $stmt->get_result();

    $user = $result->fetch_assoc();

    $stmt->close();


    /* =====================================
       VERIFY PASSWORD
    ====================================== */

    if (
        !$user ||
        !password_verify($password, $user['password'])
    ) {

        sendResponse(
            401,
            false,
            'Invalid email address or password.'
        );

    }


    /* =====================================
       REGENERATE SESSION ID
    ====================================== */

    if (!session_regenerate_id(true)) {

        sendResponse(
            500,
            false,
            'Unable to establish your session. Please try again.'
        );

    }


    /* =====================================
       STORE AUTHENTICATED USER SESSION
    ====================================== */

    $_SESSION['user_id'] = (int) $user['id'];

    $_SESSION['user_name'] = $user['full_name'];

    $_SESSION['user_email'] = $user['email'];

    $_SESSION['authenticated'] = true;

    $_SESSION['login_time'] = time();


    /* =====================================
       REMEMBER ME FUNCTIONALITY
    ====================================== */

    removeRememberToken(
        $conn,
        $rememberCookieName,
        $cookiePath,
        $isSecure
    );


    if ($rememberMe) {

        // Generate a selector and a secret validator.

        $selector = bin2hex(random_bytes(16));

        $validator = bin2hex(random_bytes(32));

        // Store only the validator hash.

        $validatorHash = hash('sha256', $validator);

        $expiresAt = date(
            'Y-m-d H:i:s',
            time() + $rememberDuration
        );


        $tokenStmt = $conn->prepare(
            "INSERT INTO auth_tokens
             (user_id, selector, validator_hash, expires_at)
             VALUES (?, ?, ?, ?)"
        );

        $userId = (int) $user['id'];

        $tokenStmt->bind_param(
            'isss',
            $userId,
            $selector,
            $validatorHash,
            $expiresAt
        );

        $tokenStmt->execute();

        $tokenStmt->close();


        // Store the actual validator only in the browser's cookie.

        setcookie(
            $rememberCookieName,
            $selector . ':' . $validator,
            [
                'expires' => time() + $rememberDuration,
                'path' => $cookiePath,
                'secure' => $isSecure,
                'httponly' => true,
                'samesite' => 'Lax'
            ]
        );

    }


    /* =====================================
       SUCCESSFUL LOGIN RESPONSE
    ====================================== */

    sendResponse(
        200,
        true,
        'Login successful! Welcome back.',
        [
            'user' => [
                'id' => (int) $user['id'],
                'full_name' => $user['full_name'],
                'email' => $user['email']
            ],
            'redirect' => 'Home.html'
        ]
    );


} catch (Throwable $exception) {

    error_log(
        'Tasty Hub login error: ' . $exception->getMessage()
    );

    sendResponse(
        500,
        false,
        'Something went wrong. Please try again later.'
    );

}