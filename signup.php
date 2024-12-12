<?php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require 'vendor/autoload.php';

header('Content-Type: application/json');

// Parse input data
$data = json_decode(file_get_contents('php://input'), true);
$phoneNumber = $data['phoneNumber'];
$carrierEmail = $data['carrierEmail'];

$emailTo = $phoneNumber . $carrierEmail;
$subject = "Weekly Vocab Quiz Alerts";
$message = "You have successfully signed up for Weekly Vocab Quiz notifications!";

// PHPMailer setup
$mail = new PHPMailer(true);

try {
    // SMTP settings
    $mail->isSMTP();
    $mail->Host = 'smtp.gmail.com'; // Replace with your SMTP server
    $mail->SMTPAuth = true;
    $mail->Username = 'your-email@gmail.com'; // Replace with your email
    $mail->Password = 'your-email-password'; // Replace with your email password
    $mail->SMTPSecure = 'tls';
    $mail->Port = 587;

    // Email settings
    $mail->setFrom('no-reply@yourdomain.com', 'Weekly Vocab Quiz');
    $mail->addAddress($emailTo);
    $mail->Subject = $subject;
    $mail->Body = $message;

    $mail->send();
    echo json_encode(['success' => true]);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => $mail->ErrorInfo]);
}
?>