import Link from 'next/link';
import { dateLabel, installationCovers, orderUrl, shiftDay, type Order } from './model';

const milestones = [
  ['survey_day', 'Khảo sát', 'blue'], ['handover_day', 'Bàn giao', 'green'],
  ['task_due', 'Hạn xử lý', 'violet'], ['payment_due', 'Hẹn thanh toán', 'slate'],
] as const;

export function MonthCalendar({orders, today, requestedMonth}: {orders:Order[]; today:string; requestedMonth?:string}) {
  const month = requestedMonth && requestedMonth < '9999' && /^[1-9]\d{3}-(0[1-9]|1[0-2])$/.test(requestedMonth) ? requestedMonth : today.slice(0, 7);
  const first = month + '-01';
  const weekday = (new Date(first + 'T00:00:00Z').getUTCDay() + 6) % 7;
  const previous = shiftDay(first, -1).slice(0, 7);
  const next = shiftDay(first, 32).slice(0, 7);
  const daysInMonth = Number(shiftDay(next + '-01', -1).slice(-2));
  const cells = Array.from({length: Math.ceil((weekday + daysInMonth) / 7) * 7}, (_, i) => shiftDay(first, i - weekday));
  const link = (value:string) => '/crm?tab=calendar&month=' + value;
  return <section className="crm-card crm-calendar">
    <div className="crm-toolbar"><h2>Tháng {month.slice(5)} / {month.slice(0, 4)}</h2>
      <nav className="crm-nav" aria-label="Đổi tháng">
        <Link href={link(previous)}>‹ Tháng trước</Link><Link href={link(today.slice(0, 7))}>Tháng này</Link><Link href={link(next)}>Tháng sau ›</Link>
      </nav>
    </div>
    <div className="crm-legend">
      <span className="crm-chip" data-tone="orange">Thi công</span>
      {milestones.map(([key, label, tone]) => <span className="crm-chip" key={key} data-tone={tone}>{label}</span>)}
    </div>
    <div className="crm-calendar-scroll" tabIndex={0} role="region" aria-label="Lịch tháng, có thể cuộn ngang">
      <div className="crm-calendar-grid">
        {['Thứ 2','Thứ 3','Thứ 4','Thứ 5','Thứ 6','Thứ 7','Chủ nhật'].map(label => <strong key={label} className="crm-weekday">{label}</strong>)}
        {cells.map(day => {
          const inMonth = day.startsWith(month);
          const projects = inMonth ? orders.filter(order => installationCovers(order, day)) : [];
          return <div className="crm-day" key={day} data-outside={!inMonth} data-today={day === today}
            data-install={projects.length > 0} aria-label={dateLabel(day)}>
            <time dateTime={day}>{Number(day.slice(-2))}</time>
            {projects.map(order => <Link className="crm-event" data-tone="orange" key={order.id} href={orderUrl(order.id)} title={order.title}>{order.title}</Link>)}
            {inMonth && orders.flatMap(order => milestones.filter(([field]) =>
              order[field] === day && (field !== 'task_due' || (!order.task_done && Boolean(order.next_task))))
              .map(([field, label, tone]) => <Link className="crm-event" data-tone={tone} key={order.id + field}
                href={orderUrl(order.id)} title={label + ' · ' + order.title}>{label} · {order.title}</Link>))}
          </div>;
        })}
      </div>
    </div>
  </section>;
}
