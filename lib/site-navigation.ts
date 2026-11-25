import type { Card } from './colorcenter';

export function publicEntries<T extends Card>(items: T[]) {
  const used = new Set<string>();
  return items.map(item => {
    const base = item.title.toLowerCase().normalize('NFD')
      .replace(/\p{M}/gu, '').replace(/đ/g, 'd')
      .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'chi-tiet';
    let slug = base;
    let suffix = 2;
    while (used.has(slug)) slug = `${base}-${suffix++}`;
    used.add(slug);
    return { ...item, slug };
  }).filter(item => item.visible);
}

export const quoteUrl = (service?: string) =>
  service ? `/lien-he?dich-vu=${encodeURIComponent(service)}#bao-gia` : '/lien-he#bao-gia';

export const phoneUrl = (phone: string) => `tel:${phone.replace(/[^+\d]/g, '')}`;
