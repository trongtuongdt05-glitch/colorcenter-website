import type { Card } from '../../lib/colorcenter';
import { quoteUrl } from '../../lib/site-navigation';

export function PageHeading({title, description, parent}: {
  title: string; description?: string; parent?: {title: string; href: string};
}) {
  return <section className="page-heading"><div className="wrap">
    <nav className="breadcrumb" aria-label="Đường dẫn trang">
      <a href="/">Trang chủ</a><span aria-hidden="true">/</span>
      {parent && <><a href={parent.href}>{parent.title}</a><span aria-hidden="true">/</span></>}
      <span aria-current="page">{title}</span>
    </nav>
    <h1>{title}</h1>{description && <p>{description}</p>}
  </div></section>;
}

export function ServiceGrid({items}: {items: (Card & {slug: string})[]}) {
  if (!items.length) return <p>Vui lòng <a href="/lien-he">liên hệ Color Center</a> để được tư vấn dịch vụ.</p>;
  return <div className="service-grid service-directory">{items.map(item => <article className="service" key={item.slug}>
    {item.image && <img src={item.image} alt={item.title} loading="lazy"/>}
    <div className="service-body"><h3><a href={`/dich-vu/${item.slug}`}>{item.title}</a></h3>
      <p>{item.description}</p><a className="text-link" href={`/dich-vu/${item.slug}`} aria-label={`Xem chi tiết ${item.title}`}>Xem chi tiết</a>
    </div>
  </article>)}</div>;
}

export function Process() {
  return <div className="steps"><h3>Từ yêu cầu đến bàn giao</h3><ol>
    <li>Tiếp nhận nhu cầu và khảo sát mặt bằng</li>
    <li>Tư vấn vật liệu, báo giá và duyệt mẫu</li>
    <li>Gia công, lắp đặt và bàn giao</li>
  </ol></div>;
}

export function QuoteBanner({service}: {service?: string}) {
  return <section id="bao-gia" className="quote-banner">
    <div className="wrap quote-banner-inner">
      <div><h2>Bạn cần báo giá cho dự án?</h2><p>Gửi hạng mục, kích thước dự kiến và thời điểm cần hoàn thành.</p></div>
      <a className="button" href={quoteUrl(service)}>Yêu cầu báo giá</a>
    </div>
  </section>;
}
