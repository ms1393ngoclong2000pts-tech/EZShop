import { useEffect, useMemo, useState } from 'react';
import { Search, ShieldCheck, SlidersHorizontal, Truck, WalletCards } from 'lucide-react';
import ProductCard from '../components/ProductCard';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sort, setSort] = useState('');

  useEffect(() => {
    fetch('/api/?action=products/categories')
      .then((res) => res.json())
      .then((data) => {
        if (data.status === 'success') setCategories(data.data);
      })
      .catch((err) => console.error('Lỗi lấy danh mục:', err));
  }, []);

  useEffect(() => {
    let ignore = false;
    setLoading(true);

    const query = new URLSearchParams({
      action: 'products',
      search,
      category: selectedCategory,
      sort,
    }).toString();

    fetch(`/api/?${query}`)
      .then((res) => res.json())
      .then((data) => {
        if (!ignore && data.status === 'success') setProducts(data.data);
      })
      .catch((err) => console.error('Lỗi lấy sản phẩm:', err))
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [search, selectedCategory, sort]);

  const heroStats = useMemo(
    () => [
      { icon: ShieldCheck, label: 'Chính hãng', value: '100%' },
      { icon: Truck, label: 'Miễn phí giao', value: 'Toàn quốc' },
      { icon: WalletCards, label: 'Thanh toán', value: 'COD & thẻ' },
    ],
    []
  );

  return (
    <div className="container fade-in">
      <section className="home-hero">
        <div className="home-hero-copy">
          <span className="eyebrow">Công nghệ & phong cách sống</span>
          <h1>Thiết bị chính hãng cho công việc, học tập và giải trí.</h1>
          <p>
            Khám phá sản phẩm mới, giá minh bạch, tồn kho rõ ràng và dịch vụ hậu mãi được thiết kế cho trải nghiệm mua sắm chuyên nghiệp.
          </p>
          <button className="btn btn-light" onClick={() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })}>
            Mua sắm ngay
          </button>
        </div>
        <div className="hero-stat-grid">
          {heroStats.map((item) => (
            <div className="hero-stat" key={item.label}>
              <item.icon size={22} />
              <strong>{item.value}</strong>
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="filter-bar" id="products">
        <div className="search-field">
          <Search size={18} />
          <input
            type="text"
            className="form-input"
            placeholder="Tìm kiếm sản phẩm..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
        <div className="sort-field">
          <SlidersHorizontal size={16} />
          <select className="form-select" value={sort} onChange={(event) => setSort(event.target.value)}>
            <option value="">Sắp xếp mặc định</option>
            <option value="newest">Mới nhất</option>
            <option value="price_asc">Giá: thấp đến cao</option>
            <option value="price_desc">Giá: cao đến thấp</option>
          </select>
        </div>
      </section>

      <div className="category-tabs">
        <button className={`btn ${selectedCategory === '' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setSelectedCategory('')}>
          Tất cả
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            className={`btn ${selectedCategory === cat.slug ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setSelectedCategory(cat.slug)}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="product-grid">
          {[1, 2, 3, 4].map((item) => <div key={item} className="card skeleton-card" />)}
        </div>
      ) : products.length === 0 ? (
        <div className="empty-state">
          <p>Không tìm thấy sản phẩm phù hợp.</p>
          <button className="btn btn-secondary btn-sm" onClick={() => { setSearch(''); setSelectedCategory(''); setSort(''); }}>
            Xóa bộ lọc
          </button>
        </div>
      ) : (
        <div className="product-grid">
          {products.map((product) => <ProductCard key={product.id} product={product} />)}
        </div>
      )}
    </div>
  );
}
