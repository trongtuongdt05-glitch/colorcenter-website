import { databaseConfigured, mutation, records } from '../../../lib/supabase';
import { inquirySchema, statuses } from '../../../lib/colorcenter';
import { getContent, isAdmin, sameOrigin } from '../../../lib/colorcenter-server';

import { leadMailConfigured, sendLeadNotification } from '../../../lib/lead-notification';

export async function POST(request: Request) {
  if (!sameOrigin(request)) return new Response(null, {status: 403});
  const body = await request.json().catch(() => null) as {website?:unknown; id?:unknown; status?:unknown} | null;
  const parsed = inquirySchema.safeParse(body);
  if (!parsed.success || body?.website) return Response.json({error: 'Vui lòng kiểm tra họ tên, số điện thoại và nội dung yêu cầu.'}, {status: 400});
  if (!databaseConfigured()) return Response.json({error:'Biểu mẫu chưa được kết nối. Vui lòng gọi điện hoặc nhắn Zalo.'},{status:503});
  const id = crypto.randomUUID();
  await records('inquiries',mutation('POST',{...parsed.data,id,created:Date.now(),status:'Mới'}));
  if (leadMailConfigured()) {
    try {
      const {data} = await getContent();
      await sendLeadNotification(data.leadEmail, id, new URL('/cpanel', request.url).href);
    } catch (error) {
      console.error('Could not notify Color Center about inquiry', id, error);
    }
  }
  return Response.json({ok: true}, {status: 201});
}

export async function PATCH(request: Request) {
  if (!sameOrigin(request) || !await isAdmin()) return new Response(null, {status: 403});
  const body = await request.json().catch(() => null) as {website?:unknown; id?:unknown; status?:unknown} | null;
  if (typeof body?.id !== 'string' || !/^[a-f0-9-]{36}$/i.test(body.id) || !statuses.some(status => status === body.status)) return new Response(null, {status: 400});
  const updated = await records(`inquiries?id=eq.${body.id}&select=id`,mutation('PATCH',{status:body.status},'return=representation'));
  return new Response(null, {status: updated.length ? 204 : 404});
}
