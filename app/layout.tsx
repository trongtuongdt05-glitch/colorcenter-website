import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Color Center | Thiết kế và thi công quảng cáo',
  description: 'Thi công bảng hiệu, gia công chữ nổi, đèn LED & Neon, in ấn và thiết kế tại TP. Hồ Chí Minh.',
};
export default function Layout({children}: {children: React.ReactNode}) {
  return <html lang="vi"><body>{children}</body></html>;
}
