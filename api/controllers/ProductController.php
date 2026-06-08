<?php
// controllers/ProductController.php

class ProductController {
    private $pdo;

    public function __construct($pdo) {
        $this->pdo = $pdo;
    }

    /**
     * Lấy danh sách sản phẩm (có tìm kiếm, lọc danh mục, sắp xếp)
     */
    public function getAll($queryParams) {
        $search = isset($queryParams['search']) ? trim($queryParams['search']) : '';
        $categorySlug = isset($queryParams['category']) ? trim($queryParams['category']) : '';
        $sort = isset($queryParams['sort']) ? trim($queryParams['sort']) : '';

        $sql = "SELECT p.*, c.name as category_name, c.slug as category_slug 
                FROM products p 
                JOIN categories c ON p.category_id = c.id 
                WHERE 1=1";
        $params = [];

        // Tìm kiếm theo tên
        if ($search !== '') {
            $sql .= " AND (p.name LIKE ? OR p.description LIKE ?)";
            $params[] = "%$search%";
            $params[] = "%$search%";
        }

        // Lọc theo danh mục
        if ($categorySlug !== '') {
            $sql .= " AND c.slug = ?";
            $params[] = $categorySlug;
        }

        // Sắp xếp
        if ($sort === 'price_asc') {
            $sql .= " ORDER BY p.price ASC";
        } elseif ($sort === 'price_desc') {
            $sql .= " ORDER BY p.price DESC";
        } elseif ($sort === 'newest') {
            $sql .= " ORDER BY p.created_at DESC";
        } else {
            $sql .= " ORDER BY p.id DESC"; // Mặc định
        }

        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($params);
        $products = $stmt->fetchAll();

        return [
            'status' => 'success',
            'data' => $products
        ];
    }

    /**
     * Lấy danh sách danh mục
     */
    public function getCategories() {
        $stmt = $this->pdo->query("SELECT * FROM categories ORDER BY id ASC");
        $categories = $stmt->fetchAll();
        return [
            'status' => 'success',
            'data' => $categories
        ];
    }

    /**
     * Chi tiết sản phẩm
     */
    public function getById($id) {
        $stmt = $this->pdo->prepare("
            SELECT p.*, c.name as category_name, c.slug as category_slug 
            FROM products p 
            JOIN categories c ON p.category_id = c.id 
            WHERE p.id = ?
        ");
        $stmt->execute([$id]);
        $product = $stmt->fetch();

        if (!$product) {
            http_response_code(404);
            return ['status' => 'error', 'message' => 'Không tìm thấy sản phẩm.'];
        }

        return [
            'status' => 'success',
            'data' => $product
        ];
    }
}
