import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, RefreshCw, ShieldCheck, ShoppingCart, Truck } from 'lucide-react';
import { useCart } from '../context/CartContext';
import SafeImage from '../components/SafeImage';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    let ignore = false;
    setLoading(true);
    setError('');

    fetch(`/api/?action=products/detail&id=${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (ignore) return;
        if (data.status === 'success') setProduct(data.data);
        else setError(data.message || 'Không thể tải thông tin sản phẩm.');
      })
      .catch((err) => {
        console.error(err);
        if (!ignore) setError('Không thể kết nối máy chủ.');
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [id]);

  if (loading) return <div className="container page-loader">Đang tải thông tin sản phẩm...</div>;

  if (error || !product) {
    return (
      <div className="container empty-state">
        <h2>Lỗi</h2>
        <p>{error || 'Sản phẩm không tồn tại.'}</p>
        <button className="btn btn-secondary" onClick={() => navigate('/')}>
          <ArrowLeft size={16} /> Quay về trang chủ
        </button>
      </div>
    );
  }

  const stockLimit = Number(product.stock || 0);
  const isOutOfStock = stockLimit <= 0;
  const priceFormatted = new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(product.price);

  const updateQuantity = (value) => {
    const next = Math.max(1, Math.min(value, stockLimit));
    if (value > stockLimit) alert(`Chỉ còn ${stockLimit} sản phẩm trong kho.`);
    setQuantity(next);
  };

  return (
    <div className="container fade-in">
      <button className="btn btn-secondary" onClick={() => navigate(-1)}>
        <ArrowLeft size={16} />
        <span>Quay lại</span>
      </button>

      <section className="product-detail">
        <div className="product-media">
          <SafeImage src={product.image_url} alt={product.name} />
        </div>
        <div className="product-info">
          <span className="card-tag">{product.category_name}</span>
          <h1>{product.name}</h1>
          <div className="detail-price-row">
            <span className="price detail-price">{priceFormatted}</span>
            <span className={`stock-pill ${isOutOfStock ? 'out' : ''}`}>
              {isOutOfStock ? 'Hết hàng' : `Còn hàng (${product.stock} SP)`}
            </span>
          </div>
          <p className="product-description">{product.description}</p>

          {!isOutOfStock ? (
            <div className="buy-row">
              <div>
                <label className="form-label">Số lượng</label>
                <div className="qty-input">
                  <button className="qty-btn" onClick={() => updateQuantity(quantity - 1)}>-</button>
                  <input
                    type="number"
                    className="form-input"
                    value={quantity}
                    onChange={(event) => updateQuantity(Number(event.target.value) || 1)}
                  />
                  <button className="qty-btn" onClick={() => updateQuantity(quantity + 1)}>+</button>
                </div>
              </div>
              <button className="btn btn-primary" onClick={() => addToCart(product, quantity)}>
                <ShoppingCart size={18} />
                <span>Thêm vào giỏ hàng</span>
              </button>
            </div>
          ) : (
            <button className="btn btn-danger" disabled>Sản phẩm tạm hết hàng</button>
          )}

          <div className="service-list">
            <div><ShieldCheck size={18} /><span>Bảo hành chính hãng 12 tháng tại trung tâm ủy quyền.</span></div>
            <div><Truck size={18} /><span>Miễn phí giao hàng toàn quốc, nhận hàng trong 2-3 ngày.</span></div>
            <div><RefreshCw size={18} /><span>Đổi trả dễ dàng trong 7 ngày nếu có lỗi từ nhà sản xuất.</span></div>
          </div>
        </div>
      </section>
    </div>
  );
}
