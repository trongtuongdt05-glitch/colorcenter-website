import { cookies } from 'next/headers';

export async function isEnglish() {
  return (await cookies()).get('cc-language')?.value === 'en';
}

export function serviceEnglish(title: string) {
  return ({
    'Biển quảng cáo':'Signage', 'Đèn LED & Neon':'LED & Neon', 'Gia công':'Fabrication',
    'In ấn':'Printing', 'Thiết kế':'Design', 'Nội ngoại thất':'Interior & Exterior',
  } as Record<string,string>)[title] ?? title;
}
