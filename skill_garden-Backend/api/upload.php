<?php
// api/upload.php

require_once __DIR__ . '/../config/bootstrap.php';

use App\Helpers\Response;
use App\Middleware\AuthMiddleware;
use App\Services\Storage\StorageFactory;

$user = AuthMiddleware::authenticate();
$method = $_SERVER['REQUEST_METHOD'];

try {
    if ($method === 'POST') {
        if (empty($_FILES['file'])) {
            Response::error("Vui lòng đính kèm file cần tải lên (field name: 'file').", 400);
        }

        $folder = $_POST['folder'] ?? 'general';
        // Sanitize folder path
        $folder = preg_replace('/[^a-zA-Z0-9_-]/', '', $folder);

        $storage = StorageFactory::create();
        $fileUrl = $storage->upload($_FILES['file'], $folder);

        Response::success([
            'url' => $fileUrl,
            'original_name' => $_FILES['file']['name'],
            'size' => $_FILES['file']['size'],
            'mime_type' => $_FILES['file']['type'],
        ], "Tải lên tệp thành công!", 201);
    }

    Response::error("Method not allowed", 405);
} catch (Exception $e) {
    Response::error($e->getMessage(), $e->getCode() >= 400 && $e->getCode() < 600 ? $e->getCode() : 400);
}
