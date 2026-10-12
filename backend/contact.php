<?php

declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Allow: POST');
    http_response_code(405);

    echo json_encode([
        'success' => false,
        'message' => 'Only POST requests are allowed.'
    ]);

    exit;
}

require_once __DIR__ . '/config/database.php';

function respond(int $statusCode, array $data): never
{
    http_response_code($statusCode);

    echo json_encode($data);

    exit;
}

// Read the submitted form data.
$name = trim((string) ($_POST['name'] ?? ''));
$email = trim((string) ($_POST['email'] ?? ''));
$subject = trim((string) ($_POST['subject'] ?? ''));
$orderNumber = trim((string) ($_POST['orderNumber'] ?? ''));
$message = trim((string) ($_POST['message'] ?? ''));

// Validate the name.
if (mb_strlen($name) < 2 || mb_strlen($name) > 120) {
    respond(422, [
        'success' => false,
        'message' => 'Please enter a name between 2 and 120 characters.'
    ]);
}

// Validate the email address.
if (
    strlen($email) > 254 ||
    !filter_var($email, FILTER_VALIDATE_EMAIL)
) {
    respond(422, [
        'success' => false,
        'message' => 'Please enter a valid email address.'
    ]);
}

// Validate the enquiry subject.
$allowedSubjects = [
    'General Enquiry',
    'Order Support',
    'Delivery Issue',
    'Payment Issue',
    'Catering and Special Orders',
    'Feedback',
    'Business Partnership',
    'Other'
];

if (
    $subject === '' ||
    !in_array($subject, $allowedSubjects, true)
) {
    respond(422, [
        'success' => false,
        'message' => 'Please select a valid enquiry type.'
    ]);
}

// Validate the optional order number.
if (strlen($orderNumber) > 100) {
    respond(422, [
        'success' => false,
        'message' => 'The order number is too long.'
    ]);
}

// Validate the message.
if (mb_strlen($message) < 10 || mb_strlen($message) > 1500) {
    respond(422, [
        'success' => false,
        'message' => 'Your message must contain between 10 and 1500 characters.'
    ]);
}

try {
    $sql = "
        INSERT INTO contact_messages
            (name, email, subject, order_number, message)
        VALUES (?, ?, ?, ?, ?)
    ";

    $statement = $conn->prepare($sql);

    $orderNumberValue = $orderNumber !== '' ? $orderNumber : null;

    $statement->bind_param(
        'sssss',
        $name,
        $email,
        $subject,
        $orderNumberValue,
        $message
    );

    $statement->execute();

    $statement->close();

    respond(201, [
        'success' => true,
        'message' => 'Your message has been sent successfully! Thank you for contacting Tasty Hub.'
    ]);

} catch (mysqli_sql_exception $exception) {
    error_log(
        'Tasty Hub contact submission failed: ' .
        $exception->getMessage()
    );

    respond(500, [
        'success' => false,
        'message' => 'We could not submit your message right now. Please try again.'
    ]);
}