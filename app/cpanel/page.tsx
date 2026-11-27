import type { Metadata } from 'next';
import { getContent, type Lead } from '../../lib/colorcenter-server';
import { currentAdmin } from '../../lib/admin-auth';
import { adminConfigured, records } from '../../lib/supabase';
import { Editor } from './editor';
import { leadMailConfigured } from '../../lib/lead-notification';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = {title:'CPanel | Color Center', robots:{index:false, follow:false}};

export default async function AdminPage({searchParams}: {searchParams:Promise<{loi?:string}>}) {
  const user = await currentAdmin();
  if (!user) {
    const configured = adminConfigured();
    const {loi} = await searchParams;
    return <main className="admin"><div className="admin-content"><h1>CPanel Color Center</h1>
      <section className="admin-panel" style={{maxWidth:460}}>
        {!configured ? <p>Cần kết nối Supabase và thiết lập tài khoản quản trị.</p> : <form className="editor-fields" action="/api/admin-session" method="post">
          {loi && <p role="alert">{loi==='ket-noi' ? 'Chưa kết nối được. Vui lòng thử lại.' : 'Email hoặc mật khẩu không đúng.'}</p>}
          <label>Email quản trị<input type="email" name="email" required autoComplete="username"/></label>
          <label>Mật khẩu<input type="password" name="password" maxLength={256} required autoComplete="current-password"/></label>
          <button className="button">Đăng nhập</button>
        </form>}
      </section>
    </div></main>;
  }
  const [site,leads] = await Promise.all([getContent(),records<Lead>('inquiries?order=created.desc&limit=200')]);
  return <main className="admin"><header className="admin-head"><div><strong>Color Center</strong><span>{user.email}</span></div><nav>
    <a href="/crm">CRM công việc</a><a href="/">Xem trang công ty</a><form action="/api/admin-session" method="post"><button name="action" value="logout" className="button compact">Đăng xuất</button></form>
  </nav></header><Editor initial={site.data} initialRevision={site.revision} leads={leads} mailConfigured={leadMailConfigured()}/></main>;
}
