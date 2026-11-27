import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { currentAdmin } from '../../lib/admin-auth';
import type { Lead } from '../../lib/colorcenter-server';
import { records } from '../../lib/supabase';
import { currency, stages, summarize, vietnamDay, type Order, type Payment } from './model';
import { OrderForm } from './order-form';
import './crm.css';

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: 'CRM | Color Center', robots: { index: false, follow: false } };
const tabs = { overview: 'Tổng quan', leads: 'Yêu cầu báo giá', orders: 'Đơn hàng & công việc', calendar: 'Lịch triển khai' };
const dates = [
  ['task_due', 'Hạn xử lý'], ['survey_day', 'Khảo sát'], ['install_day', 'Thi công'],
  ['handover_day', 'Bàn giao'], ['payment_due', 'Hẹn thanh toán'],
] as const;

async function allRows<T>(table: string) {
  const result: T[] = [];
  const limit = 200;
  for (let offset = 0; ; offset += limit) {
    const batch = await records<T>(`${table}?order=id.asc&offset=${offset}&limit=${limit}`);
    result.push(...batch);
    if (batch.length < limit) return result;
  }
}

export default async function Crm({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const user = await currentAdmin();
  if (!user) redirect('/cpanel');
  const query = await searchParams;
  const tab = Object.keys(tabs).find(key => key === query.tab) ?? 'overview';
  const today = vietnamDay(new Date());
  const range = query.range === 'day' || query.range === 'week' ? query.range : 'month';
  const day = Date.parse(today + 'T00:00:00Z');
  const monday = day - ((new Date(day).getUTCDay() + 6) % 7) * 86400000;
  const start = range === 'day' ? today : range === 'week' ? vietnamDay(monday) : today.slice(0, 7) + '-01';
  const nextMonthEnd = new Date(Date.UTC(Number(today.slice(0, 4)), Number(today.slice(5, 7)), 0));
  const end = range === 'day' ? today : range === 'week' ? vietnamDay(monday + 6 * 86400000) : vietnamDay(nextMonthEnd);
  let orders: Order[], payments: Payment[], leads: Lead[];
  try {
    [orders, payments, leads] = await Promise.all([
      allRows<Order>('crm_orders'), allRows<Payment>('crm_payments'),
      tab === 'leads' || (tab === 'orders' && query.lead) ? allRows<Lead>('inquiries') : Promise.resolve([]),
    ]);
  } catch {
    return <main className="crm"><Link href="/cpanel">Về CPanel</Link><h1>CRM Color Center</h1><p role="alert">Không tải được dữ liệu CRM. Kiểm tra kết nối Supabase và cấu hình bảng CRM.</p></main>;
  }
  const summary = summarize(orders, payments, start, end);
  const balances = summarize(orders, payments, '0001-01-01', '9999-12-31').paidByOrder;
  const selected = orders.find(order => order.id === query.order);
  const lead = leads.find(item => item.id === query.lead);
  const linked = new Map(orders.flatMap(order => order.lead_id ? [[order.lead_id, order.id] as const] : []));
  const term = typeof query.q === 'string' ? query.q.trim().toLocaleLowerCase('vi') : '';
  const filtered = orders.filter(order => (!query.status || order.status === query.status) &&
    (!term || [order.customer, order.title, order.phone].some(value => value.toLocaleLowerCase('vi').includes(term))))
    .sort((a, b) => b.closed_day.localeCompare(a.closed_day));
  const events = orders.flatMap(order => dates.flatMap(([field, label]) => {
    const date = order[field];
    return date && summary.inPeriod(date) ? [{ date, label, order }] : [];
  })).sort((a, b) => a.date.localeCompare(b.date));
  const overdue = orders.filter(order => order.status !== 'Đã bàn giao' && order.next_task && order.task_due && order.task_due < today);
  const orderLink = (id: string) => `/crm?tab=orders&order=${id}`;
  return <main className="crm">
    <header className="crm-header"><div><p>QUẢN TRỊ COLOR CENTER</p><h1>CRM công việc</h1></div><Link href="/cpanel">Về CPanel</Link></header>
    <nav className="crm-nav" aria-label="Mục CRM">{Object.entries(tabs).map(([key, label]) =>
      <Link key={key} href={`/crm?tab=${key}`} aria-current={tab === key ? 'page' : undefined}>{label}</Link>)}</nav>
    {query.error && <p role="alert" className="crm-alert">{query.error === 'input' ? 'Vui lòng kiểm tra các trường và thử lại.' : 'Chưa lưu được. Vui lòng thử lại.'}</p>}
    {query.saved === '1' && <p role="status">Đã lưu thay đổi.</p>}
    {(tab === 'overview' || tab === 'calendar') && <div className="crm-toolbar">
      <strong>{start} — {end}</strong><nav className="crm-nav" aria-label="Kỳ báo cáo">{[['day', 'Hôm nay'], ['week', 'Tuần này'], ['month', 'Tháng này']].map(([key, label]) =>
        <Link key={key} href={`/crm?tab=${tab}&range=${key}`} aria-current={range === key ? 'page' : undefined}>{label}</Link>)}</nav>
    </div>}
    {tab === 'overview' && <>
      <div className="crm-metrics">{[
        ['Giá trị đơn chốt trong kỳ', currency(summary.booked)], ['Thực thu trong kỳ', currency(summary.collected)],
        ['Còn phải thu đến cuối kỳ', currency(summary.outstanding)], ['Việc quá hạn hôm nay', overdue.length],
      ].map(([label, value]) => <section className="crm-card" key={label}><p>{label}</p><strong>{value}</strong></section>)}</div>
      <section className="crm-card"><h2>Việc quá hạn</h2>{overdue.length ? <ul>{overdue.map(order =>
        <li key={order.id}><Link href={orderLink(order.id)}>{order.title}</Link> · {order.next_task} · {order.task_due}</li>
      )}</ul> : <p>Hiện chưa có công việc quá hạn.</p>}</section>
    </>}
    {tab === 'leads' && <section className="crm-card"><h2>Yêu cầu từ website</h2>
      {!leads.length && <p>Chưa có yêu cầu báo giá.</p>}
      {leads.sort((a, b) => b.created - a.created).map(item => <article className="crm-row" key={item.id}>
        <div><strong>{item.name}</strong> · <a href={`tel:${item.phone}`}>{item.phone}</a><p>{item.service} · {vietnamDay(new Date(item.created))}</p><p>{item.message}</p></div>
        <Link href={linked.has(item.id) ? orderLink(linked.get(item.id)!) : `/crm?tab=orders&lead=${item.id}`}>{linked.has(item.id) ? 'Xem đơn' : 'Tạo đơn'}</Link>
      </article>)}
    </section>}
    {tab === 'orders' && <>
      <div className="crm-toolbar"><h2>Đơn hàng & công việc</h2><Link className="button compact" href="/crm?tab=orders&new=1">Thêm đơn</Link></div>
      {(selected || lead || query.new === '1') && <OrderForm order={selected} lead={lead} payments={payments.filter(payment => payment.order_id === selected?.id).sort((a, b) => b.paid_day.localeCompare(a.paid_day))} today={today}/>}
      <section className="crm-card">
        <form className="crm-filter" action="/crm">
          <input type="hidden" name="tab" value="orders"/>
          <input name="q" aria-label="Tìm đơn" placeholder="Tên đơn, khách hàng hoặc số điện thoại" defaultValue={query.q}/>
          <select name="status" aria-label="Trạng thái" defaultValue={query.status}><option value="">Tất cả trạng thái</option>{stages.map(stage => <option key={stage}>{stage}</option>)}</select>
          <button className="button compact">Lọc</button>
        </form>
        {filtered.length ? <div className="crm-table"><table><thead><tr>{['Đơn hàng', 'Trạng thái', 'Việc tiếp theo', 'Thi công', 'Giá trị', 'Đã thu', 'Còn lại'].map(label => <th key={label}>{label}</th>)}</tr></thead><tbody>
          {filtered.map(order => { const paid = balances.get(order.id) ?? 0; return <tr key={order.id}>
            <td><Link href={orderLink(order.id)}>{order.title}</Link><small>{order.customer}</small></td><td>{order.status}</td>
            <td>{order.next_task || '—'}<small>{order.task_due}</small></td><td>{order.install_day ?? '—'}</td>
            <td>{currency(order.amount)}</td><td>{currency(paid)}</td><td>{currency(Math.max(0, order.amount - paid))}</td>
          </tr>; })}
        </tbody></table></div> : <p>Chưa có đơn hàng phù hợp.</p>}
      </section>
    </>}
    {tab === 'calendar' && <section className="crm-card"><h2>Lịch triển khai</h2>
      {!events.length && <p>Chưa có lịch trong khoảng thời gian này.</p>}
      {events.map(({ date, label, order }) => <article className="crm-row" key={order.id + label}>
        <div><strong>{date} · {label}</strong><p>{order.address || order.customer}{order.assignee && ` · ${order.assignee}`}</p></div><Link href={orderLink(order.id)}>{order.title}</Link>
      </article>)}
    </section>}
  </main>;
}
