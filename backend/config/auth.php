<?php

declare(strict_types=1);

/* =========================================
   DATABASE CONNECTION
========================================= */

require_once __DIR__ . '/database.php';


/* =========================================
   SESSION CONFIGURATION
========================================= */

$isSecure = (
    isset($_SERVER['HTTPS']) &&
    $_SERVER['HTTPS'] !== 'off'
);

$cookiePath = '/tasty-hub/';

$rememberCookieName = 'tasty_hub_remember';

$rememberDuration = 60 * 60 * 24 * 30;


session_name('TASTYHUB_SESSION');

session_set_cookie_params([
    'lifetime' => 0,
    'path' => $cookiePath,
    'domain' => '',
    'secure' => $isSecure,
    'httponly' => true,
    'samesite' => 'Lax'
]);

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}


/* =========================================
   RESTORE SESSION USING REMEMBER COOKIE
========================================= */

if (
    empty($_SESSION['authenticated']) &&
    !empty($_COOKIE[$rememberCookieName])
) {

    $cookieParts = explode(
        ':',
        $_COOKIE[$rememberCookieName],
        2
    );


    if (count($cookieParts) === 2) {

        [$selector, $validator] = $cookieParts;


        if (
            preg_match('/^[a-f0-9]{32}$/', $selector) &&
            preg_match('/^[a-f0-9]{64}$/', $validator)
        ) {

            try {

                /* =================================
                   FIND REMEMBER TOKEN
                ================================== */

                $stmt = $conn->prepare(
                    "SELECT
                        auth_tokens.id AS token_id,
                        auth_tokens.user_id,
                        auth_tokens.validator_hash,
                        auth_tokens.expires_at,
                        users.full_name,
                        users.email
                     FROM auth_tokens
                     INNER JOIN users
                        ON users.id = auth_tokens.user_id
                     WHERE auth_tokens.selector = ?
                     LIMIT 1"
                );

                $stmt->bind_param('s', $selector);

                $stmt->execute();

                $result = $stmt->get_result();

                $token = $result->fetch_assoc();

                $stmt->close();


                /* =================================
                   VERIFY TOKEN
                ================================== */

                if (
                    $token &&
                    strtotime($token['expires_at']) > time() &&
                    hash_equals(
                        $token['validator_hash'],
                        hash('sha256', $validator)
                    )
                ) {

                    /* =============================
                       REGENERATE SESSION ID
                    ============================== */

                    if (session_regenerate_id(true)) {

                        $_SESSION['user_id'] =
                            (int) $token['user_id'];

                        $_SESSION['user_name'] =
                            $token['full_name'];

                        $_SESSION['user_email'] =
                            $token['email'];

                        $_SESSION['authenticated'] = true;

                        $_SESSION['login_time'] = time();


                        /* =============================
                           ROTATE REMEMBER TOKEN
                        ============================== */

                        $newSelector = bin2hex(
                            random_bytes(16)
                        );

                        $newValidator = bin2hex(
                            random_bytes(32)
                        );

                        $newValidatorHash = hash(
                            'sha256',
                            $newValidator
                        );

                        $newExpiresAt = date(
                            'Y-m-d H:i:s',
                            time() + $rememberDuration
                        );


                        $update = $conn->prepare(
                            "UPDATE auth_tokens
                             SET selector = ?,
                                 validator_hash = ?,
                                 expires_at = ?
                             WHERE id = ?"
                        );

                        $tokenId = (int) $token['token_id'];

                        $update->bind_param(
                            'sssi',
                            $newSelector,
                            $newValidatorHash,
                            $newExpiresAt,
                            $tokenId
                        );

                        $update->execute();

                        $update->close();


                        /* =============================
                           UPDATE REMEMBER COOKIE
                        ============================== */

                        setcookie(
                            $rememberCookieName,
                            $newSelector . ':' . $newValidator,
                            [
                                'expires' => time() + $rememberDuration,
                                'path' => $cookiePath,
                                'secure' => $isSecure,
                                'httponly' => true,
                                'samesite' => 'Lax'
                            ]
                        );

                    }

                } else {

                    /* =============================
                       INVALID OR EXPIRED TOKEN
                    ============================== */

                    if ($token) {

                        $delete = $conn->prepare(
                            "DELETE FROM auth_tokens
                             WHERE id = ?"
                        );

                        $tokenId = (int) $token['token_id'];

                        $delete->bind_param('i', $tokenId);

                        $delete->execute();

                        $delete->close();

                    }

                    setcookie(
                        $rememberCookieName,
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

            } catch (Throwable $exception) {

                error_log(
                    'Tasty Hub authentication error: ' .
                    $exception->getMessage()
                );

            }

        }

    }

}