import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AlertCircle, KeyRound, Mail, ShoppingCart, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login, register, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      navigate(location.state?.from?.pathname || '/', { replace: true });
    }
  }, [user, navigate, location]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!email || !password || (isRegister && !name)) {
      setError('Vui lòng nhập đầy đủ thông tin bắt buộc.');
      return;
    }

    setLoading(true);
    try {
      if (isRegister) await register(name, email, password);
      else await login(email, password);
    } catch (err) {
      setError(err.message || 'Xác thực tài khoản thất bại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page fade-in">
      <section className="auth-card">
        <div className="auth-brand">
          <ShoppingCart size={28} />
          <span>EZShop</span>
        </div>
        <h1>{isRegister ? 'Tạo tài khoản mới' : 'Chào mừng quay trở lại'}</h1>
        <p>{isRegister ? 'Đăng ký để theo dõi đơn hàng và lưu thông tin mua sắm.' : 'Đăng nhập để xem đơn hàng và tiếp tục mua sắm nhanh hơn.'}</p>

        {error && (
          <div className="form-alert">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {isRegister && (
            <label className="form-group">
              <span className="form-label">Họ và tên</span>
              <div className="input-with-icon">
                <User size={16} />
                <input className="form-input" value={name} onChange={(event) => setName(event.target.value)} placeholder="Nguyễn Văn A" required />
              </div>
            </label>
          )}

          <label className="form-group">
            <span className="form-label">Email</span>
            <div className="input-with-icon">
              <Mail size={16} />
              <input type="email" className="form-input" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="ten@vi-du.com" required />
            </div>
          </label>

          <label className="form-group">
            <span className="form-label">Mật khẩu</span>
            <div className="input-with-icon">
              <KeyRound size={16} />
              <input type="password" className="form-input" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="******" required />
            </div>
          </label>

          <button type="submit" className="btn btn-primary full-width" disabled={loading}>
            {loading ? 'Đang xử lý...' : isRegister ? 'Đăng ký ngay' : 'Đăng nhập'}
          </button>
        </form>

        <div className="auth-switch">
          {isRegister ? 'Đã có tài khoản?' : 'Chưa có tài khoản?'}
          <button type="button" onClick={() => { setIsRegister(!isRegister); setError(''); }}>
            {isRegister ? 'Đăng nhập' : 'Đăng ký'}
          </button>
        </div>

        {!isRegister && (
          <div className="demo-box">
            <strong>Tài khoản dùng thử</strong>
            <span>Admin: admin@ecommerce.com / 123456</span>
            <span>User: user@ecommerce.com / 123456</span>
          </div>
        )}
      </section>
    </div>
  );
}
