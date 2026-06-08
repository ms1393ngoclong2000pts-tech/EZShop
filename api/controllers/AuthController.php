<?php
// controllers/AuthController.php

require_once __DIR__ . '/../helpers/AuthHelper.php';

class AuthController {
    private $pdo;

    public function __construct($pdo) {
        $this->pdo = $pdo;
    }

    /**
     * Đăng ký tài khoản mới
     */
    public function register($data) {
        if (empty($data['name']) || empty($data['email']) || empty($data['password'])) {
            http_response_code(400);
            return ['status' => 'error', 'message' => 'Vui lòng nhập đầy đủ họ tên, email và mật khẩu.'];
        }

        $name = trim($data['name']);
        $email = trim($data['email']);
        $password = $data['password'];

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            http_response_code(400);
            return ['status' => 'error', 'message' => 'Email không hợp lệ.'];
        }

        if (strlen($password) < 6) {
            http_response_code(400);
            return ['status' => 'error', 'message' => 'Mật khẩu phải từ 6 ký tự trở lên.'];
        }

        // Kiểm tra email tồn tại
        $stmt = $this->pdo->prepare("SELECT id FROM users WHERE email = ?");
        $stmt->execute([$email]);
        if ($stmt->fetch()) {
            http_response_code(409);
            return ['status' => 'error', 'message' => 'Email này đã được sử dụng.'];
        }

        // Mã hóa mật khẩu
        $hashedPassword = password_hash($password, PASSWORD_DEFAULT);

        // Lưu người dùng (mặc định role là customer)
        $stmt = $this->pdo->prepare("INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, 'customer')");
        $stmt->execute([$name, $email, $hashedPassword]);
        
        $userId = $this->pdo->lastInsertId();
        $token = AuthHelper::generateToken($userId, 'customer');

        return [
            'status' => 'success',
            'message' => 'Đăng ký tài khoản thành công.',
            'token' => $token,
            'user' => [
                'id' => $userId,
                'name' => $name,
                'email' => $email,
                'role' => 'customer',
                'avatar' => null
            ]
        ];
    }

    /**
     * Đăng nhập
     */
    public function login($data) {
        if (empty($data['email']) || empty($data['password'])) {
            http_response_code(400);
            return ['status' => 'error', 'message' => 'Vui lòng nhập email và mật khẩu.'];
        }

        $email = trim($data['email']);
        $password = $data['password'];

        // Lấy thông tin user
        $stmt = $this->pdo->prepare("SELECT * FROM users WHERE email = ?");
        $stmt->execute([$email]);
        $user = $stmt->fetch();

        if (!$user || !password_verify($password, $user['password'])) {
            http_response_code(401);
            return ['status' => 'error', 'message' => 'Email hoặc mật khẩu không chính xác.'];
        }

        $token = AuthHelper::generateToken($user['id'], $user['role']);

        return [
            'status' => 'success',
            'message' => 'Đăng nhập thành công.',
            'token' => $token,
            'user' => [
                'id' => $user['id'],
                'name' => $user['name'],
                'email' => $user['email'],
                'role' => $user['role'],
                'avatar' => $user['avatar'] ?? null
            ]
        ];
    }

    /**
     * Lấy thông tin user đăng đăng nhập bằng Token
     */
    public function me() {
        $currentUser = AuthHelper::getCurrentUser();
        if (!$currentUser) {
            http_response_code(401);
            return ['status' => 'error', 'message' => 'Phiên đăng nhập đã hết hạn hoặc không hợp lệ.'];
        }

        $stmt = $this->pdo->prepare("SELECT id, name, email, role, avatar FROM users WHERE id = ?");
        $stmt->execute([$currentUser['id']]);
        $user = $stmt->fetch();

        if (!$user) {
            http_response_code(404);
            return ['status' => 'error', 'message' => 'Không tìm thấy người dùng.'];
        }

        return [
            'status' => 'success',
            'user' => $user
        ];
    }

    /**
     * Cập nhật thông tin cá nhân của người dùng
     */
    public function updateProfile($data) {
        $currentUser = AuthHelper::getCurrentUser();
        if (!$currentUser) {
            http_response_code(401);
            return ['status' => 'error', 'message' => 'Bạn cần đăng nhập để thực hiện tác vụ này.'];
        }

        if (empty($data['name']) || empty($data['email'])) {
            http_response_code(400);
            return ['status' => 'error', 'message' => 'Họ tên và email không được để trống.'];
        }

        $name = trim($data['name']);
        $email = trim($data['email']);
        $password = isset($data['password']) ? $data['password'] : '';

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            http_response_code(400);
            return ['status' => 'error', 'message' => 'Email không hợp lệ.'];
        }

        // Kiểm tra xem email có bị trùng với người khác không
        $stmt = $this->pdo->prepare("SELECT id FROM users WHERE email = ? AND id != ?");
        $stmt->execute([$email, $currentUser['id']]);
        if ($stmt->fetch()) {
            http_response_code(409);
            return ['status' => 'error', 'message' => 'Email này đã được tài khoản khác sử dụng.'];
        }

        // Bắt đầu cập nhật
        if (!empty($password)) {
            if (strlen($password) < 6) {
                http_response_code(400);
                return ['status' => 'error', 'message' => 'Mật khẩu mới phải từ 6 ký tự trở lên.'];
            }
            $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
            $stmt = $this->pdo->prepare("UPDATE users SET name = ?, email = ?, password = ? WHERE id = ?");
            $stmt->execute([$name, $email, $hashedPassword, $currentUser['id']]);
        } else {
            $stmt = $this->pdo->prepare("UPDATE users SET name = ?, email = ? WHERE id = ?");
            $stmt->execute([$name, $email, $currentUser['id']]);
        }

        return [
            'status' => 'success',
            'message' => 'Cập nhật thông tin tài khoản thành công.'
        ];
    }
}
