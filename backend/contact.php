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
require_once __DIR__ . '/services/EmailService.php';

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

/*
|--------------------------------------------------------------------------
| Send confirmation email to the customer
|--------------------------------------------------------------------------
*/

// Escape the customer's name before inserting it into HTML.
$safeName = htmlspecialchars(
    $name,
    ENT_QUOTES | ENT_SUBSTITUTE,
    'UTF-8'
);

$emailSubject = "We've Received Your Message! | Tasty Hub";

$emailHtml = '
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Message Received - Tasty Hub</title>
</head>

<body style="
    margin: 0;
    padding: 0;
    background-color: #f5f5f5;
    font-family: Arial, Helvetica, sans-serif;
    color: #292929;
">

    <div style="
        max-width: 600px;
        margin: 30px auto;
        background-color: #ffffff;
        border-radius: 12px;
        overflow: hidden;
        border: 1px solid #eeeeee;
    ">

        <div style="
            background-color: #ff4400;
            padding: 30px 20px;
            text-align: center;
        ">
            <h1 style="
                margin: 0;
                color: #ffffff;
                font-size: 28px;
            ">
                Tasty Hub
            </h1>

            <p style="
                margin: 8px 0 0;
                color: #ffffff;
                font-size: 14px;
            ">
                Good food. Great moments.
            </p>
        </div>

        <div style="
            padding: 35px 25px;
            line-height: 1.7;
        ">

            <h2 style="
                margin-top: 0;
                color: #ff4400;
                font-size: 23px;
            ">
                We have received your message!
            </h2>

            <p>Hello ' . $safeName . ',</p>

            <p>
                Thank you for reaching out to Tasty Hub.
                We appreciate you taking the time to contact us.
            </p>

            <p>
                This email confirms that we have received your message.
                Our team will review your enquiry and get back to you
                if a response is needed.
            </p>

            <div style="
                margin: 25px 0;
                padding: 18px;
                background-color: #fff4ef;
                border-left: 4px solid #ff4400;
                border-radius: 5px;
            ">
                <p style="
                    margin: 0;
                    font-weight: bold;
                ">
                    Your enquiry type:
                </p>

                <p style="
                    margin: 5px 0 0;
                ">
                    ' . htmlspecialchars(
                        $subject,
                        ENT_QUOTES | ENT_SUBSTITUTE,
                        'UTF-8'
                    ) . '
                </p>
            </div>

            <p>
                If you need to contact us again, simply visit our
                website and send us another message.
            </p>

            <p>
                Thank you for choosing Tasty Hub!
            </p>

            <p style="margin-bottom: 0;">
                Warm regards,<br>
                <strong>The Tasty Hub Team</strong>
            </p>

        </div>

        <div style="
            padding: 18px;
            background-color: #f9f9f9;
            text-align: center;
            border-top: 1px solid #eeeeee;
        ">
            <p style="
                margin: 0;
                color: #777777;
                font-size: 12px;
            ">
                This is an automated confirmation email from Tasty Hub.
            </p>
        </div>

    </div>

</body>
</html>
';

$emailPlainText = "
Hello {$name},

Thank you for reaching out to Tasty Hub.

We have received your message concerning: {$subject}

Our team will review your enquiry and get back to you if a response is needed.

Thank you for choosing Tasty Hub!

Warm regards,
The Tasty Hub Team
";

// Attempt to send the confirmation email.
// Email failure must not undo the successful database submission.
$emailSent = sendTastyHubEmail(
    $email,
    $name,
    $emailSubject,
    $emailHtml,
    $emailPlainText
);

if (!$emailSent) {
    error_log(
        'Tasty Hub: Contact confirmation email could not be sent to ' .
        $email
    );
}

// Return success because the message has already been saved.
respond(201, [
    'success' => true,
    'message' => 'Your message has been received successfully! Thank you for contacting Tasty Hub.'
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