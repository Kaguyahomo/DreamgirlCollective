<?php
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = file_get_contents('php://input');
    if (!$data) {
        http_response_code(400);
        echo json_encode(['error' => 'No data received.']);
        exit;
    }

    $file = 'posts.json';
    if (!file_put_contents($file, $data)) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to save posts.']);
        exit;
    }

    echo json_encode(['success' => true, 'message' => 'Posts saved successfully!']);
    exit;
}
?>
