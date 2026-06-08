import { Award, CheckCircle2, Globe, Headphones, Heart, RefreshCw, ShieldCheck, Truck, Users, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

const stats = [
  { value: '50K+', label: 'Khách hàng tin dùng', icon: Users },
  { value: '200+', label: 'Thương hiệu đối tác', icon: Award },
  { value: '99.8%', label: 'Tỷ lệ hài lòng', icon: CheckCircle2 },
];

const values = [
  { icon: Heart, title: 'Khách hàng là trung tâm', desc: 'Mỗi quyết định đều hướng đến trải nghiệm mua sắm rõ ràng, nhanh và đáng tin cậy.' },
  { icon: Zap, title: 'Đổi mới liên tục', desc: 'Danh mục sản phẩm được cập nhật theo xu hướng công nghệ mới và nhu cầu thực tế.' },
  { icon: ShieldCheck, title: 'Chính hãng & uy tín', desc: 'Sản phẩm có nguồn gốc rõ ràng, chính sách bảo hành minh bạch.' },
  { icon: Globe, title: 'Phát triển bền vững', desc: 'Tối ưu vận hành, đóng gói và dịch vụ để giảm lãng phí không cần thiết.' },
];

const commitments = [
  { icon: ShieldCheck, title: 'Bảo hành chính hãng', desc: 'Bảo hành 12-24 tháng tùy sản phẩm tại trung tâm ủy quyền.' },
  { icon: Truck, title: 'Giao hàng miễn phí', desc: 'Miễn phí giao hàng toàn quốc cho mọi đơn hàng.' },
  { icon: RefreshCw, title: 'Đổi trả dễ dàng', desc: 'Hỗ trợ đổi trả trong 30 ngày với sản phẩm đủ điều kiện.' },
  { icon: Headphones, title: 'Hỗ trợ tận tâm', desc: 'Đội ngũ tư vấn hỗ trợ qua email, hotline và live chat.' },
];

export default function AboutUs() {
  return (
    <div className="fade-in">
      <section className="about-hero">
        <div className="container">
          <span className="eyebrow">Về chúng tôi</span>
          <h1>Nâng tầm trải nghiệm mua sắm công nghệ trực tuyến.</h1>
          <p>EZShop mang đến sản phẩm chính hãng, giá minh bạch và dịch vụ hậu mãi chuyên nghiệp cho khách hàng trên toàn quốc.</p>
          <div className="button-row">
            <Link to="/" className="btn btn-light">Mua sắm ngay</Link>
            <Link to="/help" className="btn btn-outline-light">Trung tâm hỗ trợ</Link>
          </div>
        </div>
      </section>

      <section className="container section-block">
        <div className="stats-grid">
          {stats.map((item) => (
            <div className="stat-card" key={item.label}>
              <div className="stat-icon-wrapper"><item.icon size={24} /></div>
              <div className="stat-info">
                <span className="stat-value">{item.value}</span>
                <span className="stat-label">{item.label}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="container section-block two-column-content">
        <div>
          <span className="eyebrow">Câu chuyện</span>
          <h2>Được xây dựng từ nhu cầu mua hàng công nghệ đáng tin cậy.</h2>
          <p>EZShop bắt đầu với mục tiêu đơn giản: giúp khách hàng tìm đúng sản phẩm, hiểu rõ thông tin và nhận hỗ trợ sau mua một cách nhanh chóng.</p>
          <p>Sau nhiều năm phát triển, hệ thống tập trung vào danh mục chọn lọc, trải nghiệm đặt hàng gọn và quy trình vận hành dễ kiểm soát.</p>
        </div>
        <div className="vision-box">
          <h3>Tầm nhìn 2030</h3>
          <p>Trở thành nền tảng thương mại điện tử công nghệ đáng tin cậy tại Việt Nam, phục vụ khách hàng bằng dữ liệu minh bạch và dịch vụ nhất quán.</p>
        </div>
      </section>

      <section className="container section-block">
        <div className="section-heading">
          <span className="eyebrow">Giá trị cốt lõi</span>
          <h2>Những nguyên tắc dẫn lối</h2>
        </div>
        <div className="info-grid">
          {values.map((item) => (
            <article className="info-card" key={item.title}>
              <item.icon size={22} />
              <h3>{item.title}</h3>
              <p>{item.desc}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="container section-block">
        <div className="section-heading">
          <span className="eyebrow">Cam kết dịch vụ</span>
          <h2>Mua sắm rõ ràng từ lúc chọn hàng đến sau khi nhận hàng</h2>
        </div>
        <div className="info-grid">
          {commitments.map((item) => (
            <article className="info-card" key={item.title}>
              <item.icon size={22} />
              <h3>{item.title}</h3>
              <p>{item.desc}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
