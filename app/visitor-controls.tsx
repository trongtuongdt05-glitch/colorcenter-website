'use client';

import { useEffect, useState } from 'react';
import type { SiteContent } from '../lib/colorcenter';

export function Showcase({projects, showFilters = true}: {projects: (SiteContent['projects'][number] & {slug: string})[]; showFilters?: boolean}) {
  const [category, setCategory] = useState('');
  const categories = [...new Set(projects.map(item => item.category))];
  return <>
    {showFilters && categories.length > 1 && <div className="filters" aria-label="Lọc dự án">{['', ...categories].map(name => <button type="button" className="pill" key={name} aria-pressed={category === name} onClick={() => setCategory(name)}>{name || 'Tất cả'}</button>)}</div>}
    <div className="project-grid">{projects.filter(item => !category || item.category === category).map(item => <article key={item.slug}>{item.image && <img className={item.category === 'Dự án mẫu' ? 'sample-project-image' : undefined} src={item.image} alt={item.title} loading="lazy"/>}<div><p className="kicker">{item.category}</p><h3><a href={`/du-an/${item.slug}`}>{item.title}</a></h3><p>{item.description}</p><a className="text-link project-link" href={`/du-an/${item.slug}`} aria-label={`Xem dự án ${item.title}`}>Xem dự án</a></div></article>)}</div>
  </>;
}

export function InquiryForm({services}: {services: string[]}) {
  const [status, setStatus] = useState('');
  const [pending, setPending] = useState(false);
  const [service, setService] = useState('');
  useEffect(() => {
    const option = new URLSearchParams(location.search).get('dich-vu');
    if (option && services.includes(option)) setService(option);
  }, [services]);

  return <form className="quote" onSubmit={async event => {
    event.preventDefault();
    const form = event.currentTarget;
    setPending(true);
    setStatus('');
    try {
      const response = await fetch('/api/inquiries', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(Object.fromEntries(new FormData(form)))});
      if (!response.ok) {
        const data = await response.json().catch(() => ({})) as {error?:string};
        setStatus(data.error || 'Gửi chưa thành công. Vui lòng thử lại hoặc nhắn Zalo.');
        return;
      }
      form.reset();
      setService('');
      setStatus('Color Center đã nhận được yêu cầu của bạn.');
    } catch {
      setStatus('Chưa kết nối được. Vui lòng thử lại hoặc nhắn Zalo.');
    } finally {
      setPending(false);
    }
  }}><h3>Gửi yêu cầu báo giá</h3><div className="form-grid">
    <label>Họ tên<input name="name" autoComplete="name" required minLength={2} maxLength={100}/></label>
    <label>Số điện thoại<input name="phone" type="tel" autoComplete="tel" required minLength={8} maxLength={24}/></label>
  </div><label>Dịch vụ<select name="service" value={service} onChange={event=>setService(event.target.value)}><option value="">Chưa chọn</option>{services.map((name,i)=><option key={i}>{name}</option>)}</select></label>
  <label>Nội dung yêu cầu<textarea name="message" required minLength={5} maxLength={1800} rows={4} placeholder="Ví dụ: Bảng hiệu chữ nổi cho cửa hàng, ngang 4 m."/></label>
  <input hidden name="website" tabIndex={-1} autoComplete="off"/>
  <p className="form-note">Color Center dùng thông tin bạn gửi để liên hệ tư vấn và báo giá.</p>
  <button className="button" disabled={pending}>{pending ? 'Đang gửi…' : 'Gửi yêu cầu'}</button><div aria-live="polite">{status}</div>
  </form>;
}
