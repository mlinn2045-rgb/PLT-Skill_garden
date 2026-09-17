<?php
// src/Services/Storage/StorageInterface.php

namespace App\Services\Storage;

interface StorageInterface
{
    /**
     * Upload a file and return the public URL or relative path.
     * 
     * @param array $file $_FILES['input_name'] array structure or [ 'tmp_name' => ..., 'name' => ..., 'type' => ..., 'size' => ... ]
     * @param string $folder Target subfolder, e.g., 'avatars', 'plants', 'materials'
     * @return string Public URL of the uploaded file
     */
    public function upload(array $file, string $folder = 'uploads'): string;

    /**
     * Delete a file given its URL or relative path.
     * 
     * @param string $fileUrl
     * @return bool
     */
    public function delete(string $fileUrl): bool;
}
