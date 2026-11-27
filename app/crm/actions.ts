'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';
import { currentAdmin } from '../../lib/admin-auth';
import { mutation, records } from '../../lib/supabase';
import { installationEnd, parseDisplayDate, stages, type Order } from './model';

const id = z.string().uuid();
const text = z.string().trim();
const date = text.transform(value => parseDisplayDate(value)).pipe(z.string());
const optionalDate = text.transform(value => value ? parseDisplayDate(value) ?? undefined : null).pipe(z.string().nullable());
const money = text.regex(/^(?:\d{1,13}|\d{1,3}(?:\.\d{3}){1,4})$/)
  .transform(value => Number(value.replaceAll('.', ''))).pipe(z.number().max(1_000_000_000_000));
const order = z.object({
  id, title:text.min(1).max(200), customer:text.min(1).max(120), phone:text.max(32),
  address:text.max(300), assignee:text.max(100), notes:text.max(3000), next_task:text.max(300),
  task_due:optionalDate, survey_day:optionalDate, install_day:optionalDate, payment_due:optionalDate,
  install_duration:text.regex(/^\d{0,4}$/), closed_day:date, status:z.enum(stages), amount:money,
});

export async function saveOrder(form: FormData) {
  if (!await currentAdmin()) redirect('/cpanel');
  const parsed = order.safeParse(Object.fromEntries(form));
  const submittedId = id.safeParse(form.get('id'));
  const editing = form.get('edit') === '1' && submittedId.success;
  const formTarget = editing ? 'order=' + submittedId.data : 'new=1';
  if (!parsed.success) redirect('/crm?tab=orders&' + formTarget + '&error=input');
  const {id: orderId, install_duration, ...fields} = parsed.data;
  const end = fields.install_day ? installationEnd(fields.install_day, Number(install_duration)) : null;
  if ((fields.install_day && !end) || (!fields.install_day && install_duration))
    redirect('/crm?tab=orders&' + formTarget + '&error=dates');

  try {
    const schedule = {install_end_day:end, handover_day:end};
    if (editing) {
      const [previous] = await records<Order>(`crm_orders?id=eq.${orderId}&select=install_day,handover_day`);
      if (previous && !previous.install_day && !fields.install_day) schedule.handover_day = previous.handover_day;
      const rows = await records<Order>(`crm_orders?id=eq.${orderId}`,mutation('PATCH',{...fields,...schedule},'return=representation'));
      if (!rows.length) throw new Error('Order missing');
    } else {
      await records<Order>('crm_orders?on_conflict=id',mutation('POST',{...fields,...schedule,id:orderId},'resolution=ignore-duplicates,return=minimal'));
    }
  } catch {
    redirect('/crm?tab=orders&' + formTarget + '&error=save');
  }
  redirect(`/crm?tab=orders&order=${orderId}&saved=1`);
}

export async function addPayment(form: FormData) {
  if (!await currentAdmin()) redirect('/cpanel');
  const parsed = z.object({id,order_id:id,paid_day:date,amount:money.pipe(z.number().min(1)),note:text.max(300)}).safeParse(Object.fromEntries(form));
  if (!parsed.success) redirect('/crm?tab=orders&error=input');
  const target = `/crm?tab=orders&order=${parsed.data.order_id}`;
  try {
    await records('crm_payments?on_conflict=id',mutation('POST',parsed.data,'resolution=ignore-duplicates,return=minimal'));
  } catch {
    redirect(target + '&error=save');
  }
  redirect(target + '&saved=1');
}

export async function updateProgress(form: FormData) {
  if (!await currentAdmin()) redirect('/cpanel');
  const filters = new URLSearchParams({tab:'orders'});
  for (const key of ['q', 'status'] as const) {
    const value = form.get('filter_' + key);
    if (typeof value === 'string' && value) filters.set(key, value.slice(0, 200));
  }
  const parsed = z.object({id, status:z.enum(stages).optional(), task_done:z.enum(['yes','no']).optional()})
    .refine(value => Boolean(value.status || value.task_done))
    .safeParse(Object.fromEntries(form));
  if (!parsed.success) redirect('/crm?' + filters + '&error=input');
  const fields = parsed.data.status ? {status:parsed.data.status} : {task_done:parsed.data.task_done === 'yes'};
  try {
    const rows = await records<Order>(`crm_orders?id=eq.${parsed.data.id}`,mutation('PATCH',fields,'return=representation'));
    if (!rows.length) throw new Error('Order missing');
  } catch {
    redirect('/crm?' + filters + '&error=save');
  }
  redirect('/crm?' + filters + '&saved=1');
}
