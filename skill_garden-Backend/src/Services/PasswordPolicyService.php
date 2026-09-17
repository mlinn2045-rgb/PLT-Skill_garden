<?php
// src/Services/PasswordPolicyService.php

namespace App\Services;

class PasswordPolicyService
{
    public const MIN_LENGTH = 8;
    public const SPECIAL_CHARS_REGEX = '/[!@#$%^&*()_+\-=\[\]{};\':"\\\\|,.<>\/?]/';
    public const OFFICIAL_REGEX = '/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};\':"\\\\|,.<>\/?]).{8,}$/';

    public static function validate(string $password): array
    {
        $errors = [];

        if (mb_strlen($password) < self::MIN_LENGTH) {
            $errors[] = 'Mật khẩu phải có độ dài tối thiểu ' . self::MIN_LENGTH . ' ký tự.';
        }

        if (!preg_match('/[A-Z]/', $password)) {
            $errors[] = 'Mật khẩu phải chứa ít nhất 1 chữ cái viết hoa (A-Z).';
        }

        if (!preg_match('/[a-z]/', $password)) {
            $errors[] = 'Mật khẩu phải chứa ít nhất 1 chữ cái viết thường (a-z).';
        }

        if (!preg_match('/[0-9]/', $password)) {
            $errors[] = 'Mật khẩu phải chứa ít nhất 1 chữ số (0-9).';
        }

        if (!preg_match(self::SPECIAL_CHARS_REGEX, $password)) {
            $errors[] = 'Mật khẩu phải chứa ít nhất 1 ký tự đặc biệt (!@#$%^&*...).';
        }

        return [
            'isValid' => empty($errors),
            'errors' => $errors,
        ];
    }
}
