<?php

declare(strict_types=1);

require_once __DIR__ . '/backend/services/EmailService.php';

header('Content-Type: text/plain; charset=utf-8');

$recipientEmail = 'tastyhubtaste@gmail.com';
$recipientName = 'Tasty Hub Test Recipient';

$subject = 'Tasty Hub Email System Test';

$htmlBody = '
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tasty Hub Email Test</title>
</head>
<body style="margin:0; padding:30px 15px; background:#f5f5f5; font-family:Arial,sans-serif; color:#222;">

    <div style="max-width:560px; margin:0 auto; background:#ffffff; border-radius:12px; overflow:hidden;">

        <div style="background:#ff4400; padding:25px; text-align:center;">
            <h1 style="margin:0; color:#ffffff; font-size:27px;">Tasty Hub</h1>
            <p style="margin:8px 0 0; color:#ffffff;">Good Food. Great Moments.</p>
        </div>

        <div style="padding:30px;">
            <h2 style="margin-top:0;">Email Test Successful! 🎉</h2>

            <p>Hello there,</p>

            <p>
                This is a test email from Tasty Hub.
                We are setting up our automated email system
                to keep customers informed and connected.
            </p>

            <p>
                Soon, this system will support contact confirmations,
                welcome emails, account verification, and order updates.
            </p>

            <p>Thank you for being part of our journey!</p>

            <p style="margin-bottom:0;">
                Warm regards,<br>
                <strong>The Tasty Hub Team</strong>
            </p>
        </div>

        <div style="padding:18px; background:#f8f8f8; text-align:center; color:#777; font-size:12px;">
            This is a test message from the Tasty Hub development environment.
        </div>

    </div>

</body>
</html>
';

$plainTextBody = "Tasty Hub Email System Test\n\n"
    . "Hello there,\n\n"
    . "This is a test email from Tasty Hub.\n"
    . "Our automated email system is being configured.\n\n"
    . "Warm regards,\n"
    . "The Tasty Hub Team";

if (
    !filter_var($recipientEmail, FILTER_VALIDATE_EMAIL)
) {
    http_response_code(400);
    exit('The test recipient email address is invalid.');
}

if (sendTastyHubEmail(
    $recipientEmail,
    $recipientName,
    $subject,
    $htmlBody,
    $plainTextBody
)) {
    echo "SUCCESS: The SMTP server accepted the test email.\n";
    echo "Recipient: " . $recipientEmail . "\n";
    echo "Check your inbox and spam folder.";
} else {
    http_response_code(500);
    echo "FAILED: Tasty Hub could not send the test email.\n";
    echo "Check the PHP error log for technical details.";
}