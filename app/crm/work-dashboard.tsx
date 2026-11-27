import Link from 'next/link';
import { installationCovers, orderUrl, stageTone, stages, type Order } from './model';

export function WorkDashboard({orders, today}: {orders:Order[]; today:string}) {
  const activeInstall = orders.filter(order => installationCovers(order, today) && order.status !== 'Đã bàn giao');
  return <>
    <section className="crm-card"><div className="crm-toolbar"><h2>Tiến độ đơn hàng</h2><Link href="/crm?tab=orders">Tất cả đơn hàng →</Link></div>
      <div className="crm-pipeline">{stages.map(stage => <Link className="crm-stage-tile" data-tone={stageTone(stage)}
        href={`/crm?tab=orders&status=${encodeURIComponent(stage)}`} key={stage}>
        <span>{stage}</span><strong>{orders.filter(order => order.status === stage).length}</strong>
      </Link>)}</div>
    </section>
    <section className="crm-card"><div className="crm-toolbar"><h2>Lịch thi công hôm nay · {activeInstall.length}</h2><Link href="/crm?tab=calendar">Mở lịch tháng →</Link></div>
      {activeInstall.length ? <ul>{activeInstall.map(order => <li key={order.id}>
        <Link href={orderUrl(order.id)}>{order.title}</Link>{order.assignee && ` · ${order.assignee}`}{order.address && ` · ${order.address}`}
      </li>)}</ul> : <p>Hôm nay chưa có lịch thi công cần theo dõi.</p>}
    </section>
  </>;
}
