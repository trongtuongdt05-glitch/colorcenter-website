export const stages = ['Đã chốt','Chờ duyệt thiết kế','Đang gia công','Chờ thi công','Đang thi công','Đã bàn giao'] as const;

export type Order = {
  id:string; lead_id:string|null; title:string; customer:string; phone:string; address:string; assignee:string;
  next_task:string; notes:string; task_due:string|null; survey_day:string|null; install_day:string|null;
  install_end_day:string|null; task_done:boolean;
  handover_day:string|null; payment_due:string|null; closed_day:string; status:typeof stages[number]; amount:number;
};
export type Payment = {id:string;order_id:string;paid_day:string;amount:number;note:string};
export const vietnamDay = (date: number | Date) => new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Ho_Chi_Minh'}).format(date);
export const currency = (amount:number) => new Intl.NumberFormat('vi-VN',{style:'currency',currency:'VND'}).format(amount);

export function summarize(orders:Order[], payments:Payment[], start:string, end:string) {
  const inPeriod = (date:string) => date >= start && date <= end;
  const paidByOrder = new Map<string,number>();
  for (const payment of payments) {
    if (payment.paid_day <= end)
      paidByOrder.set(payment.order_id,(paidByOrder.get(payment.order_id) ?? 0) + payment.amount);
  }
  return {
    inPeriod,
    booked: orders.filter(order=>inPeriod(order.closed_day)).reduce((sum,order)=>sum+order.amount,0),
    collected: payments.filter(payment=>inPeriod(payment.paid_day)).reduce((sum,payment)=>sum+payment.amount,0),
    outstanding: orders.filter(order=>order.closed_day<=end).reduce((sum,order)=>sum+Math.max(0,order.amount-(paidByOrder.get(order.id) ?? 0)),0),
    paidByOrder,
  };
}

export function orderUrl(id: string) {
  return `/crm?tab=orders&order=${id}`;
}

export function stageTone(status: Order['status']) {
  return ['blue', 'violet', 'amber', 'slate', 'orange', 'green'][stages.indexOf(status)];
}

export function shiftDay(day: string, count: number) {
  const date = new Date(day + 'T00:00:00Z');
  date.setUTCDate(date.getUTCDate() + count);
  return date.toISOString().slice(0, 10);
}

export function dateLabel(day: string) {
  return day.split('-').reverse().join('/');
}

export function installationCovers(order: Order, day: string) {
  return Boolean(order.install_day && order.install_day <= day && day <= (order.install_end_day ?? order.install_day));
}

export function parseDisplayDate(value: string) {
  const match = /^(\d{2})\/(\d{2})\/([1-9]\d{3})$/.exec(value);
  if (!match) return null;
  const iso = `${match[3]}-${match[2]}-${match[1]}`;
  const date = new Date(iso + 'T00:00:00Z');
  return Number.isFinite(+date) && date.toISOString().slice(0, 10) === iso ? iso : null;
}

export function installDuration(order: Order) {
  if (!order.install_day) return '';
  const end = order.install_end_day ?? order.install_day;
  return String((Date.parse(end) - Date.parse(order.install_day)) / 86_400_000 + 1);
}

export function installationEnd(start: string, days: number) {
  if (!Number.isInteger(days) || days < 1 || days > 3650 || !parseDisplayDate(dateLabel(start))) return null;
  const end = shiftDay(start, days - 1);
  return /^\d{4}-\d{2}-\d{2}$/.test(end) ? end : null;
}
