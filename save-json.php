<?php
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $filename = $_GET['filename'] ?? 'data.json';
    $data = file_get_contents('php://input');

    if (json_decode($data) !== null) {
        file_put_contents($filename, $data);
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'error' => 'Invalid JSON']);
    }
} else {
    echo json_encode(['success' => false, 'error' => 'Invalid Request Method']);
}
?>