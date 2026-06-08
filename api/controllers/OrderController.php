<?php
// controllers/OrderController.php

require_once __DIR__ . '/../helpers/AuthHelper.php';

class OrderController {
    private $pdo;

    public function __construct($pdo) {
        $this->pdo = $pdo;
    }

    /**
     * Tạo đơn hàng mới (hỗ trợ cả người dùng vãng lai và thành viên)
     */
    public function create($data) {
        if (empty($data['shipping_name']) || empty($data['shipping_phone']) || empty($data['shipping_address']) || empty($data['items'])) {
            http_response_code(400);
            return ['status' => 'error', 'message' => 'Vui lòng cung cấp đầy đủ thông tin giao hàng và giỏ hàng.'];
        }

        $shippingName = trim($data['shipping_name']);
        $shippingPhone = trim($data['shipping_phone']);
        $shippingAddress = trim($data['shipping_address']);
        $items = $data['items']; // Mảng các sản phẩm: [['product_id' => 1, 'quantity' => 2], ...]

        // Xác định user đang đăng nhập (nếu có)
        $currentUser = AuthHelper::getCurrentUser();
        $userId = $currentUser ? $currentUser['id'] : null;

        try {
            $this->pdo->beginTransaction();

            $totalAmount = 0;
            $itemsToInsert = [];

            // Duyệt qua từng item để tính tiền và kiểm tra kho
            foreach ($items as $item) {
                $productId = intval($item['product_id']);
                $quantity = intval($item['quantity']);

                if ($quantity <= 0) {
                    throw new Exception("Số lượng mua của sản phẩm phải lớn hơn 0.");
                }

                // Lấy thông tin sản phẩm từ DB
                $stmt = $this->pdo->prepare("SELECT price, stock, name FROM products WHERE id = ? FOR UPDATE");
                $stmt->execute([$productId]);
                $product = $stmt->fetch();

                if (!$product) {
                    throw new Exception("Không tìm thấy sản phẩm với ID $productId.");
                }

                if ($product['stock'] < $quantity) {
                    throw new Exception("Sản phẩm '" . $product['name'] . "' không đủ hàng trong kho (Còn lại: " . $product['stock'] . ").");
                }

                $price = floatval($product['price']);
                $subtotal = $price * $quantity;
                $totalAmount += $subtotal;

                $itemsToInsert[] = [
                    'product_id' => $productId,
                    'quantity' => $quantity,
                    'price' => $price,
                    'new_stock' => $product['stock'] - $quantity
                ];
            }

            // Tạo đơn hàng
            $stmt = $this->pdo->prepare("
                INSERT INTO orders (user_id, status, total_amount, shipping_name, shipping_phone, shipping_address) 
                VALUES (?, 'pending', ?, ?, ?, ?)
            ");
            $stmt->execute([$userId, $totalAmount, $shippingName, $shippingPhone, $shippingAddress]);
            $orderId = $this->pdo->lastInsertId();

            // Thêm chi tiết đơn hàng và cập nhật kho hàng
            $insertItemStmt = $this->pdo->prepare("
                INSERT INTO order_items (order_id, product_id, quantity, price) 
                VALUES (?, ?, ?, ?)
            ");
            $updateStockStmt = $this->pdo->prepare("
                UPDATE products SET stock = ? WHERE id = ?
            ");

            foreach ($itemsToInsert as $item) {
                // Lưu chi tiết
                $insertItemStmt->execute([$orderId, $item['product_id'], $item['quantity'], $item['price']]);
                // Cập nhật kho
                $updateStockStmt->execute([$item['new_stock'], $item['product_id']]);
            }

            $this->pdo->commit();

            return [
                'status' => 'success',
                'message' => 'Đặt hàng thành công!',
                'order_id' => $orderId
            ];

        } catch (Exception $e) {
            $this->pdo->rollBack();
            http_response_code(400);
            return [
                'status' => 'error',
                'message' => $e->getMessage()
            ];
        }
    }

    /**
     * Lấy lịch sử đơn hàng của người dùng hiện tại
     */
    public function getByUser() {
        $currentUser = AuthHelper::getCurrentUser();
        if (!$currentUser) {
            http_response_code(401);
            return ['status' => 'error', 'message' => 'Bạn cần đăng nhập để xem lịch sử đơn hàng.'];
        }

        $stmt = $this->pdo->prepare("
            SELECT * FROM orders 
            WHERE user_id = ? 
            ORDER BY created_at DESC
        ");
        $stmt->execute([$currentUser['id']]);
        $orders = $stmt->fetchAll();

        return [
            'status' => 'success',
            'data' => $orders
        ];
    }

    /**
     * Lấy chi tiết của một đơn hàng cụ thể
     */
    public function getById($id) {
        $currentUser = AuthHelper::getCurrentUser();
        if (!$currentUser) {
            http_response_code(401);
            return ['status' => 'error', 'message' => 'Vui lòng đăng nhập.'];
        }

        // Lấy thông tin đơn hàng
        $stmt = $this->pdo->prepare("SELECT * FROM orders WHERE id = ?");
        $stmt->execute([$id]);
        $order = $stmt->fetch();

        if (!$order) {
            http_response_code(404);
            return ['status' => 'error', 'message' => 'Không tìm thấy đơn hàng.'];
        }

        // Kiểm tra quyền (phải là chủ đơn hàng hoặc Admin)
        if ($order['user_id'] != $currentUser['id'] && $currentUser['role'] !== 'admin') {
            http_response_code(403);
            return ['status' => 'error', 'message' => 'Bạn không có quyền xem đơn hàng này.'];
        }

        // Lấy danh sách sản phẩm trong đơn hàng
        $stmt = $this->pdo->prepare("
            SELECT oi.*, p.name as product_name, p.image_url 
            FROM order_items oi
            JOIN products p ON oi.product_id = p.id
            WHERE oi.order_id = ?
        ");
        $stmt->execute([$id]);
        $items = $stmt->fetchAll();

        $order['items'] = $items;

        return [
            'status' => 'success',
            'data' => $order
        ];
    }
}
