export function leadMailConfigured() {
  return Boolean(process.env.RESEND_API_KEY?.trim() && process.env.LEAD_FROM_EMAIL?.trim());
}

export async function sendLeadNotification(recipient: string, leadId: string, adminUrl: string) {
  if (!recipient || !leadMailConfigured()) return;

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY?.trim()}`,
      'Content-Type': 'application/json',
      'Idempotency-Key': `color-center-lead-${leadId}`,
    },
    body: JSON.stringify({
      from: process.env.LEAD_FROM_EMAIL?.trim(),
      to: [recipient],
      subject: '[Color Center] Yêu cầu báo giá mới',
      text: `Color Center vừa nhận một yêu cầu báo giá mới.\n\nMở CPanel và vào mục Yêu cầu báo giá để xem thông tin khách hàng.\n${adminUrl}`,
    }),
    signal: AbortSignal.timeout(4000),
  });
  if (!response.ok) {
    await response.body?.cancel();
    throw new Error(`Lead mail provider returned HTTP ${response.status}`);
  }
  await response.body?.cancel();
}
