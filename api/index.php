<?php
// index.php - Router chính của Backend API

// Tắt hiển thị lỗi trên output (tránh làm hỏng JSON response)
ini_set('display_errors', '0');
error_reporting(E_ALL);
// Cấu hình CORS để React ở Frontend (chạy trên port 5173 hoặc môi trường khác) gọi được API
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");

// Trả về thành công ngay lập tức cho preflight request OPTIONS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Import cấu hình DB và các Controller
require_once __DIR__ . '/config/db.php';
require_once __DIR__ . '/controllers/AuthController.php';
require_once __DIR__ . '/controllers/ProductController.php';
require_once __DIR__ . '/controllers/OrderController.php';
require_once __DIR__ . '/controllers/AdminController.php';
require_once __DIR__ . '/controllers/UploadController.php';

// Nhận action từ query string (Ví dụ: index.php?action=products)
$action = isset($_GET['action']) ? $_GET['action'] : '';

// Đọc dữ liệu JSON từ body request
$inputData = json_decode(file_get_contents('php://input'), true) ?? [];

$method = $_SERVER['REQUEST_METHOD'];
$response = null;

try {
    switch ($action) {
        // --- AUTH ROUTES ---
        case 'auth/register':
            if ($method === 'POST') {
                $controller = new AuthController($pdo);
                $response = $controller->register($inputData);
            } else {
                http_response_code(405);
                $response = ['status' => 'error', 'message' => 'Phương thức không được hỗ trợ.'];
            }
            break;

        case 'auth/login':
            if ($method === 'POST') {
                $controller = new AuthController($pdo);
                $response = $controller->login($inputData);
            } else {
                http_response_code(405);
                $response = ['status' => 'error', 'message' => 'Phương thức không được hỗ trợ.'];
            }
            break;

        case 'auth/me':
            if ($method === 'GET') {
                $controller = new AuthController($pdo);
                $response = $controller->me();
            } else {
                http_response_code(405);
                $response = ['status' => 'error', 'message' => 'Phương thức không được hỗ trợ.'];
            }
            break;

        case 'auth/update-profile':
            if ($method === 'POST') {
                $controller = new AuthController($pdo);
                $response = $controller->updateProfile($inputData);
            } else {
                http_response_code(405);
                $response = ['status' => 'error', 'message' => 'Phương thức không được hỗ trợ.'];
            }
            break;

        // --- PRODUCT ROUTES ---
        case 'products':
            if ($method === 'GET') {
                $controller = new ProductController($pdo);
                $response = $controller->getAll($_GET);
            } else {
                http_response_code(405);
                $response = ['status' => 'error', 'message' => 'Phương thức không được hỗ trợ.'];
            }
            break;

        case 'products/detail':
            if ($method === 'GET') {
                $id = isset($_GET['id']) ? intval($_GET['id']) : 0;
                $controller = new ProductController($pdo);
                $response = $controller->getById($id);
            } else {
                http_response_code(405);
                $response = ['status' => 'error', 'message' => 'Phương thức không được hỗ trợ.'];
            }
            break;

        case 'products/categories':
            if ($method === 'GET') {
                $controller = new ProductController($pdo);
                $response = $controller->getCategories();
            } else {
                http_response_code(405);
                $response = ['status' => 'error', 'message' => 'Phương thức không được hỗ trợ.'];
            }
            break;

        // --- ORDER ROUTES ---
        case 'orders/create':
            if ($method === 'POST') {
                $controller = new OrderController($pdo);
                $response = $controller->create($inputData);
            } else {
                http_response_code(405);
                $response = ['status' => 'error', 'message' => 'Phương thức không được hỗ trợ.'];
            }
            break;

        case 'orders/my':
            if ($method === 'GET') {
                $controller = new OrderController($pdo);
                $response = $controller->getByUser();
            } else {
                http_response_code(405);
                $response = ['status' => 'error', 'message' => 'Phương thức không được hỗ trợ.'];
            }
            break;

        case 'orders/detail':
            if ($method === 'GET') {
                $id = isset($_GET['id']) ? intval($_GET['id']) : 0;
                $controller = new OrderController($pdo);
                $response = $controller->getById($id);
            } else {
                http_response_code(405);
                $response = ['status' => 'error', 'message' => 'Phương thức không được hỗ trợ.'];
            }
            break;

        // --- ADMIN ROUTES ---
        case 'admin/stats':
            if ($method === 'GET') {
                $controller = new AdminController($pdo);
                $response = $controller->getStats();
            } else {
                http_response_code(405);
                $response = ['status' => 'error', 'message' => 'Phương thức không được hỗ trợ.'];
            }
            break;

        case 'admin/orders':
            if ($method === 'GET') {
                $controller = new AdminController($pdo);
                $response = $controller->getOrders();
            } else {
                http_response_code(405);
                $response = ['status' => 'error', 'message' => 'Phương thức không được hỗ trợ.'];
            }
            break;

        case 'admin/orders/update':
            if ($method === 'POST') {
                $id = isset($_GET['id']) ? intval($_GET['id']) : 0;
                $status = isset($inputData['status']) ? $inputData['status'] : '';
                $controller = new AdminController($pdo);
                $response = $controller->updateOrderStatus($id, $status);
            } else {
                http_response_code(405);
                $response = ['status' => 'error', 'message' => 'Phương thức không được hỗ trợ.'];
            }
            break;

        case 'admin/products/create':
            if ($method === 'POST') {
                $controller = new AdminController($pdo);
                $response = $controller->createProduct($inputData);
            } else {
                http_response_code(405);
                $response = ['status' => 'error', 'message' => 'Phương thức không được hỗ trợ.'];
            }
            break;

        case 'admin/products/update':
            if ($method === 'POST') {
                $id = isset($_GET['id']) ? intval($_GET['id']) : 0;
                $controller = new AdminController($pdo);
                $response = $controller->updateProduct($id, $inputData);
            } else {
                http_response_code(405);
                $response = ['status' => 'error', 'message' => 'Phương thức không được hỗ trợ.'];
            }
            break;

        case 'admin/products/delete':
            if ($method === 'POST' || $method === 'DELETE') {
                $id = isset($_GET['id']) ? intval($_GET['id']) : 0;
                $controller = new AdminController($pdo);
                $response = $controller->deleteProduct($id);
            } else {
                http_response_code(405);
                $response = ['status' => 'error', 'message' => 'Phương thức không được hỗ trợ.'];
            }
            break;

        case 'admin/categories/create':
            if ($method === 'POST') {
                $controller = new AdminController($pdo);
                $response = $controller->createCategory($inputData);
            } else {
                http_response_code(405);
                $response = ['status' => 'error', 'message' => 'Phương thức không được hỗ trợ.'];
            }
            break;

        case 'admin/categories/delete':
            if ($method === 'POST' || $method === 'DELETE') {
                $id = isset($_GET['id']) ? intval($_GET['id']) : 0;
                $controller = new AdminController($pdo);
                $response = $controller->deleteCategory($id);
            } else {
                http_response_code(405);
                $response = ['status' => 'error', 'message' => 'Phương thức không được hỗ trợ.'];
            }
            break;

        case 'admin/categories/update':
            if ($method === 'POST') {
                $id = isset($_GET['id']) ? intval($_GET['id']) : 0;
                $controller = new AdminController($pdo);
                $response = $controller->updateCategory($id, $inputData);
            } else {
                http_response_code(405);
                $response = ['status' => 'error', 'message' => 'Phương thức không được hỗ trợ.'];
            }
            break;

        // --- UPLOAD ROUTES ---
        case 'upload/product-image':
            if ($method === 'POST') {
                $controller = new UploadController($pdo);
                $response = $controller->uploadProductImage();
            } else {
                http_response_code(405);
                $response = ['status' => 'error', 'message' => 'Phương thức không được hỗ trợ.'];
            }
            break;

        case 'upload/avatar':
            if ($method === 'POST') {
                $controller = new UploadController($pdo);
                $response = $controller->uploadAvatar();
            } else {
                http_response_code(405);
                $response = ['status' => 'error', 'message' => 'Phương thức không được hỗ trợ.'];
            }
            break;

        // --- DEFAULT ---
        default:
            http_response_code(404);
            $response = ['status' => 'error', 'message' => 'API endpoint không tồn tại.'];
            break;
    }
} catch (Exception $e) {
    http_response_code(500);
    $response = ['status' => 'error', 'message' => 'Lỗi hệ thống: ' . $e->getMessage()];
}

echo json_encode($response);
