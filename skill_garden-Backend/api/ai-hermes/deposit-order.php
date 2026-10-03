<?php
// api/ai-hermes/deposit-order.php
// Create VietQR Deposit Order for Hermes Credits

require_once __DIR__ . '/../../config/bootstrap.php';

use App\Helpers\Response;
use App\Middleware\AuthMiddleware;
use App\Services\AIService;

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    Response::error("Method not allowed", 405);
}

$user = AuthMiddleware::authenticate();
$userId = (int)$user['id'];

$rawBody = file_get_contents('php://input');
$input = json_decode($rawBody, true);

$packageId = trim($input['packageId'] ?? 'PKG_20K');

$db = Database::getConnection();
$stmt = $db->prepare("SELECT * FROM ai_credit_packages WHERE id = :id AND is_active = 1 LIMIT 1");
$stmt->execute(['id' => $packageId]);
$package = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$package) {
    Response::error("Gói nạp credits không tồn tại hoặc đã tạm dừng.", 404);
}

$orderCode = time() . rand(100, 999);
$description = "HM" . substr($orderCode, -6);
$amount = (int)$package['price_vnd'];
$totalCredits = (int)$package['credits'] + (int)$package['bonus_credits'];

// Official Merchant Bank Account (Vietcombank)
$bankBin = '970436';
$bankName = 'Vietcombank';
$accountNumber = '1031174223';
$accountName = 'NGUYEN HOANG ANH KHOA';

$encodedDesc = urlencode($description);
$encodedName = urlencode($accountName);
$qrImageUrl = "https://img.vietqr.io/image/{$bankBin}-{$accountNumber}-compact2.png?amount={$amount}&addInfo={$encodedDesc}&accountName={$encodedName}";

Response::success([
    'orderCode' => $orderCode,
    'description' => $description,
    'amount' => $amount,
    'package' => [
        'id' => $package['id'],
        'name' => $package['name'],
        'credits' => (int)$package['credits'],
        'bonusCredits' => (int)$package['bonus_credits'],
        'totalCredits' => $totalCredits
    ],
    'bank' => [
        'bankName' => $bankName,
        'bankBin' => $bankBin,
        'accountNumber' => $accountNumber,
        'accountName' => $accountName
    ],
    'qrImageUrl' => $qrImageUrl,
    'expiresAt' => time() + 900 // 15 minutes
], "Khởi tạo đơn nạp Credits thành công.");
