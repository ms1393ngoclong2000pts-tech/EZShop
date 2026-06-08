import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, CreditCard, Landmark, ShoppingBag, Truck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const DISCOUNT_CODES = {
  EZSHOP10: 0.1,
  FREESHIP: 0,
};

export default function Checkout() {
  const { cart, cartTotal, clearCart } = useCart();
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [shippingName, setShippingName] = useState(user?.name || '');
  const [shippingPhone, setShippingPhone] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [note, setNote] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [coupon, setCoupon] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccessId, setOrderSuccessId] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  const discount = useMemo(() => {
    const rate = DISCOUNT_CODES[appliedCoupon] || 0;
    return Math.round(cartTotal * rate);
  }, [appliedCoupon, cartTotal]);
  const payableTotal = Math.max(cartTotal - discount, 0);

  const formatVND = (value) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);

  const applyCoupon = () => {
    const normalized = coupon.trim().toUpperCase();
    if (!normalized) {
      setAppliedCoupon('');
      return;
    }
    if (!Object.prototype.hasOwnProperty.call(DISCOUNT_CODES, normalized)) {
      setErrorMessage('Mã khuyến mãi không hợp lệ.');
      return;
    }
    setErrorMessage('');
    setAppliedCoupon(normalized);
  };

  const handleOrderSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage('');

    if (!shippingName.trim() || !shippingPhone.trim() || !shippingAddress.trim()) {
      setErrorMessage('Vui lòng điền đầy đủ thông tin giao hàng.');
      return;
    }
    if (!/^[0-9+\-\s]{9,15}$/.test(shippingPhone.trim())) {
      setErrorMessage('Số điện thoại chưa đúng định dạng.');
      return;
    }
    if (paymentMethod === 'card' && (!cardNumber || !cardExpiry || !cardCvv)) {
      setErrorMessage('Vui lòng điền đầy đủ thông tin thẻ thanh toán.');
      return;
    }

    setIsSubmitting(true);
    try {
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers.Authorization = `Bearer ${token}`;

      const response = await fetch('/api/?action=orders/create', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          shipping_name: shippingName,
          shipping_phone: shippingPhone,
          shipping_address: shippingAddress,
          note,
          coupon: appliedCoupon,
          items: cart.map((item) => ({ product_id: item.product.id, quantity: item.quantity })),
        }),
      });
      const data = await response.json();

      if (response.ok && data.status === 'success') {
        setOrderSuccessId(data.order_id);
        clearCart();
      } else {
        setErrorMessage(data.message || 'Lỗi đặt hàng. Vui lòng thử lại.');
      }
    } catch (err) {
      console.error(err);
      setErrorMessage('Không thể kết nối máy chủ để đặt hàng.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (orderSuccessId) {
    return (
      <div className="container success-page fade-in">
        <CheckCircle2 size={64} />
        <h1>Đặt hàng thành công</h1>
        <p>Cảm ơn bạn đã mua sắm tại EZShop. Mã đơn hàng của bạn là <strong>#{orderSuccessId}</strong>.</p>
        <div className="success-summary">
          <span><strong>Người nhận:</strong> {shippingName}</span>
          <span><strong>Địa chỉ:</strong> {shippingAddress}</span>
          <span><strong>Thanh toán:</strong> {paymentMethod === 'cod' ? 'COD' : 'Thẻ thanh toán'}</span>
        </div>
        <div className="button-row">
          <button className="btn btn-primary" onClick={() => navigate('/')}>Tiếp tục mua sắm</button>
          {user && <button className="btn btn-secondary" onClick={() => navigate('/profile')}>Xem đơn hàng</button>}
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="container empty-state">
        <ShoppingBag size={64} strokeWidth={1.5} />
        <h2>Giỏ hàng của bạn đang trống</h2>
        <p>Hãy quay lại trang chủ để chọn sản phẩm.</p>
        <button className="btn btn-primary" onClick={() => navigate('/')}>Về trang chủ</button>
      </div>
    );
  }

  return (
    <div className="container fade-in">
      <h1 className="page-title">Thanh toán đơn hàng</h1>
      <div className="checkout-layout">
        <form className="checkout-form" onSubmit={handleOrderSubmit}>
          <section className="panel">
            <h2><Truck size={20} /> Thông tin giao hàng</h2>
            <label className="form-group">
              <span className="form-label">Họ và tên người nhận</span>
              <input className="form-input" value={shippingName} onChange={(event) => setShippingName(event.target.value)} placeholder="Nguyễn Văn A" required />
            </label>
            <label className="form-group">
              <span className="form-label">Số điện thoại</span>
              <input type="tel" className="form-input" value={shippingPhone} onChange={(event) => setShippingPhone(event.target.value)} placeholder="09xxxxxxxx" required />
            </label>
            <label className="form-group">
              <span className="form-label">Địa chỉ nhận hàng</span>
              <textarea className="form-input" rows="3" value={shippingAddress} onChange={(event) => setShippingAddress(event.target.value)} placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố" required />
            </label>
            <label className="form-group">
              <span className="form-label">Ghi chú cho đơn hàng</span>
              <textarea className="form-input" rows="2" value={note} onChange={(event) => setNote(event.target.value)} placeholder="Ví dụ: giao giờ hành chính" />
            </label>
          </section>

          <section className="panel">
            <h2><Landmark size={20} /> Phương thức thanh toán</h2>
            <label className={`payment-option ${paymentMethod === 'cod' ? 'selected' : ''}`}>
              <input type="radio" name="payment" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} />
              <span><strong>Thanh toán khi nhận hàng (COD)</strong><small>Thanh toán bằng tiền mặt khi shipper giao hàng.</small></span>
            </label>
            <label className={`payment-option ${paymentMethod === 'card' ? 'selected' : ''}`}>
              <input type="radio" name="payment" checked={paymentMethod === 'card'} onChange={() => setPaymentMethod('card')} />
              <span><strong>Thẻ tín dụng / ghi nợ</strong><small>Thanh toán giả lập bằng Visa hoặc Mastercard.</small></span>
            </label>

            {paymentMethod === 'card' && (
              <div className="card-fields">
                <span className="inline-title"><CreditCard size={18} /> Thông tin thẻ</span>
                <input className="form-input" value={cardNumber} onChange={(event) => setCardNumber(event.target.value.replace(/[^\d]/g, ''))} maxLength="16" placeholder="4111 2222 3333 4444" />
                <div className="two-col">
                  <input className="form-input" value={cardExpiry} onChange={(event) => setCardExpiry(event.target.value)} maxLength="5" placeholder="MM/YY" />
                  <input className="form-input" type="password" value={cardCvv} onChange={(event) => setCardCvv(event.target.value.replace(/[^\d]/g, ''))} maxLength="3" placeholder="CVV" />
                </div>
              </div>
            )}
          </section>
        </form>

        <aside className="order-summary panel">
          <h2>Đơn hàng của bạn</h2>
          <div className="summary-items">
            {cart.map((item) => (
              <div className="summary-item" key={item.product.id}>
                <span>{item.product.name} <small>x{item.quantity}</small></span>
                <strong>{formatVND(item.product.price * item.quantity)}</strong>
              </div>
            ))}
          </div>
          <div className="coupon-row">
            <input className="form-input" value={coupon} onChange={(event) => setCoupon(event.target.value)} placeholder="Mã khuyến mãi" />
            <button className="btn btn-secondary btn-sm" type="button" onClick={applyCoupon}>Áp dụng</button>
          </div>
          <div className="summary-totals">
            <div><span>Tạm tính</span><strong>{formatVND(cartTotal)}</strong></div>
            <div><span>Phí vận chuyển</span><strong className="success-text">Miễn phí</strong></div>
            {discount > 0 && <div><span>Giảm giá {appliedCoupon}</span><strong>-{formatVND(discount)}</strong></div>}
            <div className="grand-total"><span>Tổng tiền</span><strong>{formatVND(payableTotal)}</strong></div>
          </div>
          {errorMessage && <div className="form-alert">{errorMessage}</div>}
          <button className="btn btn-primary full-width" disabled={isSubmitting} onClick={handleOrderSubmit}>
            {isSubmitting ? 'Đang tạo đơn hàng...' : 'Đặt hàng ngay'}
          </button>
        </aside>
      </div>
    </div>
  );
}
