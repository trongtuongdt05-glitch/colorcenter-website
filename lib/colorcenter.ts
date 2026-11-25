import { z } from 'zod';

const line = z.string().trim().min(1).max(140);
const description = z.string().trim().min(1).max(1600);
const photo = z.string().trim().max(1024).refine(value => {
  return value === '' || /^\/(?:media|api\/media)\/[a-z0-9-]+\.(?:png|jpg|webp|jpeg)$/i.test(value) || /^https:\/\/[^\s]+$/i.test(value);
});
const coverTwo = '/media/neon.jpg';
const coverThree = '/media/cover-interior.webp';
const card = z.object({ title: line, description, image: photo, visible: z.boolean() });
export const siteSchema = z.object({
  name: line, logo: photo, title: line, subtitle: description, hero: photo,
  heroTwo: photo.default(coverTwo), heroThree: photo.default(coverThree),
  about: description, phone: z.string().trim().regex(/^[+0-9 .()-]{8,24}$/),
  email: z.string().trim().email(), address: line,
  zalo: z.string().trim().refine(value => /^https:\/\/zalo\.me\/[a-z0-9]+\/?$/i.test(value)),
  services: z.array(card).max(32), projects: z.array(card.extend({ category: line })).max(40),
  leadEmail: z.string().trim().max(254).email().or(z.literal('')).default(''),
  accent: z.string().regex(/^#[a-f0-9]{6}$/i),
});
export type SiteContent = z.infer<typeof siteSchema>;
export type Card = z.infer<typeof card>;
export const inquirySchema = z.object({
  name: z.string().trim().min(2).max(100),
  phone: z.string().trim().regex(/^\+?[0-9 .()-]{8,24}$/).refine(v => v.replace(/\D/g, '').length >= 8),
  service: z.string().trim().max(140),
  message: z.string().trim().min(5).max(1800),
});
export const statuses = ['Mới', 'Đang tư vấn', 'Đã xử lý'] as const;

export const defaults: SiteContent = {
  name: 'Color Center', logo: '/media/logo.png', title: 'Thi công quảng cáo cho mặt tiền nổi bật.',
  subtitle: 'Từ thiết kế, gia công đến lắp đặt bảng hiệu, đèn LED và ấn phẩm cho cửa hàng, showroom và doanh nghiệp.',
  hero: '/media/hero.jpg', heroTwo: coverTwo, heroThree: coverThree,
  about: 'Color Center thực hiện thiết kế, in ấn, gia công và thi công quảng cáo. Gửi ảnh mặt bằng hoặc ý tưởng ban đầu để chúng tôi tư vấn vật liệu, kích thước và phương án phù hợp với nhu cầu của bạn.',
  phone: '0964 648 199', email: 'adv.colorc@gmail.com',
  address: '45/14B Trần Thái Tông, Tân Bình, TP. Hồ Chí Minh',
  leadEmail: '', zalo: 'https://zalo.me/0964648199', accent: '#ff8a32',
  services: [
    ['Biển quảng cáo', 'Bảng hiệu mặt tiền, biển hộp đèn, biển công ty và bảng hiệu chữ nổi.'],
    ['Đèn LED & Neon', 'Chữ đèn neon, đèn trang trí và đèn LED cho mặt tiền hoặc không gian bên trong.'],
    ['Gia công', 'Chữ inox, chữ mica, thẻ mica và menu mica theo kích thước yêu cầu.'],
    ['In ấn', 'In UV, latex, decal, hiflex và các ấn phẩm như menu, voucher, catalogue.'],
    ['Thiết kế', 'Thiết kế logo, ấn phẩm quảng cáo và hệ thống nhận diện thương hiệu.'],
    ['Nội ngoại thất', 'Thiết kế không gian cho cửa hàng, showroom và quán cà phê.'],
  ].map(([title, description]) => ({title, description, image: title === 'Đèn LED & Neon' ? '/media/neon.jpg' : '', visible: true})),
  projects: [
    {title:'Hệ thống cửa hàng Circle K', category:'Biển quảng cáo', description:'Hình ảnh mặt tiền các cửa hàng trong bộ ảnh dự án do Color Center giới thiệu.', image:'/media/hero.jpg', visible:true},
  ],
};
