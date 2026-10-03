<?php
require_once __DIR__ . '/../config/bootstrap.php';

$db = Database::getConnection();
$admins = $db->query("SELECT id FROM users WHERE role = 'ADMIN'")->fetchAll(PDO::FETCH_COLUMN);

$perms = [
    'MANAGE_USERS', 'MANAGE_SKILLS', 'MANAGE_LESSONS', 'MANAGE_QUIZZES',
    'MANAGE_MATERIALS', 'MANAGE_PLANTS', 'MANAGE_ACHIEVEMENTS', 'MANAGE_GAMIFICATION'
];

$stmt = $db->prepare("INSERT IGNORE INTO admin_permissions (admin_id, permission_key) VALUES (:admin_id, :perm_key)");

$count = 0;
foreach ($admins as $aid) {
    foreach ($perms as $p) {
        $stmt->execute(['admin_id' => $aid, 'perm_key' => $p]);
        $count++;
    }
}

echo "Successfully ensured permissions for " . count($admins) . " admins ($count checks).\n";
