import { useEffect, useState } from 'react';
import { Calendar, Camera, Eye, MapPin, Phone, ShoppingBag, User, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import SafeImage from '../components/SafeImage';

const formatVND = (value) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);

const getStatusLabel = (status) => {
  switch (status) {
    case 'pending': return { text: 'Chờ xử lý', class: 'status-pending' };
    case 'paid': return { text: 'Đã thanh toán', class: 'status-paid' };
    case 'shipped': return { text: 'Đang giao hàng', class: 'status-shipped' };
    case 'delivered': return { text: 'Đã giao hàng', class: 'status-delivered' };
    case 'cancelled': return { text: 'Đã hủy', class: 'status-cancelled' };
    default: return { text: status, class: '' };
  }
};

export default function Profile() {
  const { user, token, refreshUser } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [editName, setEditName] = useState(user?.name || '');
  const [editEmail, setEditEmail] = useState(user?.email || '');
  const [editPassword, setEditPassword] = useState('');
  const [updating, setUpdating] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      setEditName(user.name || '');
      setEditEmail(user.email || '');
    }
  }, [user]);

  useEffect(() => {
    if (!token) return;
    let ignore = false;

    setLoading(true);
    fetch('/api/?action=orders/my', { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => res.json())
      .then((data) => {
        if (!ignore && data.status === 'success') setOrders(data.data);
      })
      .catch((err) => console.error('Lỗi lấy đơn hàng:', err))
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [token]);

  if (!user) {
    return (
      <div className="container empty-state">
        <p>Vui lòng đăng nhập để xem thông tin tài khoản.</p>
      </div>
    );
  }

  const handleAvatarUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(file.type)) {
      alert('Chỉ chấp nhận file ảnh JPG, PNG, GIF hoặc WebP.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('File ảnh quá lớn, tối đa 5MB.');
      return;
    }

    setUploadingAvatar(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch('/api/?action=upload/avatar', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await response.json();

      if (response.ok && data.status === 'success') {
        await refreshUser();
        setMessage('Cập nhật ảnh đại diện thành công.');
      } else {
        alert(data.message || 'Upload ảnh thất bại.');
      }
    } catch (err) {
      console.error(err);
      alert('Không thể kết nối máy chủ.');
    } finally {
      setUploadingAvatar(false);
      event.target.value = '';
    }
  };

  const handleUpdateProfile = async (event) => {
    event.preventDefault();
    setMessage('');
    setError('');
    setUpdating(true);

    try {
      const response = await fetch('/api/?action=auth/update-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: editName, email: editEmail, password: editPassword }),
      });
      const data = await response.json();

      if (response.ok && data.status === 'success') {
        setMessage('Cập nhật thông tin thành công.');
        setEditPassword('');
        await refreshUser();
      } else {
        setError(data.message || 'Cập nhật thất bại.');
      }
    } catch (err) {
      console.error(err);
      setError('Không thể kết nối máy chủ.');
    } finally {
      setUpdating(false);
    }
  };

  const viewOrderDetail = async (orderId) => {
    setLoadingDetail(true);
    try {
      const response = await fetch(`/api/?action=orders/detail&id=${orderId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (response.ok && data.status === 'success') setSelectedOrder(data.data);
    } catch (err) {
      console.error(err);
      alert('Không thể tải chi tiết đơn hàng.');
    } finally {
      setLoadingDetail(false);
    }
  };

  const createdAt = user.created_at ? new Date(user.created_at).toLocaleDateString('vi-VN') : 'Chưa có dữ liệu';

  return (
    <div className="container fade-in">
      <div className="profile-layout">
        <aside className="profile-sidebar">
          <section className="panel profile-card">
            <div className="avatar-wrap">
              {user.avatar ? (
                <SafeImage src={user.avatar} alt={user.name} className="avatar-lg" />
              ) : (
                <div className="avatar-fallback">{user.name?.charAt(0).toUpperCase()}</div>
              )}
              <label htmlFor="avatar-upload" className="avatar-upload" title="Thay đổi ảnh đại diện">
                {uploadingAvatar ? <span className="mini-spinner" /> : <Camera size={14} />}
              </label>
              <input id="avatar-upload" type="file" accept="image/*" onChange={handleAvatarUpload} disabled={uploadingAvatar} hidden />
            </div>
            <h2>{user.name}</h2>
            <span className="role-label">{user.role === 'admin' ? 'Quản trị viên' : 'Khách hàng'}</span>
            <div className="profile-meta">
              <span><strong>Email:</strong> {user.email}</span>
              <span><strong>Ngày đăng ký:</strong> {createdAt}</span>
            </div>
          </section>

          <section className="panel">
            <h3><User size={16} /> Cập nhật tài khoản</h3>
            {message && <div className="form-alert success">{message}</div>}
            {error && <div className="form-alert">{error}</div>}
            <form onSubmit={handleUpdateProfile} className="stack-form">
              <label>
                <span className="form-label">Họ và tên</span>
                <input className="form-input" value={editName} onChange={(event) => setEditName(event.target.value)} required />
              </label>
              <label>
                <span className="form-label">Email</span>
                <input type="email" className="form-input" value={editEmail} onChange={(event) => setEditEmail(event.target.value)} required />
              </label>
              <label>
                <span className="form-label">Mật khẩu mới</span>
                <input type="password" className="form-input" value={editPassword} onChange={(event) => setEditPassword(event.target.value)} placeholder="Bỏ trống nếu không đổi" />
              </label>
              <button className="btn btn-primary full-width" disabled={updating}>{updating ? 'Đang cập nhật...' : 'Lưu thay đổi'}</button>
            </form>
          </section>
        </aside>

        <section className="panel profile-orders">
          <h2><ShoppingBag size={20} /> Lịch sử đơn hàng</h2>
          {loading ? (
            <p>Đang tải danh sách đơn hàng...</p>
          ) : orders.length === 0 ? (
            <div className="empty-state compact">
              <ShoppingBag size={44} strokeWidth={1.5} />
              <p>Bạn chưa đặt đơn hàng nào.</p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Mã đơn</th>
                    <th>Ngày đặt</th>
                    <th>Địa chỉ</th>
                    <th>Tổng tiền</th>
                    <th>Trạng thái</th>
                    <th>Chi tiết</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => {
                    const status = getStatusLabel(order.status);
                    return (
                      <tr key={order.id}>
                        <td><strong>#{order.id}</strong></td>
                        <td><Calendar size={14} /> {new Date(order.created_at).toLocaleDateString('vi-VN')}</td>
                        <td className="truncate-cell">{order.shipping_address}</td>
                        <td>{formatVND(order.total_amount)}</td>
                        <td><span className={`status-pill ${status.class}`}>{status.text}</span></td>
                        <td>
                          <button className="btn btn-ghost" onClick={() => viewOrderDetail(order.id)} disabled={loadingDetail}>
                            <Eye size={16} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      {selectedOrder && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">Chi tiết đơn hàng #{selectedOrder.id}</h3>
              <button className="btn-icon" onClick={() => setSelectedOrder(null)}><X size={20} /></button>
            </div>
            <div className="order-detail">
              <div className="detail-box">
                <span><User size={16} /><strong>Người nhận:</strong> {selectedOrder.shipping_name}</span>
                <span><Phone size={16} /><strong>Số điện thoại:</strong> {selectedOrder.shipping_phone}</span>
                <span><MapPin size={16} /><strong>Địa chỉ:</strong> {selectedOrder.shipping_address}</span>
              </div>
              <div className="summary-items">
                {selectedOrder.items?.map((item) => (
                  <div className="summary-item" key={item.id}>
                    <span>{item.product_name} <small>x{item.quantity}</small></span>
                    <strong>{formatVND(item.price * item.quantity)}</strong>
                  </div>
                ))}
              </div>
              <div className="grand-total">
                <span>Tổng giá trị đơn hàng</span>
                <strong>{formatVND(selectedOrder.total_amount)}</strong>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
