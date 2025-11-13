<?php
/**
 * Visitor Tracker API
 * Saves visitor data to visitors.json
 */

header('Content-Type: application/json');

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

$visitorsFile = __DIR__ . '/../visitors.json';

// Get JSON input
$input = file_get_contents('php://input');
$data = json_decode($input, true);

if (!$data) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid data']);
    exit;
}

// Read existing visitors
$visitors = [];
if (file_exists($visitorsFile)) {
    $content = file_get_contents($visitorsFile);
    $visitors = json_decode($content, true) ?: [];
}

// Add new visitor
$visitors[] = $data;

// Keep only last 1000 visitors to prevent file from growing too large
if (count($visitors) > 1000) {
    $visitors = array_slice($visitors, -1000);
}

// Save to JSON file
try {
    $json = json_encode($visitors, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    
    if (file_put_contents($visitorsFile, $json) === false) {
        throw new Exception('Failed to write to file');
    }
    
    echo json_encode(['success' => true]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error saving visitor data: ' . $e->getMessage()
    ]);
}
?>

