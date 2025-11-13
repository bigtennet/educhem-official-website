<?php
/**
 * Resources API - CRUD Operations
 * Handles saving resources to JSON file
 */

header('Content-Type: application/json');

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

$resourcesFile = __DIR__ . '/../resources.json';

// Get JSON input
$input = file_get_contents('php://input');
$data = json_decode($input, true);

if (!isset($data['action']) || $data['action'] !== 'save') {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid action']);
    exit;
}

if (!isset($data['resources']) || !is_array($data['resources'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid resources data']);
    exit;
}

// Validate resources data
foreach ($data['resources'] as $resource) {
    if (!isset($resource['id']) || !isset($resource['title']) || !isset($resource['category'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Invalid resource data']);
        exit;
    }
}

// Save to JSON file
try {
    $json = json_encode($data['resources'], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    
    if (file_put_contents($resourcesFile, $json) === false) {
        throw new Exception('Failed to write to file');
    }
    
    echo json_encode([
        'success' => true,
        'message' => 'Resources saved successfully',
        'count' => count($data['resources'])
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error saving resources: ' . $e->getMessage()
    ]);
}
?>

