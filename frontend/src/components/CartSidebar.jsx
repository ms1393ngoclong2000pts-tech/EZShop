import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react';
import { useCart } from '../context/CartContext';
import SafeImage from './SafeImage';

export default function CartSidebar() {
  const { cart, isCartOpen, setIsCartOpen, updateQty, removeFromCart, cartTotal } = useCart();
  const navigate = useNavigate();
  const sidebarRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (isCartOpen && sidebarRef.current && !sidebarRef.current.contains(event.target) && !event.target.closest('.btn-icon')) {
        setIsCartOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isCartOpen, setIsCartOpen]);

  if (!isCartOpen) return null;

  const totalFormatted = new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(cartTotal);

  return (
    <>
      <div className="cart-overlay" />
      <aside className="cart-drawer" ref={sidebarRef} aria-label="Giỏ hàng">
        <div className="cart-header">
          <h2>
            <ShoppingBag size={20} />
            <span>Giỏ hàng của bạn</span>
          </h2>
          <button className="btn-icon" onClick={() => setIsCartOpen(false)} aria-label="Đóng giỏ hàng">
            <X size={20} />
          </button>
        </div>

        <div className="cart-items">
          {cart.length === 0 ? (
            <div className="cart-empty">
              <ShoppingBag size={48} strokeWidth={1.5} />
              <p>Giỏ hàng còn trống</p>
              <button className="btn btn-secondary btn-sm" onClick={() => setIsCartOpen(false)}>Tiếp tục mua sắm</button>
            </div>
          ) : (
            cart.map((item) => {
              const itemPriceFormatted = new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND',
              }).format(item.product.price);

              return (
                <div className="cart-item" key={item.product.id}>
                  <SafeImage src={item.product.image_url} alt={item.product.name} className="cart-item-img" />
                  <div className="cart-item-details">
                    <h4 className="cart-item-title">{item.product.name}</h4>
                    <span className="cart-item-price">{itemPriceFormatted}</span>
                    <div className="cart-qty-ctrl">
                      <button className="qty-btn" onClick={() => updateQty(item.product.id, item.quantity - 1, item.product.stock)} aria-label="Giảm số lượng">
                        <Minus size={12} />
                      </button>
                      <span className="qty-value">{item.quantity}</span>
                      <button className="qty-btn" onClick={() => updateQty(item.product.id, item.quantity + 1, item.product.stock)} aria-label="Tăng số lượng">
                        <Plus size={12} />
                      </button>
                    </div>
                  </div>
                  <button className="btn btn-ghost danger-action" onClick={() => removeFromCart(item.product.id)} title="Xóa sản phẩm">
                    <Trash2 size={16} />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {cart.length > 0 && (
          <div className="cart-footer">
            <div className="cart-total-row">
              <span>Tổng cộng</span>
              <span className="price">{totalFormatted}</span>
            </div>
            <button
              className="btn btn-primary"
              onClick={() => {
                setIsCartOpen(false);
                navigate('/checkout');
              }}
            >
              Tiến hành thanh toán
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
