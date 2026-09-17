<?php
// src/Helpers/Response.php

namespace App\Helpers;

class Response
{
    public static function handleCors(array $config): void
    {
        $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
        $allowedOrigins = $config['cors']['allowed_origins'] ?? [];

        if (in_array($origin, $allowedOrigins, true)) {
            header("Access-Control-Allow-Origin: $origin");
            header("Access-Control-Allow-Credentials: true");
        }

        header("Access-Control-Allow-Methods: " . implode(', ', $config['cors']['allowed_methods'] ?? ['GET', 'POST', 'OPTIONS']));
        header("Access-Control-Allow-Headers: " . implode(', ', $config['cors']['allowed_headers'] ?? ['Content-Type', 'Authorization']));

        if (isset($_SERVER['REQUEST_METHOD']) && $_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            http_response_code(204);
            exit(0);
        }
    }

    public static function json(array $data, int $statusCode = 200): void
    {
        http_response_code($statusCode);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        exit(0);
    }

    public static function error(string $message, int $statusCode = 400, array $errors = []): void
    {
        $response = [
            'success' => false,
            'message' => $message,
        ];
        if (!empty($errors)) {
            $response['errors'] = $errors;
        }
        self::json($response, $statusCode);
    }

    public static function success(mixed $data = [], string $message = 'Success', int $statusCode = 200): void
    {
        self::json([
            'success' => true,
            'message' => $message,
            'data' => $data,
        ], $statusCode);
    }
}
