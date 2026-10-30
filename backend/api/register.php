<?php

declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/../config/database.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);

    echo json_encode([
        'success' => false,
        'message' => 'Method not allowed.'
    ]);

    exit;
}

try {

    // Receive JSON data
    $data = json_decode(file_get_contents('php://input'), true);

    if (!is_array($data)) {
        throw new InvalidArgumentException('Invalid request data.');
    }

    // Retrieve and sanitize inputs
    $fullName = trim($data['full_name'] ?? '');
    $email = strtolower(trim($data['email'] ?? ''));
    $phone = trim($data['phone'] ?? '');
    $password = $data['password'] ?? '';
    $confirmPassword = $data['confirm_password'] ?? '';
    $acceptedTerms = $data['terms'] ?? false;

    // Validate full name
    if (strlen($fullName) < 3 || strlen($fullName) > 150) {
        throw new InvalidArgumentException('Please enter a valid full name.');
    }

    // Validate email
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        throw new InvalidArgumentException('Please enter a valid email address.');
    }

    if (strlen($email) > 150) {
        throw new InvalidArgumentException('Email address is too long.');
    }

    // Validate phone
    $cleanPhone = preg_replace('/[\s()+-]/', '', $phone);

    if (!preg_match('/^\d{7,15}$/', $cleanPhone)) {
        throw new InvalidArgumentException('Please enter a valid phone number.');
    }

    if (strlen($phone) > 20) {
        throw new InvalidArgumentException('Phone number is too long.');
    }

    // Validate password
    if (
        strlen($password) < 8 ||
        !preg_match('/[a-z]/', $password) ||
        !preg_match('/[A-Z]/', $password) ||
        !preg_match('/\d/', $password)
    ) {
        throw new InvalidArgumentException(
            'Password must contain at least 8 characters, including uppercase, lowercase and a number.'
        );
    }

    if ($password !== $confirmPassword) {
        throw new InvalidArgumentException('Passwords do not match.');
    }

    // Validate terms acceptance
    if ($acceptedTerms !== true) {
        throw new InvalidArgumentException(
            'Please accept the Terms and Conditions.'
        );
    }

    // Check for an existing account
    $checkEmail = $conn->prepare(
        'SELECT id FROM users WHERE email = ? LIMIT 1'
    );

    $checkEmail->bind_param('s', $email);
    $checkEmail->execute();
    $checkEmail->store_result();

    if ($checkEmail->num_rows > 0) {
        $checkEmail->close();

        http_response_code(409);

        echo json_encode([
            'success' => false,
            'message' => 'An account with this email already exists.'
        ]);

        exit;
    }

    $checkEmail->close();

    // Hash password
    $hashedPassword = password_hash($password, PASSWORD_DEFAULT);

    if ($hashedPassword === false) {
        throw new RuntimeException('Unable to secure your password.');
    }

    // Save user
    $insertUser = $conn->prepare(
        'INSERT INTO users (full_name, email, phone, password)
         VALUES (?, ?, ?, ?)'
    );

    $insertUser->bind_param(
        'ssss',
        $fullName,
        $email,
        $phone,
        $hashedPassword
    );

    $insertUser->execute();

    $userId = $conn->insert_id;

    $insertUser->close();

    http_response_code(201);

    echo json_encode([
        'success' => true,
        'message' => 'Your Tasty Hub account has been created successfully!',
        'user' => [
            'id' => $userId,
            'full_name' => $fullName,
            'email' => $email
        ]
    ]);

} catch (InvalidArgumentException $exception) {

    http_response_code(422);

    echo json_encode([
        'success' => false,
        'message' => $exception->getMessage()
    ]);

} catch (mysqli_sql_exception $exception) {

    error_log('Tasty Hub registration database error: ' . $exception->getMessage());

    http_response_code(500);

    echo json_encode([
        'success' => false,
        'message' => 'Something went wrong while creating your account.'
    ]);

} catch (Throwable $exception) {

    error_log('Tasty Hub registration error: ' . $exception->getMessage());

    http_response_code(500);

    echo json_encode([
        'success' => false,
        'message' => 'Unable to complete registration. Please try again.'
    ]);
}
?>