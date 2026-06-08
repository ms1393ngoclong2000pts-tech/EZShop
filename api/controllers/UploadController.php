<?php
// controllers/UploadController.php

require_once __DIR__ . '/../helpers/AuthHelper.php';

class UploadController {
    private $pdo;
    private $uploadDir;
    private $allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    private $maxFileSize = 5 * 1024 * 1024; // 5MB

    public function __construct($pdo) {
        $this->pdo = $pdo;
        $this->uploadDir = __DIR__ . '/../uploads/';
    }

    /**
     * Upload ảnh sản phẩm (Admin only)
     */
    public function uploadProductImage() {
        // Kiểm tra quyền Admin
        $currentUser = AuthHelper::getCurrentUser();
        if (!$currentUser || $currentUser['role'] !== 'admin') {
            http_response_code(403);
            return ['status' => 'error', 'message' => 'Chỉ admin mới có quyền upload ảnh sản phẩm.'];
        }

        return $this->handleUpload('products');
    }

    /**
     * Upload ảnh đại diện (User tự upload cho chính mình)
     */
    public function uploadAvatar() {
        $currentUser = AuthHelper::getCurrentUser();
        if (!$currentUser) {
            http_response_code(401);
            return ['status' => 'error', 'message' => 'Bạn cần đăng nhập để upload ảnh đại diện.'];
        }

        $result = $this->handleUpload('avatars');

        if ($result['status'] === 'success') {
            // Cập nhật avatar vào DB
            $stmt = $this->pdo->prepare("UPDATE users SET avatar = ? WHERE id = ?");
            $stmt->execute([$result['url'], $currentUser['id']]);
            $result['message'] = 'Cập nhật ảnh đại diện thành công.';
        }

        return $result;
    }

    /**
     * Xử lý upload file chung
     */
    private function handleUpload($subfolder) {
        if (!isset($_FILES['image']) || $_FILES['image']['error'] !== UPLOAD_ERR_OK) {
            $errorMsg = 'Không tìm thấy file ảnh.';
            if (isset($_FILES['image'])) {
                switch ($_FILES['image']['error']) {
                    case UPLOAD_ERR_INI_SIZE:
                    case UPLOAD_ERR_FORM_SIZE:
                        $errorMsg = 'File ảnh quá lớn (tối đa 5MB).';
                        break;
                    case UPLOAD_ERR_NO_FILE:
                        $errorMsg = 'Không có file nào được chọn.';
                        break;
                }
            }
            http_response_code(400);
            return ['status' => 'error', 'message' => $errorMsg];
        }

        $file = $_FILES['image'];

        // Kiểm tra loại file
        $finfo = new finfo(FILEINFO_MIME_TYPE);
        $mimeType = $finfo->file($file['tmp_name']);
        if (!in_array($mimeType, $this->allowedTypes)) {
            http_response_code(400);
            return ['status' => 'error', 'message' => 'Chỉ chấp nhận file ảnh (JPG, PNG, GIF, WebP).'];
        }

        // Kiểm tra kích thước
        if ($file['size'] > $this->maxFileSize) {
            http_response_code(400);
            return ['status' => 'error', 'message' => 'File ảnh quá lớn, tối đa 5MB.'];
        }

        // Tạo tên file duy nhất
        $ext = pathinfo($file['name'], PATHINFO_EXTENSION);
        if (empty($ext)) {
            $extMap = ['image/jpeg' => 'jpg', 'image/png' => 'png', 'image/gif' => 'gif', 'image/webp' => 'webp'];
            $ext = $extMap[$mimeType] ?? 'jpg';
        }
        $filename = uniqid() . '_' . time() . '.' . $ext;
        $targetDir = $this->uploadDir . $subfolder . '/';
        $targetPath = $targetDir . $filename;

        // Đảm bảo thư mục tồn tại
        if (!is_dir($targetDir)) {
            mkdir($targetDir, 0755, true);
        }

        // Di chuyển file
        if (!move_uploaded_file($file['tmp_name'], $targetPath)) {
            http_response_code(500);
            return ['status' => 'error', 'message' => 'Không thể lưu file, vui lòng thử lại.'];
        }

        // Trả về URL tương đối
        $url = '/api/uploads/' . $subfolder . '/' . $filename;

        return [
            'status' => 'success',
            'message' => 'Upload ảnh thành công.',
            'url' => $url,
            'filename' => $filename
        ];
    }
}
