import type { Lead } from './colorcenter-server';

export function leadMailConfigured() {
  return Boolean(process.env.RESEND_API_KEY?.trim() && process.env.LEAD_FROM_EMAIL?.trim());
}

export async function sendLeadNotification(recipient: string, lead: Omit<Lead, 'status'>, adminUrl: string) {
  if (!recipient || !leadMailConfigured()) return;

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY?.trim()}`,
      'Content-Type': 'application/json',
      'Idempotency-Key': `color-center-lead-${lead.id}`,
    },
    body: JSON.stringify({
      from: process.env.LEAD_FROM_EMAIL?.trim(),
      to: [recipient],
      subject: '[Color Center] Yêu cầu báo giá mới',
      text: [
        'Color Center vừa nhận một yêu cầu báo giá mới.',
        '',
        `Họ tên: ${lead.name}`,
        `Số điện thoại: ${lead.phone}`,
        `Dịch vụ: ${lead.service || 'Chưa chọn'}`,
        `Thời gian gửi: ${new Intl.DateTimeFormat('vi-VN', {
          timeZone: 'Asia/Ho_Chi_Minh', dateStyle: 'short', timeStyle: 'short',
        }).format(lead.created)} (giờ Việt Nam)`,
        '',
        'Nội dung yêu cầu',
        lead.message,
        '',
        `Mở CPanel để quản lý yêu cầu: ${adminUrl}`,
      ].join('\n'),
    }),
    signal: AbortSignal.timeout(4000),
  });
  if (!response.ok) {
    await response.body?.cancel();
    throw new Error(`Lead mail provider returned HTTP ${response.status}`);
  }
  await response.body?.cancel();
}
