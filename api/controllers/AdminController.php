<?php
// controllers/AdminController.php

require_once __DIR__ . '/../helpers/AuthHelper.php';

class AdminController {
    private $pdo;

    public function __construct($pdo) {
        $this->pdo = $pdo;
        $this->checkAdminAccess();
    }

    /**
     * Kiểm tra quyền Admin
     */
    private function checkAdminAccess() {
        $currentUser = AuthHelper::getCurrentUser();
        if (!$currentUser || $currentUser['role'] !== 'admin') {
            http_response_code(403);
            echo json_encode(['status' => 'error', 'message' => 'Quyền truy cập bị từ chối. Chỉ dành cho quản trị viên.']);
            exit;
        }
    }

    /**
     * Lấy các số liệu thống kê Dashboard
     */
    public function getStats() {
        // 1. Tổng doanh thu (chỉ tính đơn đã thanh toán hoặc đã giao hàng/hoàn thành)
        // Trong demo này, ta tính tất cả các đơn trừ đơn bị 'cancelled' hoặc tính tất cả đơn tùy ý. Hãy tính các đơn không phải 'cancelled'.
        $stmt = $this->pdo->query("SELECT SUM(total_amount) AS revenue FROM orders WHERE status != 'cancelled'");
        $revenue = floatval($stmt->fetch()['revenue'] ?? 0);

        // 2. Tổng số đơn hàng
        $stmt = $this->pdo->query("SELECT COUNT(*) AS total_orders FROM orders");
        $totalOrders = intval($stmt->fetch()['total_orders'] ?? 0);

        // 3. Tổng số khách hàng (role = 'customer')
        $stmt = $this->pdo->query("SELECT COUNT(*) AS total_customers FROM users WHERE role = 'customer'");
        $totalCustomers = intval($stmt->fetch()['total_customers'] ?? 0);

        // 4. Tổng số sản phẩm
        $stmt = $this->pdo->query("SELECT COUNT(*) AS total_products FROM products");
        $totalProducts = intval($stmt->fetch()['total_products'] ?? 0);

        // 5. Thống kê doanh thu theo danh mục
        $stmt = $this->pdo->query("
            SELECT c.name as category_name, SUM(oi.quantity * oi.price) as sales 
            FROM order_items oi
            JOIN products p ON oi.product_id = p.id
            JOIN categories c ON p.category_id = c.id
            JOIN orders o ON oi.order_id = o.id
            WHERE o.status != 'cancelled'
            GROUP BY c.id
        ");
        $categorySales = $stmt->fetchAll();

        return [
            'status' => 'success',
            'data' => [
                'stats' => [
                    'revenue' => $revenue,
                    'total_orders' => $totalOrders,
                    'total_customers' => $totalCustomers,
                    'total_products' => $totalProducts
                ],
                'category_sales' => $categorySales
            ]
        ];
    }

    /**
     * Lấy toàn bộ đơn hàng hệ thống
     */
    public function getOrders() {
        $stmt = $this->pdo->query("
            SELECT o.*, u.name as customer_name, u.email as customer_email 
            FROM orders o
            LEFT JOIN users u ON o.user_id = u.id
            ORDER BY o.created_at DESC
        ");
        $orders = $stmt->fetchAll();
        return [
            'status' => 'success',
            'data' => $orders
        ];
    }

    /**
     * Cập nhật trạng thái đơn hàng
     */
    public function updateOrderStatus($orderId, $status) {
        $allowedStatuses = ['pending', 'paid', 'shipped', 'delivered', 'cancelled'];
        if (!in_array($status, $allowedStatuses)) {
            http_response_code(400);
            return ['status' => 'error', 'message' => 'Trạng thái đơn hàng không hợp lệ.'];
        }

        $stmt = $this->pdo->prepare("UPDATE orders SET status = ? WHERE id = ?");
        $stmt->execute([$status, $orderId]);

        return [
            'status' => 'success',
            'message' => 'Cập nhật trạng thái đơn hàng thành công.'
        ];
    }

    /**
     * Thêm sản phẩm mới
     */
    public function createProduct($data) {
        if (empty($data['category_id']) || empty($data['name']) || empty($data['price']) || !isset($data['stock'])) {
            http_response_code(400);
            return ['status' => 'error', 'message' => 'Vui lòng điền đầy đủ thông tin sản phẩm.'];
        }

        $categoryId = intval($data['category_id']);
        $name = trim($data['name']);
        $price = floatval($data['price']);
        $stock = intval($data['stock']);
        $description = isset($data['description']) ? trim($data['description']) : '';
        $imageUrl = isset($data['image_url']) ? trim($data['image_url']) : '';
        
        // Tạo slug tự động
        $slug = $this->slugify($name);
        
        // Đảm bảo slug là duy nhất
        $slug = $this->makeUniqueSlug($slug);

        $stmt = $this->pdo->prepare("
            INSERT INTO products (category_id, name, slug, description, price, stock, image_url) 
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ");
        $stmt->execute([$categoryId, $name, $slug, $description, $price, $stock, $imageUrl]);

        return [
            'status' => 'success',
            'message' => 'Thêm sản phẩm thành công.',
            'product_id' => $this->pdo->lastInsertId()
        ];
    }

    /**
     * Cập nhật sản phẩm
     */
    public function updateProduct($id, $data) {
        // Kiểm tra sản phẩm tồn tại
        $stmt = $this->pdo->prepare("SELECT id FROM products WHERE id = ?");
        $stmt->execute([$id]);
        if (!$stmt->fetch()) {
            http_response_code(404);
            return ['status' => 'error', 'message' => 'Không tìm thấy sản phẩm.'];
        }

        if (empty($data['category_id']) || empty($data['name']) || empty($data['price']) || !isset($data['stock'])) {
            http_response_code(400);
            return ['status' => 'error', 'message' => 'Vui lòng điền đầy đủ thông tin sản phẩm.'];
        }

        $categoryId = intval($data['category_id']);
        $name = trim($data['name']);
        $price = floatval($data['price']);
        $stock = intval($data['stock']);
        $description = isset($data['description']) ? trim($data['description']) : '';
        $imageUrl = isset($data['image_url']) ? trim($data['image_url']) : '';

        // Cập nhật thông tin
        $stmt = $this->pdo->prepare("
            UPDATE products 
            SET category_id = ?, name = ?, description = ?, price = ?, stock = ?, image_url = ? 
            WHERE id = ?
        ");
        $stmt->execute([$categoryId, $name, $description, $price, $stock, $imageUrl, $id]);

        return [
            'status' => 'success',
            'message' => 'Cập nhật thông tin sản phẩm thành công.'
        ];
    }

    /**
     * Xóa sản phẩm
     */
    public function deleteProduct($id) {
        $stmt = $this->pdo->prepare("SELECT id FROM products WHERE id = ?");
        $stmt->execute([$id]);
        if (!$stmt->fetch()) {
            http_response_code(404);
            return ['status' => 'error', 'message' => 'Không tìm thấy sản phẩm.'];
        }

        $stmt = $this->pdo->prepare("DELETE FROM products WHERE id = ?");
        $stmt->execute([$id]);

        return [
            'status' => 'success',
            'message' => 'Xóa sản phẩm thành công.'
        ];
    }

    // --- Helpers ---
    private function slugify($text) {
        // Bảng chuyển đổi ký tự tiếng Việt sang ASCII
        $vietnameseMap = [
            'à'=>'a','á'=>'a','ả'=>'a','ã'=>'a','ạ'=>'a',
            'ă'=>'a','ắ'=>'a','ằ'=>'a','ẳ'=>'a','ẵ'=>'a','ặ'=>'a',
            'â'=>'a','ấ'=>'a','ầ'=>'a','ẩ'=>'a','ẫ'=>'a','ậ'=>'a',
            'đ'=>'d',
            'è'=>'e','é'=>'e','ẻ'=>'e','ẽ'=>'e','ẹ'=>'e',
            'ê'=>'e','ế'=>'e','ề'=>'e','ể'=>'e','ễ'=>'e','ệ'=>'e',
            'ì'=>'i','í'=>'i','ỉ'=>'i','ĩ'=>'i','ị'=>'i',
            'ò'=>'o','ó'=>'o','ỏ'=>'o','õ'=>'o','ọ'=>'o',
            'ô'=>'o','ố'=>'o','ồ'=>'o','ổ'=>'o','ỗ'=>'o','ộ'=>'o',
            'ơ'=>'o','ớ'=>'o','ờ'=>'o','ở'=>'o','ỡ'=>'o','ợ'=>'o',
            'ù'=>'u','ú'=>'u','ủ'=>'u','ũ'=>'u','ụ'=>'u',
            'ư'=>'u','ứ'=>'u','ừ'=>'u','ử'=>'u','ữ'=>'u','ự'=>'u',
            'ỳ'=>'y','ý'=>'y','ỷ'=>'y','ỹ'=>'y','ỵ'=>'y',
            'À'=>'A','Á'=>'A','Ả'=>'A','Ã'=>'A','Ạ'=>'A',
            'Ă'=>'A','Ắ'=>'A','Ằ'=>'A','Ẳ'=>'A','Ẵ'=>'A','Ặ'=>'A',
            'Â'=>'A','Ấ'=>'A','Ầ'=>'A','Ẩ'=>'A','Ẫ'=>'A','Ậ'=>'A',
            'Đ'=>'D',
            'È'=>'E','É'=>'E','Ẻ'=>'E','Ẽ'=>'E','Ẹ'=>'E',
            'Ê'=>'E','Ế'=>'E','Ề'=>'E','Ể'=>'E','Ễ'=>'E','Ệ'=>'E',
            'Ì'=>'I','Í'=>'I','Ỉ'=>'I','Ĩ'=>'I','Ị'=>'I',
            'Ò'=>'O','Ó'=>'O','Ỏ'=>'O','Õ'=>'O','Ọ'=>'O',
            'Ô'=>'O','Ố'=>'O','Ồ'=>'O','Ổ'=>'O','Ỗ'=>'O','Ộ'=>'O',
            'Ơ'=>'O','Ớ'=>'O','Ờ'=>'O','Ở'=>'O','Ỡ'=>'O','Ợ'=>'O',
            'Ù'=>'U','Ú'=>'U','Ủ'=>'U','Ũ'=>'U','Ụ'=>'U',
            'Ư'=>'U','Ứ'=>'U','Ừ'=>'U','Ử'=>'U','Ữ'=>'U','Ự'=>'U',
            'Ỳ'=>'Y','Ý'=>'Y','Ỷ'=>'Y','Ỹ'=>'Y','Ỵ'=>'Y',
        ];
        $text = strtr($text, $vietnameseMap);
        $text = strtolower($text);
        $text = preg_replace('~[^a-z\d]+~', '-', $text);
        $text = trim($text, '-');
        $text = preg_replace('~-+~', '-', $text);
        if (empty($text)) {
            return 'n-a';
        }
        return $text;
    }

    private function makeUniqueSlug($slug) {
        $stmt = $this->pdo->prepare("SELECT COUNT(*) FROM products WHERE slug = ?");
        $stmt->execute([$slug]);
        $count = intval($stmt->fetchColumn());
        
        if ($count === 0) {
            return $slug;
        }

        $i = 1;
        while (true) {
            $newSlug = $slug . '-' . $i;
            $stmt->execute([$newSlug]);
            if (intval($stmt->fetchColumn()) === 0) {
                return $newSlug;
            }
            $i++;
        }
    }

    /**
     * Thêm danh mục mới
     */
    public function createCategory($data) {
        if (empty($data['name'])) {
            http_response_code(400);
            return ['status' => 'error', 'message' => 'Tên danh mục không được để trống.'];
        }

        $name = trim($data['name']);
        $slug = $this->slugify($name);

        // Đảm bảo slug danh mục là duy nhất
        $stmt = $this->pdo->prepare("SELECT COUNT(*) FROM categories WHERE slug = ?");
        $stmt->execute([$slug]);
        if (intval($stmt->fetchColumn()) > 0) {
            $slug .= '-' . time();
        }

        $stmt = $this->pdo->prepare("INSERT INTO categories (name, slug) VALUES (?, ?)");
        $stmt->execute([$name, $slug]);

        return [
            'status' => 'success',
            'message' => 'Thêm danh mục thành công.',
            'category_id' => $this->pdo->lastInsertId()
        ];
    }

    /**
     * Xóa danh mục
     */
    public function deleteCategory($id) {
        // Kiểm tra xem danh mục có tồn tại không
        $stmt = $this->pdo->prepare("SELECT id FROM categories WHERE id = ?");
        $stmt->execute([$id]);
        if (!$stmt->fetch()) {
            http_response_code(404);
            return ['status' => 'error', 'message' => 'Không tìm thấy danh mục.'];
        }

        $stmt = $this->pdo->prepare("DELETE FROM categories WHERE id = ?");
        $stmt->execute([$id]);

        return [
            'status' => 'success',
            'message' => 'Xóa danh mục thành công.'
        ];
    }

    /**
     * Cập nhật danh mục
     */
    public function updateCategory($id, $data) {
        if (empty($data['name'])) {
            http_response_code(400);
            return ['status' => 'error', 'message' => 'Tên danh mục không được để trống.'];
        }

        $name = trim($data['name']);
        $slug = $this->slugify($name);

        // Đảm bảo slug danh mục là duy nhất và không trùng với các danh mục khác
        $stmt = $this->pdo->prepare("SELECT COUNT(*) FROM categories WHERE slug = ? AND id != ?");
        $stmt->execute([$slug, $id]);
        if (intval($stmt->fetchColumn()) > 0) {
            $slug .= '-' . time();
        }

        $stmt = $this->pdo->prepare("UPDATE categories SET name = ?, slug = ? WHERE id = ?");
        $stmt->execute([$name, $slug, $id]);

        return [
            'status' => 'success',
            'message' => 'Cập nhật danh mục thành công.'
        ];
    }
}
