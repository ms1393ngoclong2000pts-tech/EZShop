import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '../context/CartContext';
import SafeImage from './SafeImage';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const priceFormatted = new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(product.price);
  const isOutOfStock = Number(product.stock || 0) <= 0;

  return (
    <article className="card fade-in">
      <Link to={`/product/${product.id}`} className="card-img-wrapper" aria-label={`Xem ${product.name}`}>
        <SafeImage src={product.image_url} alt={product.name} className="card-img" loading="lazy" />
      </Link>
      <div className="card-body">
        <span className="card-tag">{product.category_name || 'Sản phẩm'}</span>
        <Link to={`/product/${product.id}`}>
          <h3 className="card-title">{product.name}</h3>
        </Link>
        <p className="card-desc">{product.description}</p>
        <div className="card-footer">
          <div>
            <span className="price">{priceFormatted}</span>
            <div className="stock-note">Kho: {product.stock} sản phẩm</div>
          </div>
          <button
            className={`btn btn-primary btn-sm ${isOutOfStock ? 'btn-danger' : ''}`}
            onClick={(event) => {
              event.preventDefault();
              if (!isOutOfStock) addToCart(product);
            }}
            disabled={isOutOfStock}
          >
            <ShoppingCart size={16} />
            <span>{isOutOfStock ? 'Hết hàng' : 'Mua'}</span>
          </button>
        </div>
      </div>
    </article>
  );
}
