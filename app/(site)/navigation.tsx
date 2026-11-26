'use client';

import { useRef, useState } from 'react';
import { usePathname } from 'next/navigation';

const links = [
  { label: 'Dự án', english: 'Projects', href: '/du-an' },
  { label: 'Giới thiệu', english: 'About', href: '/gioi-thieu' },
  { label: 'Liên hệ', english: 'Contact', href: '/lien-he' },
];

export function Navigation({services,english}: {services: { title: string; slug: string }[]; english:boolean}) {
  const path = usePathname();
  const [mobile, setMobile] = useState(false);
  const [dropdown, setDropdown] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  const serviceButton = useRef<HTMLButtonElement>(null);
  const isActive = (href: string) => path === href || (href !== '/' && path.startsWith(href + '/'));
  const close = () => { setMobile(false); setDropdown(false); };
  return <div className="site-nav" onKeyDown={event => {
    if (event.key !== 'Escape') return;
    if (dropdown) { setDropdown(false); serviceButton.current?.focus(); }
    else if (mobile) { setMobile(false); menuButton.current?.focus(); }
  }} onBlur={event => {
    if (!event.currentTarget.contains(event.relatedTarget)) close();
  }}>
    <button ref={menuButton} className="menu-toggle" type="button" aria-expanded={mobile}
      aria-controls="primary-nav" onClick={() => mobile ? close() : setMobile(true)}>
      <span className="menu-icon" aria-hidden="true" /> Menu
    </button>
    <nav id="primary-nav" aria-label="Điều hướng chính" className={mobile ? 'primary-nav is-open' : 'primary-nav'}>
      <ul>
        <li><a href="/" aria-current={isActive('/') ? 'page' : undefined} onClick={close}>{english ? 'Home' : 'Trang chủ'}</a></li>
        <li className="nav-services" data-active={isActive('/dich-vu')}>
          <button ref={serviceButton} type="button" className="service-toggle" aria-expanded={dropdown} aria-controls="service-nav"
            onClick={() => setDropdown(open => !open)}>{english ? 'Services' : 'Dịch vụ'} <span className="chevron" aria-hidden="true" /></button>
          <ul className="service-nav" id="service-nav" hidden={!dropdown}>
            <li><a href="/dich-vu" aria-current={path === '/dich-vu' ? 'page' : undefined} onClick={close}>{english ? 'All services' : 'Tất cả dịch vụ'}</a></li>
            {services.map(item => <li key={item.slug}><a href={`/dich-vu/${item.slug}`} aria-current={path === `/dich-vu/${item.slug}` ? 'page' : undefined} onClick={close}>{item.title}</a></li>)}
          </ul>
        </li>
        {links.map(item => <li key={item.href}><a href={item.href} aria-current={isActive(item.href) ? (path === item.href ? 'page' : 'location') : undefined} onClick={close}>{english ? item.english : item.label}</a></li>)}
      </ul>
    </nav>
  </div>;
}
