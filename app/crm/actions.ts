'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';
import { currentAdmin } from '../../lib/admin-auth';
import { mutation, records } from '../../lib/supabase';
import type { Lead } from '../../lib/colorcenter-server';
import { stages, type Order } from './model';

const id = z.string().uuid();
const date = z.string().date();
const text = z.string().trim();
const optionalDate = date.or(z.literal('')).transform(value => value || null);
const money = z.string().regex(/^\d{1,13}$/).transform(Number).pipe(z.number().max(1_000_000_000_000));
const order = z.object({
  id, lead_id: id.or(z.literal('')).transform(value => value || null),
  title:text.min(1).max(200), customer:text.min(1).max(120), phone:text.max(32),
  address:text.max(300), assignee:text.max(100), notes:text.max(3000), next_task:text.max(300),
  task_due:optionalDate, survey_day:optionalDate, install_day:optionalDate, install_end_day:optionalDate, handover_day:optionalDate, payment_due:optionalDate,
  closed_day:date, status:z.enum(stages), amount:money,
});

export async function saveOrder(form: FormData) {
  if (!await currentAdmin()) redirect('/cpanel');
  const parsed = order.safeParse(Object.fromEntries(form));
  const submittedId = id.safeParse(form.get('id'));
  const submittedLead = id.safeParse(form.get('lead_id'));
  const formTarget = form.get('edit') === '1' && submittedId.success ? 'order=' + submittedId.data :
    submittedLead.success ? 'lead=' + submittedLead.data : 'new=1';
  if (!parsed.success) redirect('/crm?tab=orders&' + formTarget + '&error=input');
  if (parsed.data.install_end_day && (!parsed.data.install_day || parsed.data.install_end_day < parsed.data.install_day))
    redirect('/crm?tab=orders&' + formTarget + '&error=dates');
  const {id:orderId,lead_id,...fields} = parsed.data;
  let saved: string = orderId;
  try {
    if (form.get('edit') === '1') {
      const rows = await records<Order>(`crm_orders?id=eq.${orderId}`,mutation('PATCH',fields,'return=representation'));
      if (!rows.length) throw new Error('Order missing');
    } else {
      if (lead_id) {
        const [lead] = await records<Lead>(`inquiries?id=eq.${lead_id}`);
        if (!lead) throw new Error('Lead missing');
      }
      const conflict = lead_id ? 'lead_id' : 'id';
      const rows = await records<Order>(`crm_orders?on_conflict=${conflict}`,mutation('POST',{...fields,id:orderId,lead_id},'resolution=ignore-duplicates,return=representation'));
      if (!rows.length && lead_id) {
        const [existing] = await records<Order>(`crm_orders?lead_id=eq.${lead_id}`);
        if (!existing) throw new Error('Order missing');
        saved = existing.id;
      }
    }
  } catch {
    redirect('/crm?tab=orders&' + formTarget + '&error=save');
  }
  redirect(`/crm?tab=orders&order=${saved}&saved=1`);
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
