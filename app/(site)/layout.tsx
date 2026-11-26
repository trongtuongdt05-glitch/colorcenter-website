import { isEnglish, serviceEnglish } from '../../lib/site-language';
import { LanguageSwitch } from './language-switch';
import type { CSSProperties, ReactNode } from 'react';
import { getContent } from '../../lib/colorcenter-server';
import { phoneUrl, publicEntries, quoteUrl } from '../../lib/site-navigation';
import { ZaloLink } from './zalo-link';
import { Navigation } from './navigation';

export const dynamic = 'force-dynamic';

export default async function CompanyLayout({children}: {children: ReactNode}) {
  const {data} = await getContent();
  const en = await isEnglish();
  const services = publicEntries(data.services);
  return <div className="company-site" lang={en ? "en" : "vi"} style={{'--accent':data.accent} as CSSProperties}>
    <a className="skip-link" href="#noi-dung">{en ? 'Skip to content' : 'Đến nội dung chính'}</a>
    <header className="masthead company-header">
      <div className="contact-bar"><div className="wrap contact-bar-inner">
        <span>{data.address}</span>
        <div><a href={phoneUrl(data.phone)}>{data.phone}</a><a href={`mailto:${data.email}`}>{data.email}</a></div>
      </div></div>
      <div className="wrap company-top">
        <a className="brand" href="/" aria-label={`${data.name} – Trang chủ`}>
          {data.logo && <img src={data.logo} alt=""/>}<span>{data.name}</span>
        </a>
        <Navigation services={services.map(({title,slug}) => ({title:en ? serviceEnglish(title) : title,slug}))} english={en}/>
        <div className="company-actions"><LanguageSwitch english={en}/><a className="button compact top-quote" href={quoteUrl()}>{en ? 'Get a quote' : 'Nhận báo giá'}</a></div>
      </div>
    </header>
    <main id="noi-dung" tabIndex={-1}>{children}</main>
    <footer className="company-footer">
      <div className="wrap footer-grid">
        <div><a className="footer-brand" href="/">{data.name}</a><p>{en ? 'Sign design and installation' : 'Thiết kế và thi công quảng cáo'}</p></div>
        <nav aria-label="Điều hướng cuối trang">
          <a href="/dich-vu">{en ? 'Services' : 'Dịch vụ'}</a><a href="/du-an">{en ? 'Projects' : 'Dự án'}</a><a href="/gioi-thieu">{en ? 'About' : 'Giới thiệu'}</a><a href="/lien-he">{en ? 'Contact' : 'Liên hệ'}</a>
        </nav>
        <div><a href={phoneUrl(data.phone)}>{data.phone}</a><a href={`mailto:${data.email}`}>{data.email}</a><p>{data.address}</p></div>
      </div>
      <div className="wrap footer-bottom"><span>© {data.name}</span></div>
    </footer>
    <ZaloLink href={data.zalo} floating/>
  </div>;
}
