<?php
// config/database.php

class Database
{
    private static ?PDO $instance = null;

    public static function getConnection(?array $config = null): PDO
    {
        if (self::$instance === null) {
            if ($config === null) {
                $config = (require __DIR__ . '/config.php')['db'];
            }

            $dsn = sprintf(
                "mysql:host=%s;port=%s;dbname=%s;charset=%s",
                $config['host'],
                $config['port'],
                $config['dbname'],
                $config['charset']
            );

            $options = [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
            ];

            try {
                self::$instance = new PDO($dsn, $config['user'], $config['pass'], $options);
            } catch (PDOException $e) {
                error_log("Database connection failure: " . $e->getMessage());
                throw new Exception("Database connection failure", 500);
            }
        }

        return self::$instance;
    }

    public static function setConnection(PDO $pdo): void
    {
        self::$instance = $pdo;
    }
}
