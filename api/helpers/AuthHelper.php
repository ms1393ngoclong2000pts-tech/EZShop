<?php
// helpers/AuthHelper.php

class AuthHelper {
    private static $secret = 'ecommerce-secret-key-998877';

    /**
     * Tạo token từ payload
     */
    public static function generateToken($userId, $role) {
        $payload = [
            'id' => $userId,
            'role' => $role,
            'exp' => time() + (86400 * 7) // Hạn dùng 7 ngày
        ];
        
        $jsonPayload = json_encode($payload);
        $encodedPayload = base64_encode($jsonPayload);
        $signature = hash_hmac('sha256', $encodedPayload, self::$secret);
        
        return $encodedPayload . '.' . $signature;
    }

    /**
     * Xác thực token và trả về payload nếu hợp lệ
     */
    public static function verifyToken($token) {
        if (!$token) return false;
        
        $parts = explode('.', $token);
        if (count($parts) !== 2) return false;
        
        list($encodedPayload, $signature) = $parts;
        
        // Kiểm tra chữ ký
        $expectedSignature = hash_hmac('sha256', $encodedPayload, self::$secret);
        if (!hash_equals($expectedSignature, $signature)) {
            return false;
        }
        
        $jsonPayload = base64_decode($encodedPayload);
        $payload = json_decode($jsonPayload, true);
        
        if (!$payload) return false;
        
        // Kiểm tra hết hạn
        if (isset($payload['exp']) && $payload['exp'] < time()) {
            return false;
        }
        
        return $payload;
    }

    public static function getBearerToken() {
        $authorization = null;
        if (isset($_SERVER['HTTP_AUTHORIZATION'])) {
            $authorization = $_SERVER['HTTP_AUTHORIZATION'];
        } elseif (isset($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
            $authorization = $_SERVER['REDIRECT_HTTP_AUTHORIZATION'];
        } elseif (function_exists('getallheaders')) {
            $headers = getallheaders();
            if (isset($headers['Authorization'])) {
                $authorization = $headers['Authorization'];
            } elseif (isset($headers['authorization'])) {
                $authorization = $headers['authorization'];
            }
        }
        
        if ($authorization) {
            if (preg_match('/Bearer\s(\S+)/', $authorization, $matches)) {
                return $matches[1];
            }
        }
        return null;
    }

    /**
     * Lấy thông tin user hiện tại nếu token hợp lệ
     */
    public static function getCurrentUser() {
        $token = self::getBearerToken();
        if (!$token) return null;
        return self::verifyToken($token);
    }
}
