import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, BookOpen, ChevronDown, ChevronUp, Clock, CreditCard, FileText, Headphones, Mail, MapPin, MessageCircle, Package, Phone, RefreshCw, Search, ShieldCheck, Truck, UserCheck } from 'lucide-react';

const faqCategories = [
  {
    title: 'Đặt hàng & thanh toán',
    icon: CreditCard,
    questions: [
      ['Tôi có thể đặt hàng khi chưa đăng ký không?', 'Có. Bạn có thể đặt hàng với tư cách khách vãng lai. Tạo tài khoản giúp theo dõi lịch sử đơn hàng thuận tiện hơn.'],
      ['EZShop hỗ trợ phương thức thanh toán nào?', 'Website hỗ trợ COD và thanh toán thẻ giả lập. Các phương thức ví điện tử có thể được tích hợp thêm ở giai đoạn sau.'],
      ['Tôi có thể hủy đơn sau khi đặt không?', 'Bạn có thể liên hệ hỗ trợ để hủy đơn khi đơn chưa được chuyển sang trạng thái đang giao hàng.'],
    ],
  },
  {
    title: 'Vận chuyển',
    icon: Truck,
    questions: [
      ['Thời gian giao hàng mất bao lâu?', 'Nội thành thường 1-2 ngày, các tỉnh thành khác 2-4 ngày tùy khu vực.'],
      ['Phí vận chuyển được tính thế nào?', 'EZShop đang miễn phí vận chuyển toàn quốc cho đơn hàng tiêu chuẩn.'],
      ['Có thể đổi địa chỉ giao hàng không?', 'Có thể đổi trước khi đơn được bàn giao cho đơn vị vận chuyển.'],
    ],
  },
  {
    title: 'Đổi trả & bảo hành',
    icon: RefreshCw,
    questions: [
      ['Chính sách đổi trả là gì?', 'Sản phẩm đủ điều kiện được hỗ trợ đổi trả trong 30 ngày nếu lỗi từ nhà sản xuất hoặc giao sai mô tả.'],
      ['Bảo hành sản phẩm như thế nào?', 'Sản phẩm được bảo hành theo chính sách của hãng và trung tâm ủy quyền.'],
      ['Trường hợp nào không được bảo hành?', 'Hư hỏng do va đập, vào nước, tự ý sửa chữa hoặc hết thời hạn bảo hành có thể bị từ chối.'],
    ],
  },
  {
    title: 'Tài khoản & bảo mật',
    icon: ShieldCheck,
    questions: [
      ['Làm sao đổi thông tin tài khoản?', 'Đăng nhập, vào trang Đơn hàng/Hồ sơ và cập nhật thông tin trong khung tài khoản.'],
      ['Thông tin cá nhân có được bảo mật không?', 'Dữ liệu được dùng cho xử lý đơn hàng và không chia sẻ cho bên thứ ba ngoài mục đích vận hành dịch vụ.'],
      ['Tôi quên mật khẩu thì sao?', 'Tính năng đặt lại mật khẩu qua email nên được bổ sung trước khi đưa website vào vận hành thật.'],
    ],
  },
];

const contactMethods = [
  { icon: Phone, title: 'Hotline', value: '1900-EZSHOP', desc: '8:00 - 22:00 hằng ngày' },
  { icon: Mail, title: 'Email hỗ trợ', value: 'support@ezshop.vn', desc: 'Phản hồi trong 2 giờ làm việc' },
  { icon: MessageCircle, title: 'Live chat', value: 'Chat trực tuyến', desc: 'Hỗ trợ trong giờ hành chính' },
  { icon: MapPin, title: 'Showroom', value: '123 Nguyễn Huệ, Q.1, TP.HCM', desc: 'Thứ 2 - Thứ 7' },
];

const helpTopics = [
  { icon: Package, title: 'Theo dõi đơn hàng', desc: 'Xem trạng thái và lịch sử giao dịch', link: '/profile' },
  { icon: UserCheck, title: 'Quản lý tài khoản', desc: 'Cập nhật thông tin cá nhân', link: '/profile' },
  { icon: FileText, title: 'Chính sách bán hàng', desc: 'Điều khoản và quy định dịch vụ', link: '/about' },
  { icon: BookOpen, title: 'Hướng dẫn mua hàng', desc: 'Quy trình đặt hàng cơ bản', link: '#guide' },
];

function FAQItem({ question, answer }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="faq-item">
      <button onClick={() => setIsOpen(!isOpen)}>
        <span>{question}</span>
        {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </button>
      {isOpen && <p>{answer}</p>}
    </div>
  );
}

export default function Help() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState(0);

  const filteredCategories = faqCategories
    .map((cat) => ({
      ...cat,
      questions: cat.questions.filter(([q, a]) => `${q} ${a}`.toLowerCase().includes(searchQuery.toLowerCase())),
    }))
    .filter((cat) => cat.questions.length > 0);
  const visibleCategories = searchQuery ? filteredCategories : faqCategories;
  const visibleQuestions = searchQuery ? filteredCategories : [faqCategories[activeCategory]];

  return (
    <div className="fade-in">
      <section className="help-hero">
        <div className="container">
          <Headphones size={34} />
          <h1>Trung tâm hỗ trợ</h1>
          <p>Tìm câu trả lời nhanh hoặc liên hệ đội ngũ hỗ trợ EZShop.</p>
          <div className="help-search">
            <Search size={20} />
            <input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Tìm kiếm câu hỏi..." />
          </div>
        </div>
      </section>

      <section className="container section-block">
        <div className="info-grid compact">
          {helpTopics.map((topic) => (
            <Link className="info-card" key={topic.title} to={topic.link}>
              <topic.icon size={20} />
              <h3>{topic.title}</h3>
              <p>{topic.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="section-band" id="faq">
        <div className="container faq-layout">
          <aside className="faq-tabs">
            {visibleCategories.map((cat, index) => {
              const isActive = searchQuery ? index === 0 : activeCategory === index;
              return (
                <button key={cat.title} className={isActive ? 'active' : ''} onClick={() => setActiveCategory(index)}>
                  <cat.icon size={16} />
                  <span>{cat.title}</span>
                </button>
              );
            })}
          </aside>
          <div className="faq-list">
            {visibleQuestions.map((cat) => cat.questions.map(([q, a]) => <FAQItem key={`${cat.title}-${q}`} question={q} answer={a} />))}
            {searchQuery && filteredCategories.length === 0 && (
              <div className="empty-state">
                <AlertTriangle size={36} />
                <p>Không tìm thấy kết quả cho “{searchQuery}”.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      <section id="guide" className="container section-block">
        <div className="section-heading">
          <span className="eyebrow">Hướng dẫn</span>
          <h2>Mua hàng tại EZShop với 4 bước</h2>
        </div>
        <div className="steps-grid">
          {[
            ['01', 'Tìm sản phẩm', 'Duyệt danh mục hoặc tìm kiếm sản phẩm cần mua.'],
            ['02', 'Thêm vào giỏ', 'Chọn số lượng và thêm sản phẩm vào giỏ hàng.'],
            ['03', 'Thanh toán', 'Điền thông tin giao hàng và chọn phương thức thanh toán.'],
            ['04', 'Nhận hàng', 'Theo dõi trạng thái và nhận sản phẩm tại địa chỉ đã nhập.'],
          ].map(([step, title, desc]) => (
            <article className="step-card" key={step}>
              <span>{step}</span>
              <h3>{title}</h3>
              <p>{desc}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section-band">
        <div className="container">
          <div className="section-heading">
            <span className="eyebrow">Liên hệ hỗ trợ</span>
            <h2>Không tìm thấy câu trả lời?</h2>
          </div>
          <div className="info-grid">
            {contactMethods.map((method) => (
              <article className="info-card" key={method.title}>
                <method.icon size={22} />
                <h3>{method.title}</h3>
                <strong>{method.value}</strong>
                <p><Clock size={12} /> {method.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
