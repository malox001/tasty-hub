<?php

declare(strict_types=1);

/*
|--------------------------------------------------------------------------
| TASTY HUB - PROFILE API
|--------------------------------------------------------------------------
| Retrieves the authenticated user's profile information.
|--------------------------------------------------------------------------
*/

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
header('Pragma: no-cache');


/*
|--------------------------------------------------------------------------
| AUTHENTICATION
|--------------------------------------------------------------------------
*/

require_once __DIR__ . '/../config/auth.php';


/*
|--------------------------------------------------------------------------
| REQUEST METHOD
|--------------------------------------------------------------------------
*/

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);

    echo json_encode([
        'success' => false,
        'message' => 'Method not allowed.'
    ]);

    exit;
}


/*
|--------------------------------------------------------------------------
| CHECK AUTHENTICATION
|--------------------------------------------------------------------------
*/

if (
    !isset($_SESSION['authenticated']) ||
    $_SESSION['authenticated'] !== true ||
    !isset($_SESSION['user_id'])
) {
    http_response_code(401);

    echo json_encode([
        'success' => false,
        'message' => 'Please log in to access your profile.'
    ]);

    exit;
}


/*
|--------------------------------------------------------------------------
| FETCH USER PROFILE
|--------------------------------------------------------------------------
*/

try {

    $userId = (int) $_SESSION['user_id'];

    $stmt = $conn->prepare(
        "SELECT
            id,
            full_name,
            email,
            phone,
            created_at,
            email_verified_at
         FROM users
         WHERE id = ?
         LIMIT 1"
    );

    $stmt->bind_param("i", $userId);

    $stmt->execute();

    $result = $stmt->get_result();

    $user = $result->fetch_assoc();

    $stmt->close();


    /*
    |--------------------------------------------------------------------------
    | USER NOT FOUND
    |--------------------------------------------------------------------------
    */

    if (!$user) {

        $_SESSION = [];

        http_response_code(404);

        echo json_encode([
            'success' => false,
            'message' => 'User account not found.'
        ]);

        exit;
    }


    /*
    |--------------------------------------------------------------------------
    | SUCCESS RESPONSE
    |--------------------------------------------------------------------------
    */

    echo json_encode([
        'success' => true,
        'message' => 'Profile retrieved successfully.',

        'user' => [
            'id' => (int) $user['id'],
            'full_name' => $user['full_name'],
            'email' => $user['email'],
            'phone' => $user['phone'],
            'created_at' => $user['created_at'],
            'email_verified' => $user['email_verified_at'] !== null
        ]
    ]);

} catch (Throwable $exception) {

    error_log(
        'Tasty Hub profile API error: ' . $exception->getMessage()
    );

    http_response_code(500);

    echo json_encode([
        'success' => false,
        'message' => 'Unable to retrieve your profile. Please try again.'
    ]);

}