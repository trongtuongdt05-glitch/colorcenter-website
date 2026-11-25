import type { CSSProperties, ReactNode } from 'react';
import { getContent } from '../../lib/colorcenter-server';
import { phoneUrl, publicEntries, quoteUrl } from '../../lib/site-navigation';
import { ZaloLink } from './zalo-link';
import { Navigation } from './navigation';

export const dynamic = 'force-dynamic';

export default async function CompanyLayout({children}: {children: ReactNode}) {
  const {data} = await getContent();
  const services = publicEntries(data.services);
  return <div className="company-site" style={{'--accent':data.accent} as CSSProperties}>
    <a className="skip-link" href="#noi-dung">Đến nội dung chính</a>
    <header className="masthead company-header">
      <div className="contact-bar"><div className="wrap contact-bar-inner">
        <span>{data.address}</span>
        <div><a href={phoneUrl(data.phone)}>{data.phone}</a><a href={`mailto:${data.email}`}>{data.email}</a></div>
      </div></div>
      <div className="wrap company-top">
        <a className="brand" href="/" aria-label={`${data.name} – Trang chủ`}>
          {data.logo && <img src={data.logo} alt=""/>}<span>{data.name}</span>
        </a>
        <Navigation services={services.map(({title,slug}) => ({title,slug}))}/>
        <a className="button compact top-quote" href={quoteUrl()}>Nhận báo giá</a>
      </div>
    </header>
    <main id="noi-dung" tabIndex={-1}>{children}</main>
    <footer className="company-footer">
      <div className="wrap footer-grid">
        <div><a className="footer-brand" href="/">{data.name}</a><p>Thiết kế và thi công quảng cáo</p></div>
        <nav aria-label="Điều hướng cuối trang">
          <a href="/dich-vu">Dịch vụ</a><a href="/du-an">Dự án</a><a href="/gioi-thieu">Giới thiệu</a><a href="/lien-he">Liên hệ</a>
        </nav>
        <div><a href={phoneUrl(data.phone)}>{data.phone}</a><a href={`mailto:${data.email}`}>{data.email}</a><p>{data.address}</p></div>
      </div>
      <div className="wrap footer-bottom"><span>© {data.name}</span></div>
    </footer>
    <ZaloLink href={data.zalo} floating/>
  </div>;
}
