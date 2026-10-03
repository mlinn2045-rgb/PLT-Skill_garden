<?php
// api/ai-hermes/deposit-confirm.php
// Confirm VietQR Payment & Credit Hermes Wallet

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

$orderCode = !empty($input['orderCode']) ? (int)$input['orderCode'] : null;
$packageId = trim($input['packageId'] ?? '');

if (!$orderCode || empty($packageId)) {
    Response::error("Thiếu mã đơn hàng hoặc gói nạp.", 400);
}

$db = Database::getConnection();

// Check if order already processed (Idempotency Guard)
$chkStmt = $db->prepare("SELECT id FROM ai_credit_transactions WHERE order_code = :ord LIMIT 1");
$chkStmt->execute(['ord' => $orderCode]);
if ($chkStmt->fetch()) {
    $aiService = new AIService();
    $currentBal = $aiService->getUserCredits($userId);
    Response::success([
        'alreadyProcessed' => true,
        'newBalance' => $currentBal
    ], "Giao dịch đã được xử lý trước đó.");
}

// Find package
$pkgStmt = $db->prepare("SELECT * FROM ai_credit_packages WHERE id = :id AND is_active = 1 LIMIT 1");
$pkgStmt->execute(['id' => $packageId]);
$package = $pkgStmt->fetch(PDO::FETCH_ASSOC);

if (!$package) {
    Response::error("Gói nạp credits không hợp lệ.", 404);
}

$totalCredits = (int)$package['credits'] + (int)$package['bonus_credits'];
$desc = "Nạp thành công " . $package['name'] . " (+{$totalCredits} Credits)";

$aiService = new AIService();
$newBalance = $aiService->addCredits($userId, $totalCredits, $desc, $orderCode);

Response::success([
    'newBalance' => $newBalance,
    'creditsAdded' => $totalCredits,
    'orderCode' => $orderCode,
    'package' => $package['name']
], "Nạp Credits thành công! Tài khoản đã được cộng {$totalCredits} Credits.");
