import { BrowserRouter as Router, Link, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import CartSidebar from './components/CartSidebar';
import Home from './pages/Home';
import ProductDetail from './pages/ProductDetail';
import Checkout from './pages/Checkout';
import Login from './pages/Login';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import AboutUs from './pages/AboutUs';
import Help from './pages/Help';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <div className="container page-loader">Đang xác thực phiên đăng nhập...</div>;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;

  return children;
}

function AdminRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return <div className="container page-loader">Đang xác thực phiên đăng nhập...</div>;
  if (!user || user.role !== 'admin') return <Navigate to="/" replace />;

  return children;
}

function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-logo">EZShop</div>
        <div className="footer-links">
          <Link to="/">Trang chủ</Link>
          <Link to="/about">Về chúng tôi</Link>
          <Link to="/help">Hỗ trợ</Link>
        </div>
        <p>&copy; {new Date().getFullYear()} EZShop. Tất cả quyền lợi được bảo lưu.</p>
        <p className="footer-note">Nền tảng thương mại điện tử mẫu với React, PHP và MySQL.</p>
      </div>
    </footer>
  );
}

function MainApp() {
  const { user } = useAuth();
  return (
    <CartProvider key={user ? user.id : 'guest'}>
      <Router>
        <Navbar />
        <CartSidebar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/login" element={<Login />} />
            <Route path="/about" element={<AboutUs />} />
            <Route path="/help" element={<Help />} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Footer />
      </Router>
    </CartProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
