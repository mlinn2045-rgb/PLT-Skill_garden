<?php
// src/Helpers/Validator.php

namespace App\Helpers;

class Validator
{
    public static function isEmail(string $email): bool
    {
        return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
    }

    public static function validateRequired(array $data, array $fields): array
    {
        $missing = [];
        foreach ($fields as $field) {
            if (!isset($data[$field]) || trim((string) $data[$field]) === '') {
                $missing[] = $field;
            }
        }
        return $missing;
    }

    public static function sanitizeString(string $input): string
    {
        return trim($input);
    }
}
