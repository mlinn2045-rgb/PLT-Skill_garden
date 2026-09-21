<?php
require_once __DIR__ . '/../../config/bootstrap.php';

use App\Middleware\AuthMiddleware;

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$user = AuthMiddleware::authenticate();
$isLmsAdmin = ($user['role'] === 'SUPER_ADMIN')
    || ($user['role'] === 'ADMIN' && (
        str_contains(strtolower($user['email'] ?? ''), 'lms')
        || str_contains(strtolower($user['username'] ?? ''), 'lms')
        || str_contains(strtolower($user['full_name'] ?? ''), 'lms')
        || in_array('MANAGE_LESSONS', $user['permissions'] ?? [])
        || in_array('MANAGE_MATERIALS', $user['permissions'] ?? [])
    ));

if (!$isLmsAdmin) {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Chỉ tài khoản Admin LMS mới có quyền tải tài liệu PDF lên máy chủ.']);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Phương thức không được hỗ trợ.']);
    exit();
}

$fileKey = isset($_FILES['pdf_file']) ? 'pdf_file' : (isset($_FILES['file']) ? 'file' : null);

if (!$fileKey || $_FILES[$fileKey]['error'] !== UPLOAD_ERR_OK) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Vui lòng chọn file PDF hợp lệ từ máy tính.'
    ]);
    exit();
}

$file = $_FILES[$fileKey];
$fileName = $file['name'];
$fileTmpPath = $file['tmp_name'];
$fileSize = $file['size'];

// Allowed extensions
$allowedExtensions = ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'txt'];
$fileExtension = strtolower(pathinfo($fileName, PATHINFO_EXTENSION));

if (!in_array($fileExtension, $allowedExtensions)) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Định dạng file không được hỗ trợ. Chỉ hỗ trợ file PDF, DOC, DOCX, PPT, PPTX, TXT.'
    ]);
    exit();
}

// 100MB Limit check
if ($fileSize > 100 * 1024 * 1024) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Dung lượng file vượt quá giới hạn 100MB.'
    ]);
    exit();
}

// Upload directory setup
$uploadDir = __DIR__ . '/../../public/uploads/pdf/';
if (!file_exists($uploadDir)) {
    mkdir($uploadDir, 0777, true);
}

$newFileName = 'pdf_' . time() . '_' . md5(uniqid()) . '.' . $fileExtension;
$destPath = $uploadDir . $newFileName;

if (move_uploaded_file($fileTmpPath, $destPath)) {
    $protocol = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? 'https' : 'http';
    $host = $_SERVER['HTTP_HOST'] ?? 'localhost:8000';
    $publicUrl = "{$protocol}://{$host}/public/uploads/pdf/{$newFileName}";

    echo json_encode([
        'success' => true,
        'message' => 'Upload file PDF từ máy tính thành công!',
        'url' => $publicUrl,
        'filename' => $newFileName,
        'original_name' => $fileName,
        'size_bytes' => $fileSize
    ]);
} else {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Không thể lưu file PDF lên máy chủ.'
    ]);
}
