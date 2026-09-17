<?php
// src/Services/Storage/LocalStorageDriver.php

namespace App\Services\Storage;

use Exception;

class LocalStorageDriver implements StorageInterface
{
    private string $uploadDir;
    private string $baseUrl;

    public function __construct(?string $uploadDir = null, ?string $baseUrl = null)
    {
        $config = require __DIR__ . '/../../../config/config.php';
        $this->uploadDir = $uploadDir ?? (__DIR__ . '/../../../uploads');
        $this->baseUrl = $baseUrl ?? (($config['app_url'] ?? 'http://localhost:8000') . '/uploads');

        if (!file_exists($this->uploadDir)) {
            mkdir($this->uploadDir, 0777, true);
        }
    }

    public function upload(array $file, string $folder = 'uploads'): string
    {
        if (!isset($file['tmp_name']) || empty($file['tmp_name']) || !is_uploaded_file($file['tmp_name'])) {
            throw new Exception("File tải lên không hợp lệ.", 400);
        }

        $targetFolder = $this->uploadDir . '/' . trim($folder, '/');
        if (!file_exists($targetFolder)) {
            mkdir($targetFolder, 0777, true);
        }

        $extension = pathinfo($file['name'] ?? '', PATHINFO_EXTENSION);
        $allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp', 'pdf', 'doc', 'docx', 'zip', 'mp4'];
        $extLower = strtolower($extension);

        if (!empty($extension) && !in_array($extLower, $allowedExtensions, true)) {
            throw new Exception("Định dạng file '.{$extension}' không được hỗ trợ.", 400);
        }

        $fileName = time() . '_' . bin2hex(random_bytes(6)) . '.' . ($extLower ?: 'bin');
        $destination = $targetFolder . '/' . $fileName;

        if (!move_uploaded_file($file['tmp_name'], $destination)) {
            throw new Exception("Lỗi khi lưu file tải lên.", 500);
        }

        return $this->baseUrl . '/' . trim($folder, '/') . '/' . $fileName;
    }

    public function delete(string $fileUrl): bool
    {
        if (empty($fileUrl)) {
            return false;
        }

        $relativePath = str_replace($this->baseUrl, '', $fileUrl);
        $fullPath = $this->uploadDir . '/' . ltrim($relativePath, '/');

        if (file_exists($fullPath) && is_file($fullPath)) {
            return unlink($fullPath);
        }

        return false;
    }
}
