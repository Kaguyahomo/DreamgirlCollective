<?php
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $filename = $_GET['filename'] ?? 'data.json';
    $data = file_get_contents('php://input');

    // Validate JSON data
    if (json_decode($data) !== null) {
        if (file_put_contents($filename, $data)) {
            echo json_encode(['success' => true]);
        } else {
            echo json_encode(['success' => false, 'error' => 'Failed to write to file']);
        }
    } else {
        echo json_encode(['success' => false, 'error' => 'Invalid JSON']);
    }
} else {
    echo json_encode(['success' => false, 'error' => 'Invalid request method']);
}
?>