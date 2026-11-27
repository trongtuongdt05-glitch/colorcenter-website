import type { Metadata } from 'next';
import Link from 'next/link';
import '../_components/admin-workspace.css';
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
    return <main className="admin workspace-shell workspace-login"><div className="admin-content">
      <section className="admin-panel"><Link href="/" className="login-brand">Color Center</Link><h1>Đăng nhập CPanel</h1>
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
  return <main className="admin workspace-shell"><Editor initial={site.data} initialRevision={site.revision} leads={leads} mailConfigured={leadMailConfigured()}/></main>;
}
