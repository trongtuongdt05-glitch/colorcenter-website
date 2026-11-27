import type { CSSProperties } from 'react';
import Link from 'next/link';
import { dateLabel, installationCovers, orderUrl, shiftDay, type Order } from './model';

const milestones = [
  ['survey_day', 'Khảo sát', 'blue'], ['handover_day', 'Bàn giao', 'green'],
  ['payment_due', 'Hẹn thanh toán', 'slate'],
] as const;

function projectColor(id:string): CSSProperties {
  const hash = Array.from(id).reduce((value, char) => (Math.imul(value, 31) + char.charCodeAt(0)) >>> 0, 0);
  const hue = hash % 360;
  return {
    '--project-fill': `hsl(${hue} 63% 87%)`,
    '--project-text': `hsl(${hue} 50% 22%)`,
    '--project-line': `hsl(${hue} 40% 50%)`,
  } as CSSProperties;
}

export function MonthCalendar({orders, today, requestedMonth}: {orders:Order[]; today:string; requestedMonth?:string}) {
  const month = requestedMonth && requestedMonth < '9999' && /^[1-9]\d{3}-(0[1-9]|1[0-2])$/.test(requestedMonth) ? requestedMonth : today.slice(0, 7);
  const first = month + '-01';
  const weekday = (new Date(first + 'T00:00:00Z').getUTCDay() + 6) % 7;
  const previous = shiftDay(first, -1).slice(0, 7);
  const next = shiftDay(first, 32).slice(0, 7);
  const daysInMonth = Number(shiftDay(next + '-01', -1).slice(-2));
  const cells = Array.from({length: Math.ceil((weekday + daysInMonth) / 7) * 7}, (_, i) => shiftDay(first, i - weekday));
  const link = (value:string) => '/crm?tab=calendar&month=' + value;
  const rows = cells.map(day => {
    const inMonth = day.startsWith(month);
    const projects = inMonth ? orders.filter(order => installationCovers(order, day)) : [];
    const events = inMonth ? orders.flatMap(order => milestones.filter(([field]) =>
      order[field] === day &&
      (field !== 'handover_day' || !installationCovers(order, day)))
      .map(([field, label, tone]) => ({order, field, label, tone}))) : [];
    return {day, inMonth, projects, events};
  });
  return <section className="crm-card crm-calendar">
    <div className="crm-toolbar"><h2>Tháng {month.slice(5)} / {month.slice(0, 4)}</h2>
      <nav className="crm-nav" aria-label="Đổi tháng">
        <Link href={link(previous)}>‹ Tháng trước</Link><Link href={link(today.slice(0, 7))}>Tháng này</Link><Link href={link(next)}>Tháng sau ›</Link>
      </nav>
    </div>
    <div className="crm-legend">
      {milestones.map(([key, label, tone]) => <span className="crm-chip" key={key} data-tone={tone}>{label}</span>)}
    </div>
    <div className="crm-calendar-grid" key={month}>
      {['T2','T3','T4','T5','T6','T7','CN'].map(label => <strong key={label} className="crm-weekday">{label}</strong>)}
      {rows.map(({day, inMonth, projects, events}) => <div className="crm-day" key={day} data-outside={!inMonth}
        data-today={day === today} data-install={projects.length > 0} aria-label={dateLabel(day)}
        style={projects.length === 1 ? projectColor(projects[0].id) : undefined}>
        <time dateTime={day}>{Number(day.slice(-2))}</time>
        {projects.length > 0 && <div className="crm-projects">{projects.map(order =>
          <Link className="crm-project" style={projectColor(order.id)} key={order.id} href={orderUrl(order.id)} title={order.title}>{order.title}</Link>
        )}</div>}
        {events.length > 0 && <div className="crm-day-events">{events.map(({order, field, label, tone}) =>
          <Link className="crm-event" data-tone={tone} key={order.id + field} href={orderUrl(order.id)}
            title={label + ' · ' + order.title}>{label} · {order.title}</Link>
        )}</div>}
      </div>)}
    </div>
    <div className="crm-month-agenda">
      <h3>Lịch chi tiết trong tháng</h3>
      {!rows.some(({projects, events}) => projects.length || events.length) && <p>Chưa có lịch triển khai trong tháng.</p>}
      {rows.filter(({projects, events}) => projects.length || events.length).map(({day, projects, events}) =>
        <section key={day}>
          <strong>{dateLabel(day)}</strong>
          {projects.map(order => <Link className="crm-project" style={projectColor(order.id)} key={order.id} href={orderUrl(order.id)}>{order.title}</Link>)}
          {events.map(({order, field, label, tone}) => <Link className="crm-event" data-tone={tone} key={order.id + field}
            href={orderUrl(order.id)}>{label} · {order.title}</Link>)}
        </section>)}
    </div>
  </section>;
}
