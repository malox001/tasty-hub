<?php

declare(strict_types=1);

use Dotenv\Dotenv;
use PHPMailer\PHPMailer\PHPMailer;

require_once dirname(__DIR__, 2) . '/vendor/autoload.php';

// Load environment variables from the project root.
$dotenv = Dotenv::createImmutable(dirname(__DIR__, 2));
$dotenv->safeLoad();

// Create and configure PHPMailer.
function createMailer(): PHPMailer
{
    $mail = new PHPMailer(true);
    //$mail->SMTPDebug = 2;
    //$mail->Debugoutput = 'error_log';

    $mail->isSMTP();

    $mail->Host = $_ENV['MAIL_HOST'] ?? '';
    $mail->SMTPAuth = true;

    $mail->Username = $_ENV['MAIL_USERNAME'] ?? '';
    $mail->Password = $_ENV['MAIL_PASSWORD'] ?? '';

    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port = (int) ($_ENV['MAIL_PORT'] ?? 2525);

    $mail->CharSet = PHPMailer::CHARSET_UTF8;

    $mail->setFrom(
        $_ENV['MAIL_FROM_ADDRESS'] ?? '',
        $_ENV['MAIL_FROM_NAME'] ?? 'Tasty Hub'
    );

    return $mail;
}