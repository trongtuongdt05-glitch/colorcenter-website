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

export function ServiceGrid({items,english = false}: {items: (Card & {slug: string})[]; english?:boolean}) {
  if (!items.length) return <p>Vui lòng <a href="/lien-he">liên hệ Color Center</a> để được tư vấn dịch vụ.</p>;
  return <div className="service-grid service-directory">{items.map(item => <article className="service" key={item.slug}>
    {item.image && <img src={item.image} alt={item.title} loading="lazy"/>}
    <div className="service-body"><h3><a href={`/dich-vu/${item.slug}`}>{item.title}</a></h3>
      <p>{item.description}</p><a className="text-link" href={`/dich-vu/${item.slug}`} aria-label={`${english ? 'View details:' : 'Xem chi tiết'} ${item.title}`}>{english ? 'View details' : 'Xem chi tiết'}</a>
    </div>
  </article>)}</div>;
}

export function Process({english = false}: {english?:boolean}) {
  return <div className="steps"><h3>{english ? 'From brief to handover' : 'Từ yêu cầu đến bàn giao'}</h3><ol>
    <li>{english ? 'Discuss the brief and survey the site' : 'Tiếp nhận nhu cầu và khảo sát mặt bằng'}</li>
    <li>{english ? 'Recommend materials, prepare a quote and approve samples' : 'Tư vấn vật liệu, báo giá và duyệt mẫu'}</li>
    <li>{english ? 'Fabricate, install and hand over' : 'Gia công, lắp đặt và bàn giao'}</li>
  </ol></div>;
}

export function QuoteBanner({service,english = false}: {service?: string; english?:boolean}) {
  return <section id="bao-gia" className="quote-banner">
    <div className="wrap quote-banner-inner">
      <div><h2>{english ? 'Need a quote for your project?' : 'Bạn cần báo giá cho dự án?'}</h2><p>{english ? 'Share the scope, estimated dimensions and completion date.' : 'Gửi hạng mục, kích thước dự kiến và thời điểm cần hoàn thành.'}</p></div>
      <a className="button" href={quoteUrl(service)}>{english ? 'Request a quote' : 'Yêu cầu báo giá'}</a>
    </div>
  </section>;
}
