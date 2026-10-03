<?php
// api/ai-hermes/wallet.php
// Get Hermes Credit Wallet Balance, Packages & Transactions

require_once __DIR__ . '/../../config/bootstrap.php';

use App\Helpers\Response;
use App\Middleware\AuthMiddleware;
use App\Services\AIService;

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    Response::error("Method not allowed", 405);
}

$user = AuthMiddleware::authenticate();
$userId = (int)$user['id'];

$aiService = new AIService();

$credits = $aiService->getUserCredits($userId);
$packages = $aiService->getCreditPackages();
$transactions = $aiService->getCreditTransactions($userId, 15);

Response::success([
    'credits' => $credits,
    'packages' => $packages,
    'transactions' => $transactions,
    'merchantBank' => [
        'bankName' => 'Vietcombank',
        'accountNumber' => '1031174223',
        'accountHolder' => 'NGUYEN HOANG ANH KHOA'
    ]
], "Lấy thông tin ví Credits thành công.");
