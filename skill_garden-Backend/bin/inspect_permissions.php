<?php
require_once __DIR__ . '/../config/bootstrap.php';

$db = Database::getConnection();

echo "=== ADMIN & SUPER_ADMIN USERS ===\n";
$stmt = $db->query("SELECT id, uuid, email, full_name, role FROM users WHERE role IN ('ADMIN', 'SUPER_ADMIN')");
print_r($stmt->fetchAll(PDO::FETCH_ASSOC));

echo "\n=== ADMIN PERMISSIONS ===\n";
$stmt2 = $db->query("SELECT ap.*, u.email FROM admin_permissions ap JOIN users u ON ap.admin_id = u.id");
print_r($stmt2->fetchAll(PDO::FETCH_ASSOC));
