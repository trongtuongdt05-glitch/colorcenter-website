import Link from 'next/link';
import type { ReactNode } from 'react';
import './admin-workspace.css';

export function AdminBar({area, children}: {area:'cpanel'|'crm';children?:ReactNode}) {
  return <header className="workspace-bar">
    <div className="workspace-top">
      <Link className="workspace-brand" href="/" aria-label="Color Center, xem website">
        <span aria-hidden="true">C</span><strong>Color Center</strong>
      </Link>
      <nav className="workspace-switch" aria-label="Khu vực quản lý">
        <Link href="/cpanel" aria-current={area === 'cpanel' ? 'page' : undefined}>CPanel</Link>
        <Link href="/crm" aria-current={area === 'crm' ? 'page' : undefined}>CRM</Link>
      </nav>
      <form action="/api/admin-session" method="post">
        <button name="action" value="logout">Đăng xuất</button>
      </form>
    </div>
    {children}
  </header>;
}
