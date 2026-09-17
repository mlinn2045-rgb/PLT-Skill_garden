<?php
// tests/JwtTest.php

use App\Helpers\JWT;
use PHPUnit\Framework\TestCase;

require_once __DIR__ . '/../config/bootstrap.php';

class JwtTest extends TestCase
{
    private string $secret = 'test_secret_key_12345';

    public function testJwtEncodeAndDecodeSuccess()
    {
        $payload = ['sub' => 'user-uuid-123', 'email' => 'test@example.com'];
        $token = JWT::encode($payload, $this->secret, 3600);

        $this->assertNotEmpty($token);

        $decoded = JWT::decode($token, $this->secret);
        $this->assertNotNull($decoded);
        $this->assertEquals('user-uuid-123', $decoded['sub']);
        $this->assertEquals('test@example.com', $decoded['email']);
    }

    public function testJwtDecodeFailsWithInvalidSecret()
    {
        $payload = ['sub' => 'user-uuid-123'];
        $token = JWT::encode($payload, $this->secret, 3600);

        $decoded = JWT::decode($token, 'wrong_secret');
        $this->assertNull($decoded);
    }

    public function testJwtDecodeFailsWhenExpired()
    {
        $payload = ['sub' => 'user-uuid-123'];
        $token = JWT::encode($payload, $this->secret, -100); // Expired 100 seconds ago

        $decoded = JWT::decode($token, $this->secret);
        $this->assertNull($decoded);
    }
}
