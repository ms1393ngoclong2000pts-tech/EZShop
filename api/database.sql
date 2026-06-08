-- Khởi tạo Database
CREATE DATABASE IF NOT EXISTS `ecommerce_db` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `ecommerce_db`;

-- 1. Bảng Categories (Danh mục)
CREATE TABLE IF NOT EXISTS `categories` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `slug` VARCHAR(100) NOT NULL UNIQUE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 2. Bảng Users (Người dùng)
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(100) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `role` ENUM('customer', 'admin') DEFAULT 'customer',
  `avatar` VARCHAR(255) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 3. Bảng Products (Sản phẩm)
CREATE TABLE IF NOT EXISTS `products` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `category_id` INT NOT NULL,
  `name` VARCHAR(150) NOT NULL,
  `slug` VARCHAR(150) NOT NULL UNIQUE,
  `description` TEXT,
  `price` DECIMAL(15, 2) NOT NULL,
  `stock` INT DEFAULT 0,
  `image_url` VARCHAR(255),
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 4. Bảng Orders (Đơn hàng)
CREATE TABLE IF NOT EXISTS `orders` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT DEFAULT NULL,
  `status` ENUM('pending', 'paid', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
  `total_amount` DECIMAL(15, 2) NOT NULL,
  `shipping_name` VARCHAR(100) NOT NULL,
  `shipping_phone` VARCHAR(20) NOT NULL,
  `shipping_address` TEXT NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB;

-- 5. Bảng Order Items (Chi tiết đơn hàng)
CREATE TABLE IF NOT EXISTS `order_items` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `order_id` INT NOT NULL,
  `product_id` INT NOT NULL,
  `quantity` INT NOT NULL,
  `price` DECIMAL(15, 2) NOT NULL,
  FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ==========================================================
-- CHÈN DỮ LIỆU MẪU
-- ==========================================================

-- Chèn Danh mục
INSERT INTO `categories` (`id`, `name`, `slug`) VALUES
(1, 'Điện thoại', 'dien-thoai'),
(2, 'Laptop', 'laptop'),
(3, 'Phụ kiện', 'phu-kien');

-- Chèn Tài khoản (Mật khẩu mặc định là: 123456)
-- Hash của '123456' sử dụng PASSWORD_DEFAULT trong PHP là: $2y$10$WpZ6G9Y3u.l5XvD5t73aKOm0b4vG4t3N7.EpyH3gH9m.b3sK2g9.i (hoặc ta có thể chèn trực tiếp chuỗi hash tương thích)
-- Hãy tạo 1 tài khoản Admin và 1 tài khoản User thường
-- Hash dưới đây được sinh bằng password_hash('123456', PASSWORD_DEFAULT)
INSERT INTO `users` (`id`, `name`, `email`, `password`, `role`) VALUES
(1, 'Hệ thống Admin', 'admin@ecommerce.com', '$2y$10$gW2unmQos9htBXu2W.H.QO3EOurmWezZ8K4kUTGB1JFFiIbz8iI8W', 'admin'),
(2, 'Khách hàng Demo', 'user@ecommerce.com', '$2y$10$gW2unmQos9htBXu2W.H.QO3EOurmWezZ8K4kUTGB1JFFiIbz8iI8W', 'customer');

-- Chèn Sản phẩm
INSERT INTO `products` (`id`, `category_id`, `name`, `slug`, `description`, `price`, `stock`, `image_url`) VALUES
(1, 1, 'iPhone 15 Pro Max 256GB', 'iphone-15-pro-max-256gb', 'Điện thoại iPhone thế hệ mới nhất của Apple với khung Titan, chip A17 Pro siêu mạnh mẽ và camera zoom 5x ấn tượng.', 29990000.00, 15, 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&auto=format&fit=crop&q=60'),
(2, 1, 'Samsung Galaxy S24 Ultra', 'samsung-galaxy-s24-ultra', 'Siêu phẩm Galaxy S24 Ultra với bút S-Pen, tính năng Galaxy AI thông minh vượt trội, camera 200MP chụp đêm siêu nét.', 27490000.00, 10, 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=600&auto=format&fit=crop&q=60'),
(3, 2, 'MacBook Air M3 2024', 'macbook-air-m3-2024', 'Laptop siêu mỏng nhẹ từ Apple trang bị chip M3 tiên tiến, thời lượng pin lên đến 18 tiếng, màn hình Liquid Retina tuyệt đẹp.', 26990000.00, 8, 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&auto=format&fit=crop&q=60'),
(4, 2, 'ASUS ROG Zephyrus G14', 'asus-rog-zephyrus-g14', 'Laptop gaming cao cấp nhỏ gọn, màn hình ROG Nebula OLED 120Hz, chip Ryzen 9 và card đồ họa RTX 4060 cực khủng.', 35990000.00, 5, 'https://images.unsplash.com/photo-1603302576837-37561b2fe536?w=600&auto=format&fit=crop&q=60'),
(5, 3, 'AirPods Pro 2 USB-C', 'airpods-pro-2-usb-c', 'Tai nghe chống ồn chủ động tốt nhất từ Apple, hỗ trợ âm thanh thích ứng và cổng sạc USB-C thế hệ mới tiện lợi.', 5490000.00, 30, 'https://images.unsplash.com/photo-1588449668365-d15e397f6787?w=600&auto=format&fit=crop&q=60'),
(6, 3, 'Bàn phím cơ Keychron K2 V2', 'keychron-k2-v2', 'Bàn phím cơ không dây Bluetooth/Wired layout 75% tối giản, LED RGB rực rỡ, phím bấm êm ái thích hợp cho lập trình viên.', 1890000.00, 20, 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&auto=format&fit=crop&q=60');
