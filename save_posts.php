<?php
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = file_get_contents('php://input');
    file_put_contents('posts.json', $data);
    echo "Posts saved successfully!";
}
?>
