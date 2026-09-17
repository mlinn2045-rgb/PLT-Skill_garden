<?php
// tests/PasswordPolicyTest.php

use App\Services\PasswordPolicyService;
use PHPUnit\Framework\TestCase;

require_once __DIR__ . '/../config/bootstrap.php';

class PasswordPolicyTest extends TestCase
{
    public function testPasswordFailsWithoutSpecialCharacter()
    {
        $result = PasswordPolicyService::validate('Password123');
        $this->assertFalse($result['isValid']);
        $this->assertContains('Mật khẩu phải chứa ít nhất 1 ký tự đặc biệt (!@#$%^&*...).', $result['errors']);
    }

    public function testPasswordFailsWithoutUppercase()
    {
        $result = PasswordPolicyService::validate('password123!');
        $this->assertFalse($result['isValid']);
        $this->assertContains('Mật khẩu phải chứa ít nhất 1 chữ cái viết hoa (A-Z).', $result['errors']);
    }

    public function testPasswordFailsWithoutLowercase()
    {
        $result = PasswordPolicyService::validate('PASSWORD123!');
        $this->assertFalse($result['isValid']);
        $this->assertContains('Mật khẩu phải chứa ít nhất 1 chữ cái viết thường (a-z).', $result['errors']);
    }

    public function testPasswordFailsWithoutDigit()
    {
        $result = PasswordPolicyService::validate('Password!');
        $this->assertFalse($result['isValid']);
        $this->assertContains('Mật khẩu phải chứa ít nhất 1 chữ số (0-9).', $result['errors']);
    }

    public function testPasswordFailsTooShort()
    {
        $result = PasswordPolicyService::validate('Pass1!');
        $this->assertFalse($result['isValid']);
        $this->assertContains('Mật khẩu phải có độ dài tối thiểu 8 ký tự.', $result['errors']);
    }

    public function testPasswordPassesWithAllRequirements()
    {
        $result = PasswordPolicyService::validate('Pass123!@#');
        $this->assertTrue($result['isValid']);
        $this->assertEmpty($result['errors']);
    }
}
