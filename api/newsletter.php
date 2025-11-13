<?php
/**
 * Newsletter Subscription Handler
 * Saves email to JSON file and sends Telegram notification
 */

header('Content-Type: application/json');

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

$emailListFile = __DIR__ . '/../email-list.json';

// Handle delete action (for admin)
if (isset($_GET['action']) && $_GET['action'] === 'delete') {
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);
    
    if (!isset($data['email'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Email required']);
        exit;
    }
    
    // Read existing emails
    $emails = [];
    if (file_exists($emailListFile)) {
        $content = file_get_contents($emailListFile);
        $emails = json_decode($content, true) ?: [];
    }
    
    // Remove email
    $emails = array_filter($emails, function($item) use ($data) {
        $email = is_array($item) ? $item['email'] : $item;
        return $email !== $data['email'];
    });
    
    // Re-index array
    $emails = array_values($emails);
    
    // Save to file
    file_put_contents($emailListFile, json_encode($emails, JSON_PRETTY_PRINT));
    
    echo json_encode(['success' => true, 'message' => 'Email removed']);
    exit;
}

// Handle subscription (normal flow)
// Get and sanitize email
$email = isset($_POST['email']) ? trim($_POST['email']) : '';

// Validation
if (empty($email)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Email is required']);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid email format']);
    exit;
}

// Read existing emails
$emails = [];
if (file_exists($emailListFile)) {
    $content = file_get_contents($emailListFile);
    $emails = json_decode($content, true) ?: [];
}

// Check if email already exists
$emailExists = false;
foreach ($emails as $item) {
    $existingEmail = is_array($item) ? $item['email'] : $item;
    if ($existingEmail === $email) {
        $emailExists = true;
        break;
    }
}

if ($emailExists) {
    echo json_encode([
        'success' => false,
        'message' => 'This email is already subscribed to our newsletter.'
    ]);
    exit;
}

// Add new email
$emails[] = [
    'email' => $email,
    'date' => date('Y-m-d H:i:s')
];

// Save to file
try {
    file_put_contents($emailListFile, json_encode($emails, JSON_PRETTY_PRINT));
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Failed to save email. Please try again later.'
    ]);
    exit;
}

// Send Telegram notification (if config exists)
if (file_exists(__DIR__ . '/../config.php')) {
    require_once __DIR__ . '/../config.php';
    if (function_exists('sendTelegramMessage')) {
        $telegramMessage = "📧 <b>New Newsletter Subscription</b>\n\n";
        $telegramMessage .= "✉️ <b>Email:</b> " . htmlspecialchars($email) . "\n";
        $telegramMessage .= "🕐 <b>Time:</b> " . date('Y-m-d H:i:s') . "\n\n";
        $telegramMessage .= "📊 <b>Total Subscribers:</b> " . count($emails);
        sendTelegramMessage($telegramMessage);
    }
}

// Return success
echo json_encode([
    'success' => true,
    'message' => 'Thank you for subscribing! You\'ll receive updates, lesson notes, and exam tips.'
]);
?>

