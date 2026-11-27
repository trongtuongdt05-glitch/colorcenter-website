import Link from 'next/link';
import { dateLabel, installationCovers, orderUrl, shiftDay, stageTone, stages, type Order } from './model';

export function WorkDashboard({orders, today}: {orders:Order[]; today:string}) {
  const openTasks = orders.filter(order => order.next_task && !order.task_done && order.task_due)
    .sort((a,b) => (a.task_due ?? '').localeCompare(b.task_due ?? ''));
  const horizon = shiftDay(today, 7);
  const taskGroups = [
    {label:'Đã quá hạn',tone:'red',rows:openTasks.filter(order => order.task_due! < today)},
    {label:'Đến hạn hôm nay',tone:'amber',rows:openTasks.filter(order => order.task_due === today)},
    {label:'7 ngày tới',tone:'blue',rows:openTasks.filter(order => order.task_due! > today && order.task_due! <= horizon)},
  ];
  const activeInstall = orders.filter(order => installationCovers(order, today) && order.status !== 'Đã bàn giao');
  return <>
    <section className="crm-card"><div className="crm-toolbar"><h2>Tiến độ đơn hàng</h2><Link href="/crm?tab=orders">Tất cả đơn hàng →</Link></div>
      <div className="crm-pipeline">{stages.map(stage => <Link className="crm-stage-tile" data-tone={stageTone(stage)}
        href={`/crm?tab=orders&status=${encodeURIComponent(stage)}`} key={stage}>
        <span>{stage}</span><strong>{orders.filter(order => order.status === stage).length}</strong>
      </Link>)}</div>
    </section>
    <section className="crm-card"><h2>Việc cần xử lý</h2>
      <div className="crm-work-grid">{taskGroups.map(group => <div key={group.label} className="crm-work-group">
        <h3 className="crm-chip" data-tone={group.tone}>{group.label} · {group.rows.length}</h3>
        {group.rows.length ? <ul>{group.rows.map(order => <li key={order.id}>
          <Link href={orderUrl(order.id)}>{order.next_task}</Link>
          <small>{order.title} · {dateLabel(order.task_due!)}{order.assignee && ` · ${order.assignee}`}</small>
        </li>)}</ul> : <p>Chưa có việc.</p>}
      </div>)}</div>
    </section>
    <section className="crm-card"><div className="crm-toolbar"><h2>Lịch thi công hôm nay · {activeInstall.length}</h2><Link href="/crm?tab=calendar">Mở lịch tháng →</Link></div>
      {activeInstall.length ? <ul>{activeInstall.map(order => <li key={order.id}>
        <Link href={orderUrl(order.id)}>{order.title}</Link>{order.assignee && ` · ${order.assignee}`}{order.address && ` · ${order.address}`}
      </li>)}</ul> : <p>Hôm nay chưa có lịch thi công cần theo dõi.</p>}
    </section>
  </>;
}
