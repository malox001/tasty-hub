<?php

declare(strict_types=1);

require_once dirname(__DIR__) . '/config/mail.php';

/**
 * Send an HTML email with a plain-text alternative.
 *
 * Returns true when the SMTP server accepts the message.
 * Logs technical failures without exposing credentials.
 */
function sendTastyHubEmail(
    string $recipientEmail,
    string $recipientName,
    string $subject,
    string $htmlBody,
    string $plainTextBody
): bool {
    try {
        $mail = createMailer();

        $mail->addAddress($recipientEmail, $recipientName);

        $mail->isHTML(true);
        $mail->Subject = $subject;
        $mail->Body = $htmlBody;
        $mail->AltBody = $plainTextBody;

        return $mail->send();

    } catch (\Throwable $exception) {
        error_log(
            'Tasty Hub email delivery error: ' .
            $exception->getMessage()
        );

        return false;
    }
}