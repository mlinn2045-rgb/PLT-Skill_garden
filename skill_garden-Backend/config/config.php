<?php
// config/config.php

require_once __DIR__ . '/env.php';
Env::load(__DIR__ . '/../.env');

$allowedOriginsEnv = getenv('CORS_ALLOWED_ORIGINS') ?: 'http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000';
$allowedOrigins = array_map('trim', explode(',', $allowedOriginsEnv));

return [
    'app_name' => 'SkillGarden API',
    'app_env' => getenv('APP_ENV') ?: 'development',
    'app_url' => getenv('APP_URL') ?: 'http://localhost:8000',

    'db' => [
        'host' => getenv('DB_HOST') ?: '127.0.0.1',
        'port' => getenv('DB_PORT') ?: '3306',
        'dbname' => getenv('DB_DATABASE') ?: 'skill_garden',
        'user' => getenv('DB_USERNAME') ?: 'root',
        'pass' => getenv('DB_PASSWORD') !== false ? getenv('DB_PASSWORD') : '',
        'charset' => 'utf8mb4',
    ],

    'jwt' => [
        'secret' => getenv('JWT_SECRET') ?: 'skill_garden_secret_key_change_in_production_!@#123',
        'algorithm' => 'HS256',
        'expires_in' => (int) (getenv('JWT_EXPIRES_IN') ?: 86400),
        'cookie_name' => getenv('JWT_COOKIE_NAME') ?: 'skill_garden_token',
        'cookie_path' => '/',
        'cookie_secure' => filter_var(getenv('JWT_COOKIE_SECURE'), FILTER_VALIDATE_BOOLEAN),
        'cookie_httponly' => true,
        'cookie_samesite' => getenv('JWT_COOKIE_SAMESITE') ?: 'Lax',
    ],

    'cors' => [
        'allowed_origins' => $allowedOrigins,
        'allowed_methods' => ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
        'allowed_headers' => ['Content-Type', 'Authorization', 'X-Requested-With'],
    ],

    'auth' => [
        'max_login_attempts' => (int) (getenv('MAX_LOGIN_ATTEMPTS') ?: 5),
        'lockout_duration_seconds' => (int) (getenv('LOCKOUT_DURATION_SECONDS') ?: 900),
    ],

    'ai' => [
        'openrouter_api_key' => getenv('OPENROUTER_API_KEY') ?: '',
        'gemini_api_key' => getenv('GEMINI_API_KEY') ?: '',
        'groq_api_key' => getenv('GROQ_API_KEY') ?: '',
        'gemini_model' => getenv('GEMINI_MODEL') ?: 'gemini-3.1-flash-lite',
        'rate_limit_per_minute' => (int) (getenv('AI_RATE_LIMIT_PER_MINUTE') ?: 20),

        // Phân hệ 1: AI Tutor (Hỏi đáp nhanh bài học - 100% Miễn phí)
        'tutor' => [
            'primary_model' => getenv('AI_TUTOR_PRIMARY_MODEL') ?: 'google/gemini-2.0-flash',
            'fallback_model' => getenv('AI_TUTOR_FALLBACK_MODEL') ?: 'meta-llama/llama-3.3-70b-instruct:free',
            'max_tokens' => 1200,
            'temperature' => 0.7,
            'is_free' => true
        ],

        // Phân hệ 2: AI Hermes (Chuyên sâu bài khó, giải thuật toán, coding - Trừ Credits)
        'hermes' => [
            'default_model' => getenv('AI_HERMES_DEFAULT_MODEL') ?: 'deepseek/deepseek-r1:free',
            'reasoning_model' => 'deepseek/deepseek-r1-distill-llama-70b:free',
            'coding_model' => 'qwen/qwen-2.5-coder-32b-instruct:free',
            'analysis_model' => 'google/gemini-2.0-flash-thinking-exp:free',
            'cost_per_query' => 5, // Trừ 5 credits mỗi câu hỏi
            'max_tokens' => 2500,
            'temperature' => 0.6
        ]
    ]
];

