<?php

declare(strict_types=1);

/* =========================================
   RESPONSE CONFIGURATION
========================================= */

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, no-cache, must-revalidate');
header('Pragma: no-cache');


/* =========================================
   LOAD AUTHENTICATION CONFIGURATION
========================================= */

require_once __DIR__ . '/../config/auth.php';


/* =========================================
   CHECK AUTHENTICATION STATUS
========================================= */

if (
    !empty($_SESSION['authenticated']) &&
    !empty($_SESSION['user_id'])
) {

    echo json_encode([

        'success' => true,

        'authenticated' => true,

        'user' => [

            'id' => (int) $_SESSION['user_id'],

            'full_name' => $_SESSION['user_name'] ?? '',

            'email' => $_SESSION['user_email'] ?? ''

        ]

    ], JSON_UNESCAPED_SLASHES);

    exit;

}


/* =========================================
   USER IS NOT AUTHENTICATED
========================================= */

echo json_encode([

    'success' => true,

    'authenticated' => false,

    'user' => null

], JSON_UNESCAPED_SLASHES);

exit;