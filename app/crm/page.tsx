import type { Metadata } from 'next';
import Link from 'next/link';
import { AdminBar } from '../_components/admin-bar';
import { redirect } from 'next/navigation';
import { currentAdmin } from '../../lib/admin-auth';
import { allRows } from './data';
import { currency, dateLabel, orderUrl, stages, summarize, vietnamDay, type Order, type Payment } from './model';
import { OrderForm } from './order-form';
import { MonthCalendar } from './calendar';
import { QuickProgress } from './progress';
import { CustomerTable } from './customers';
import { WorkDashboard } from './work-dashboard';
import './crm.css';

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: 'CRM | Color Center', robots: { index: false, follow: false } };
const tabs = { overview: 'Tổng quan', orders: 'Đơn hàng & công việc', calendar: 'Lịch triển khai', customers: 'Lead/Khách hàng' };
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
  let orders: Order[], payments: Payment[];
  try {
    [orders, payments] = await Promise.all([
      allRows<Order>('crm_orders'), allRows<Payment>('crm_payments'),
    ]);
  } catch {
    return <main className="workspace-shell"><AdminBar area="crm"/><div className="crm workspace-content"><p role="alert" className="crm-alert">Không tải được dữ liệu CRM. Kiểm tra kết nối Supabase và cấu hình bảng CRM.</p></div></main>;
  }
  const summary = summarize(orders, payments, start, end);
  const balances = summarize(orders, payments, '0001-01-01', '9999-12-31').paidByOrder;
  const selected = orders.find(order => order.id === query.order);
  const term = typeof query.q === 'string' ? query.q.trim().toLocaleLowerCase('vi') : '';
  const filtered = orders.filter(order => (!query.status || order.status === query.status) &&
    (!term || [order.customer, order.title, order.phone].some(value => value.toLocaleLowerCase('vi').includes(term))))
    .sort((a, b) => b.closed_day.localeCompare(a.closed_day));
  const sectionTitle = tabs[tab as keyof typeof tabs];
  return <main className="workspace-shell">
    <AdminBar area="crm">
      <nav className="workspace-tabs" aria-label="Mục CRM">{Object.entries(tabs).map(([key, label]) =>
        <Link key={key} href={`/crm?tab=${key}`} aria-current={tab === key ? 'page' : undefined}>{label}</Link>)}</nav>
    </AdminBar>
    <div className="crm workspace-content">
    {tab !== 'orders' && <h1>{sectionTitle}</h1>}
    <div className="crm-view" key={tab}>
    {query.error && <p role="alert" className="crm-alert">{query.error === 'dates' ? 'Nhập ngày bắt đầu và số ngày thi công hợp lệ.' : query.error === 'input' ? 'Vui lòng kiểm tra các trường và thử lại.' : 'Chưa lưu được. Vui lòng thử lại.'}</p>}
    {query.saved === '1' && <p role="status" className="crm-status">Đã lưu thay đổi.</p>}
    {tab === 'overview' && <div className="crm-toolbar">
      <strong>{dateLabel(start)} — {dateLabel(end)}</strong><nav className="crm-nav" aria-label="Kỳ báo cáo">{[['day', 'Hôm nay'], ['week', 'Tuần này'], ['month', 'Tháng này']].map(([key, label]) =>
        <Link key={key} href={`/crm?tab=${tab}&range=${key}`} aria-current={range === key ? 'page' : undefined}>{label}</Link>)}</nav>
    </div>}
    {tab === 'overview' && <>
      <div className="crm-metrics">{[
        ['Giá trị đơn chốt trong kỳ', currency(summary.booked)], ['Thực thu trong kỳ', currency(summary.collected)],
        ['Còn phải thu đến cuối kỳ', currency(summary.outstanding)],
      ].map(([label, value]) => <section className="crm-card" key={label}><p>{label}</p><strong>{value}</strong></section>)}</div>
      <WorkDashboard orders={orders} today={today}/>
    </>}
    {tab === 'orders' && <>
      <div className="crm-toolbar workspace-title"><h1>Đơn hàng & công việc</h1><Link className="button compact" href="/crm?tab=orders&new=1">Thêm đơn</Link></div>
      {(selected || query.new === '1') && <OrderForm key={selected?.id ?? 'new'} order={selected} payments={payments.filter(payment => payment.order_id === selected?.id).sort((a, b) => b.paid_day.localeCompare(a.paid_day))} today={today}/>}
      <section className="crm-card">
        <form className="crm-filter" action="/crm">
          <input type="hidden" name="tab" value="orders"/>
          <input name="q" aria-label="Tìm đơn" placeholder="Tìm theo đơn, khách hàng, SĐT" defaultValue={query.q}/>
          <select name="status" aria-label="Trạng thái" defaultValue={query.status}><option value="">Tất cả trạng thái</option>{stages.map(stage => <option key={stage}>{stage}</option>)}</select>
          <button className="button compact">Lọc</button>
        </form>
        {filtered.length ? <div className="crm-table"><table><thead><tr>{['Đơn hàng', 'Cập nhật tiến độ', 'Thi công', 'Giá trị', 'Đã thu', 'Còn lại'].map(label => <th key={label}>{label}</th>)}</tr></thead><tbody>
          {filtered.map(order => { const paid = balances.get(order.id) ?? 0; return <tr key={order.id}>
            <td data-label="Đơn hàng"><Link href={orderUrl(order.id)}>{order.title}</Link><small>{order.source || 'Chưa xác định nguồn'}</small></td><td data-label="Tiến độ"><QuickProgress key={query.error ?? "ok"} order={order} q={query.q} status={query.status}/></td>
            <td data-label="Thi công">{order.install_day ? dateLabel(order.install_day) : '—'}{order.install_end_day && order.install_end_day !== order.install_day && <small>đến {dateLabel(order.install_end_day)}</small>}</td>
            <td data-label="Giá trị">{currency(order.amount)}</td><td data-label="Đã thu">{currency(paid)}</td><td data-label="Còn lại">{currency(Math.max(0, order.amount - paid))}</td>
          </tr>; })}
        </tbody></table></div> : <p>Chưa có đơn hàng phù hợp.</p>}
      </section>
    </>}
    {tab === 'customers' && <CustomerTable orders={orders}/>}
    {tab === 'calendar' && <MonthCalendar orders={orders} today={today} requestedMonth={query.month}/>}
    </div>
    </div>
  </main>;
}
