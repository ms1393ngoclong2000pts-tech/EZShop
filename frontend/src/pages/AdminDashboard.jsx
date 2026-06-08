import { useCallback, useEffect, useState } from 'react';
import { BarChart3, Edit, FolderOpen, Package, Plus, Save, ShoppingCart, Trash2, TrendingUp, Upload, Users, X, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import SafeImage from '../components/SafeImage';

const formatVND = (value) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value || 0);

const emptyProductForm = {
  name: '',
  category_id: '',
  price: '',
  stock: '',
  image_url: '',
  description: '',
};

export default function AdminDashboard() {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState('stats');
  const [stats, setStats] = useState(null);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [productModal, setProductModal] = useState(false);
  const [productForm, setProductForm] = useState(emptyProductForm);
  const [imagePreview, setImagePreview] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [categoryModal, setCategoryModal] = useState(false);
  const [categoryName, setCategoryName] = useState('');
  const [submittingCategory, setSubmittingCategory] = useState(false);
  const [searchProduct, setSearchProduct] = useState('');
  const [searchCategory, setSearchCategory] = useState('');
  const [searchOrder, setSearchOrder] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    const headers = { Authorization: `Bearer ${token}` };
    try {
      const catRes = await fetch('/api/?action=products/categories');
      const catData = await catRes.json();
      if (catData.status === 'success') setCategories(catData.data);

      if (activeTab === 'stats') {
        const res = await fetch('/api/?action=admin/stats', { headers });
        const data = await res.json();
        if (data.status === 'success') setStats(data.data);
      }
      if (activeTab === 'products') {
        const res = await fetch('/api/?action=products');
        const data = await res.json();
        if (data.status === 'success') setProducts(data.data);
      }
      if (activeTab === 'orders') {
        const res = await fetch('/api/?action=admin/orders', { headers });
        const data = await res.json();
        if (data.status === 'success') setOrders(data.data);
      }
    } catch (err) {
      console.error('Lỗi tải dữ liệu quản trị:', err);
    } finally {
      setLoading(false);
    }
  }, [activeTab, token]);

  const authHeaders = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const updateProductForm = (field, value) => {
    setProductForm((current) => ({ ...current, [field]: value }));
  };

  const openProductModal = (product = null) => {
    setProductModal(product);
    setProductForm(product ? {
      name: product.name || '',
      category_id: product.category_id || categories[0]?.id || '',
      price: product.price || '',
      stock: product.stock || '',
      image_url: product.image_url || '',
      description: product.description || '',
    } : { ...emptyProductForm, category_id: categories[0]?.id || '' });
    setImagePreview(product?.image_url || '');
  };

  const handleProductImageUpload = async (event) => {
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

    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);

    setUploadingImage(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch('/api/?action=upload/product-image', {
        method: 'POST',
        headers: authHeaders,
        body: formData,
      });
      const data = await response.json();
      if (response.ok && data.status === 'success') updateProductForm('image_url', data.url);
      else {
        alert(data.message || 'Upload ảnh thất bại.');
        setImagePreview('');
      }
    } catch (err) {
      console.error(err);
      alert('Không thể kết nối máy chủ.');
      setImagePreview('');
    } finally {
      setUploadingImage(false);
      event.target.value = '';
    }
  };

  const handleProductSubmit = async (event) => {
    event.preventDefault();
    if (!productForm.name || !productForm.price || productForm.stock === '' || !productForm.category_id) {
      alert('Vui lòng điền các trường bắt buộc.');
      return;
    }

    const action = productModal ? `admin/products/update&id=${productModal.id}` : 'admin/products/create';
    try {
      const response = await fetch(`/api/?action=${action}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify({
          ...productForm,
          category_id: Number(productForm.category_id),
          price: Number(productForm.price),
          stock: Number(productForm.stock),
        }),
      });
      const data = await response.json();
      if (response.ok && data.status === 'success') {
        setProductModal(false);
        fetchData();
      } else {
        alert(data.message || 'Thao tác thất bại.');
      }
    } catch (err) {
      console.error(err);
      alert('Không thể kết nối máy chủ.');
    }
  };

  const deleteProduct = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa sản phẩm này?')) return;
    try {
      const response = await fetch(`/api/?action=admin/products/delete&id=${id}`, { method: 'POST', headers: authHeaders });
      const data = await response.json();
      if (response.ok && data.status === 'success') fetchData();
      else alert(data.message || 'Xóa sản phẩm thất bại.');
    } catch (err) {
      console.error(err);
      alert('Không thể kết nối máy chủ.');
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    try {
      const response = await fetch(`/api/?action=admin/orders/update&id=${orderId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify({ status }),
      });
      const data = await response.json();
      if (response.ok && data.status === 'success') fetchData();
      else alert(data.message || 'Cập nhật đơn hàng thất bại.');
    } catch (err) {
      console.error(err);
      alert('Không thể kết nối máy chủ.');
    }
  };

  const openCategoryModal = (category = null) => {
    setCategoryModal(category);
    setCategoryName(category?.name || '');
  };

  const handleCategorySubmit = async (event) => {
    event.preventDefault();
    if (!categoryName.trim()) {
      alert('Vui lòng nhập tên danh mục.');
      return;
    }

    setSubmittingCategory(true);
    const action = categoryModal ? `admin/categories/update&id=${categoryModal.id}` : 'admin/categories/create';
    try {
      const response = await fetch(`/api/?action=${action}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify({ name: categoryName }),
      });
      const data = await response.json();
      if (response.ok && data.status === 'success') {
      setCategoryModal(false);
        setCategoryName('');
        fetchData();
      } else {
        alert(data.message || 'Thao tác thất bại.');
      }
    } catch (err) {
      console.error(err);
      alert('Không thể kết nối máy chủ.');
    } finally {
      setSubmittingCategory(false);
    }
  };

  const deleteCategory = async (id) => {
    if (!window.confirm('Xóa danh mục có thể xóa toàn bộ sản phẩm thuộc danh mục này. Bạn có chắc muốn tiếp tục?')) return;
    try {
      const response = await fetch(`/api/?action=admin/categories/delete&id=${id}`, { method: 'POST', headers: authHeaders });
      const data = await response.json();
      if (response.ok && data.status === 'success') fetchData();
      else alert(data.message || 'Xóa danh mục thất bại.');
    } catch (err) {
      console.error(err);
      alert('Không thể kết nối máy chủ.');
    }
  };

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchProduct.toLowerCase()) ||
    product.category_name.toLowerCase().includes(searchProduct.toLowerCase())
  );

  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(searchCategory.toLowerCase())
  );

  const filteredOrders = orders.filter((order) =>
    order.id.toString().includes(searchOrder) ||
    order.shipping_name.toLowerCase().includes(searchOrder.toLowerCase()) ||
    order.shipping_phone.includes(searchOrder)
  );

  return (
    <div className="container fade-in">
      <h1 className="page-title">Bảng quản trị hệ thống</h1>
      <p className="page-subtitle">Quản lý doanh số, sản phẩm, danh mục và đơn hàng của khách hàng.</p>

      <div className="admin-layout">
        <aside className="admin-sidebar">
          {[
            ['stats', BarChart3, 'Tổng quan'],
            ['products', Package, 'Sản phẩm'],
            ['orders', ShoppingCart, 'Đơn hàng'],
            ['categories', FolderOpen, 'Danh mục'],
          ].map(([key, Icon, label]) => (
            <button key={key} className={`admin-menu-item ${activeTab === key ? 'active' : ''}`} onClick={() => setActiveTab(key)}>
              <Icon size={18} />
              <span>{label}</span>
            </button>
          ))}
        </aside>

        <section className="admin-content">
          {loading ? <p>Đang tải dữ liệu...</p> : (
            <>
              {activeTab === 'stats' && stats && (
                <div>
                  <div className="stats-grid">
                    <StatCard icon={TrendingUp} label="Tổng doanh thu" value={formatVND(stats.stats?.revenue)} />
                    <StatCard icon={ShoppingCart} label="Số đơn hàng" value={stats.stats?.total_orders || 0} />
                    <StatCard icon={Users} label="Khách hàng" value={stats.stats?.total_customers || 0} />
                    <StatCard icon={Package} label="Sản phẩm CSDL" value={stats.stats?.total_products || 0} />
                  </div>
                  <div className="table-wrapper">
                    <table className="admin-table">
                      <thead>
                        <tr><th>Danh mục sản phẩm</th><th>Doanh số tích lũy</th></tr>
                      </thead>
                      <tbody>
                        {stats.category_sales?.length ? stats.category_sales.map((cat) => (
                          <tr key={cat.category_name}><td>{cat.category_name}</td><td>{formatVND(cat.sales)}</td></tr>
                        )) : <tr><td colSpan="2">Chưa có phát sinh giao dịch.</td></tr>}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === 'products' && (
                <div>
                  <div className="section-toolbar">
                    <h2>Danh sách sản phẩm</h2>
                    <div className="search-wrapper">
                      <Search size={16} className="search-icon" />
                      <input
                        type="text"
                        className="search-input"
                        placeholder="Tìm sản phẩm hoặc danh mục..."
                        value={searchProduct}
                        onChange={(e) => setSearchProduct(e.target.value)}
                      />
                    </div>
                    <button className="btn btn-primary btn-sm" onClick={() => openProductModal()}>
                      <Plus size={16} /> Thêm sản phẩm
                    </button>
                  </div>
                  <div className="table-wrapper">
                    <table className="admin-table">
                      <thead>
                        <tr><th>Ảnh</th><th>Tên sản phẩm</th><th>Danh mục</th><th>Giá bán</th><th>Kho</th><th>Thao tác</th></tr>
                      </thead>
                      <tbody>
                        {filteredProducts.map((product) => (
                          <tr key={product.id}>
                            <td><SafeImage src={product.image_url} alt={product.name} className="admin-thumb" /></td>
                            <td><strong>{product.name}</strong></td>
                            <td>{product.category_name}</td>
                            <td>{formatVND(product.price)}</td>
                            <td>{Number(product.stock) === 0 ? 'Hết hàng' : `${product.stock} chiếc`}</td>
                            <td>
                              <div className="table-actions">
                                <button className="btn btn-ghost" onClick={() => openProductModal(product)} title="Sửa"><Edit size={16} /></button>
                                <button className="btn btn-ghost danger-action" onClick={() => deleteProduct(product.id)} title="Xóa"><Trash2 size={16} /></button>
                              </div>
                            </td>
                          </tr>
                        ))}
                        {filteredProducts.length === 0 && <tr><td colSpan="6">Không tìm thấy sản phẩm nào.</td></tr>}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === 'orders' && (
                <div>
                  <div className="section-toolbar">
                    <h2>Quản lý đơn hàng</h2>
                    <div className="search-wrapper">
                      <Search size={16} className="search-icon" />
                      <input
                        type="text"
                        className="search-input"
                        placeholder="Tìm đơn hàng, khách hàng hoặc SĐT..."
                        value={searchOrder}
                        onChange={(e) => setSearchOrder(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="table-wrapper">
                    <table className="admin-table">
                      <thead>
                        <tr><th>Đơn hàng</th><th>Khách hàng</th><th>Thời gian</th><th>Tổng tiền</th><th>Trạng thái</th><th>Địa chỉ</th></tr>
                      </thead>
                      <tbody>
                        {filteredOrders.map((order) => (
                          <tr key={order.id}>
                            <td><strong>#{order.id}</strong></td>
                            <td>{order.shipping_name}<br /><small>SĐT: {order.shipping_phone}</small></td>
                            <td>{new Date(order.created_at).toLocaleDateString('vi-VN')}</td>
                            <td>{formatVND(order.total_amount)}</td>
                            <td>
                              <select className="form-select compact-select" value={order.status} onChange={(event) => updateOrderStatus(order.id, event.target.value)}>
                                <option value="pending">Chờ xử lý</option>
                                <option value="paid">Đã thanh toán</option>
                                <option value="shipped">Đang giao hàng</option>
                                <option value="delivered">Đã giao</option>
                                <option value="cancelled">Đã hủy</option>
                              </select>
                            </td>
                            <td className="truncate-cell">{order.shipping_address}</td>
                          </tr>
                        ))}
                        {filteredOrders.length === 0 && <tr><td colSpan="6">Không tìm thấy đơn hàng nào.</td></tr>}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === 'categories' && (
                <div>
                  <div className="section-toolbar">
                    <h2>Quản lý danh mục</h2>
                    <div className="search-wrapper">
                      <Search size={16} className="search-icon" />
                      <input
                        type="text"
                        className="search-input"
                        placeholder="Tìm danh mục..."
                        value={searchCategory}
                        onChange={(e) => setSearchCategory(e.target.value)}
                      />
                    </div>
                    <button className="btn btn-primary btn-sm" onClick={() => openCategoryModal()}>
                      <Plus size={16} /> Thêm danh mục
                    </button>
                  </div>
                  <div className="table-wrapper">
                    <table className="admin-table">
                      <thead>
                        <tr><th>ID</th><th>Tên danh mục</th><th>Slug</th><th>Thao tác</th></tr>
                      </thead>
                      <tbody>
                        {filteredCategories.map((cat) => (
                          <tr key={cat.id}>
                            <td>#{cat.id}</td>
                            <td><strong>{cat.name}</strong></td>
                            <td><code>{cat.slug}</code></td>
                            <td>
                              <div className="table-actions">
                                <button className="btn btn-ghost" onClick={() => openCategoryModal(cat)} title="Sửa"><Edit size={16} /></button>
                                <button className="btn btn-ghost danger-action" onClick={() => deleteCategory(cat.id)} title="Xóa"><Trash2 size={16} /></button>
                              </div>
                            </td>
                          </tr>
                        ))}
                        {filteredCategories.length === 0 && <tr><td colSpan="4">Không tìm thấy danh mục nào.</td></tr>}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </section>
      </div>

      {productModal !== false && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">{productModal ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}</h3>
              <button className="btn-icon" onClick={() => setProductModal(false)}><X size={20} /></button>
            </div>
            <form className="stack-form" onSubmit={handleProductSubmit}>
              <input className="form-input" value={productForm.name} onChange={(e) => updateProductForm('name', e.target.value)} placeholder="Tên sản phẩm *" required />
              <div className="two-col">
                <select className="form-select" value={productForm.category_id} onChange={(e) => updateProductForm('category_id', e.target.value)} required>
                  {categories.map((cat) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                </select>
                <input type="number" className="form-input" value={productForm.price} onChange={(e) => updateProductForm('price', e.target.value)} placeholder="Giá bán *" required />
              </div>
              <input type="number" className="form-input" value={productForm.stock} onChange={(e) => updateProductForm('stock', e.target.value)} placeholder="Số lượng trong kho *" required />
              {(imagePreview || productForm.image_url) && <SafeImage src={imagePreview || productForm.image_url} alt="Preview" className="image-preview" />}
              <label className="upload-button">
                <Upload size={14} />
                <span>{uploadingImage ? 'Đang tải...' : 'Tải ảnh lên'}</span>
                <input type="file" accept="image/*" onChange={handleProductImageUpload} disabled={uploadingImage} hidden />
              </label>
              <input className="form-input" value={productForm.image_url} onChange={(e) => { updateProductForm('image_url', e.target.value); setImagePreview(e.target.value); }} placeholder="Hoặc dán URL ảnh" />
              <textarea className="form-input" rows="4" value={productForm.description} onChange={(e) => updateProductForm('description', e.target.value)} placeholder="Mô tả sản phẩm" />
              <div className="button-row">
                <button type="button" className="btn btn-secondary" onClick={() => setProductModal(false)}>Hủy bỏ</button>
                <button type="submit" className="btn btn-primary"><Save size={16} /> Lưu</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {categoryModal !== false && (
        <div className="modal-overlay">
          <div className="modal-content small-modal">
            <div className="modal-header">
              <h3 className="modal-title">{categoryModal ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới'}</h3>
              <button className="btn-icon" onClick={() => setCategoryModal(false)}><X size={20} /></button>
            </div>
            <form className="stack-form" onSubmit={handleCategorySubmit}>
              <input className="form-input" value={categoryName} onChange={(event) => setCategoryName(event.target.value)} placeholder="Tên danh mục *" required />
              <div className="button-row">
                <button type="button" className="btn btn-secondary" onClick={() => setCategoryModal(false)}>Hủy bỏ</button>
                <button type="submit" className="btn btn-primary" disabled={submittingCategory}><Save size={16} /> {submittingCategory ? 'Đang xử lý...' : 'Lưu'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon: Icon, label, value }) {
  return (
    <div className="stat-card">
      <div className="stat-icon-wrapper"><Icon size={24} /></div>
      <div className="stat-info">
        <span className="stat-label">{label}</span>
        <span className="stat-value">{value}</span>
      </div>
    </div>
  );
}
