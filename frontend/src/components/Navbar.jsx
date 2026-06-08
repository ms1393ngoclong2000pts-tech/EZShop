import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LogOut, Menu, Moon, ShoppingBag, ShoppingCart, Sun, User, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { cartCount, setIsCartOpen } = useCart();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  const isActive = (path) => (location.pathname === path ? 'active' : '');

  const links = (
    <>
      <Link to="/" className={`nav-link ${isActive('/')}`}>Trang chủ</Link>
      <Link to="/about" className={`nav-link ${isActive('/about')}`}>Về chúng tôi</Link>
      <Link to="/help" className={`nav-link ${isActive('/help')}`}>Hỗ trợ</Link>
      {user && <Link to="/profile" className={`nav-link ${isActive('/profile')}`}>Đơn hàng</Link>}
      {user?.role === 'admin' && <Link to="/admin" className={`nav-link admin-link ${isActive('/admin')}`}>Quản trị</Link>}
    </>
  );

  return (
    <nav className="navbar">
      <div className="container navbar-container">
        <Link to="/" className="logo">
          <ShoppingCart size={24} strokeWidth={2.5} />
          <span>EZShop</span>
        </Link>

        <div className="nav-links desktop-nav">{links}</div>

        <div className="nav-actions">
          <button
            className="btn-icon"
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            title="Đổi giao diện"
            aria-label="Đổi giao diện"
          >
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>
          <button className="btn-icon" onClick={() => setIsCartOpen(true)} title="Giỏ hàng" aria-label="Giỏ hàng">
            <ShoppingBag size={20} />
            {cartCount > 0 && <span className="badge">{cartCount}</span>}
          </button>

          {user ? (
            <div className="account-actions">
              <Link to="/profile" className="btn btn-secondary btn-sm">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="avatar-xs" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                ) : (
                  <User size={14} />
                )}
                <span>{user.name?.split(' ')[0] || 'Tài khoản'}</span>
              </Link>
              <button className="btn btn-ghost btn-sm" onClick={logout} title="Đăng xuất" aria-label="Đăng xuất">
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <Link to="/login" className="btn btn-primary btn-sm">Đăng nhập</Link>
          )}

          <button className="btn-icon mobile-menu-button" onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label="Mở menu">
            {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {isMenuOpen && <div className="mobile-nav container">{links}</div>}
    </nav>
  );
}
