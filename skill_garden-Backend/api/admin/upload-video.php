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
));

if (!$isLmsAdmin) {
http_response_code(403);
echo json_encode(['success' => false, 'message' => 'Chỉ tài khoản Admin LMS mới có quyền tải video lên máy chủ.']);
exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
http_response_code(405);
echo json_encode(['success' => false, 'message' => 'Phương thức không được hỗ trợ.']);
exit();
}

if (!isset($_FILES['video_file']) || $_FILES['video_file']['error'] !== UPLOAD_ERR_OK) {
http_response_code(400);
echo json_encode([
'success' => false,
'message' => 'Vui lòng chọn file video hợp lệ từ máy tính.'
]);
exit();
}

$file = $_FILES['video_file'];
$fileName = $file['name'];
$fileTmpPath = $file['tmp_name'];
$fileSize = $file['size'];
$fileType = $file['type'];

// Allowed extensions
$allowedExtensions = ['mp4', 'webm', 'mkv', 'mov', 'avi'];
$fileExtension = strtolower(pathinfo($fileName, PATHINFO_EXTENSION));

if (!in_array($fileExtension, $allowedExtensions)) {
http_response_code(400);
echo json_encode([
'success' => false,
'message' => 'Định dạng video không được hỗ trợ. Chỉ hỗ trợ MP4, WebM, MKV, MOV, AVI.'
]);
exit();
}

// 500MB Max limit check
if ($fileSize > 500 * 1024 * 1024) {
http_response_code(400);
echo json_encode([
'success' => false,
'message' => 'Dung lượng file video vượt quá giới hạn 500MB.'
]);
exit();
}

// Upload directory setup
$uploadDir = __DIR__ . '/../../public/uploads/videos/';
if (!file_exists($uploadDir)) {
mkdir($uploadDir, 0777, true);
}

$newFileName = 'vid_' . time() . '_' . md5(uniqid()) . '.' . $fileExtension;
$destPath = $uploadDir . $newFileName;

if (move_uploaded_file($fileTmpPath, $destPath)) {
// Generate public accessible URL
$protocol = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? 'https' : 'http';
$host = $_SERVER['HTTP_HOST'] ?? 'localhost:8000';
$publicUrl = "{$protocol}://{$host}/uploads/videos/{$newFileName}";

echo json_encode([
'success' => true,
'message' => 'Upload video từ máy tính thành công!',
'url' => $publicUrl,
'filename' => $newFileName,
'original_name' => $fileName,
'size_bytes' => $fileSize
]);
} else {
http_response_code(500);
echo json_encode([
'success' => false,
'message' => 'Không thể lưu file video lên máy chủ.'
]);
}