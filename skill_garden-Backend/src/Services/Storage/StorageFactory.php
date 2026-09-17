<?php
// src/Services/Storage/StorageFactory.php

namespace App\Services\Storage;

class StorageFactory
{
    public static function create(): StorageInterface
    {
        $driver = getenv('STORAGE_DRIVER') ?: 'local';

        return match (strtolower($driver)) {
            'local' => new LocalStorageDriver(),
            // Future drivers: 's3' => new S3StorageDriver(), 'cloudinary' => new CloudinaryStorageDriver(),
            default => new LocalStorageDriver(),
        };
    }
}
