import { z } from 'zod';
import { defaults, siteSchema } from './colorcenter';
import { currentAdmin } from './admin-auth';
import { databaseConfigured, records } from './supabase';

const storedContentSchema = siteSchema.extend({orangePalette:z.literal(true).optional(), servicePhotosUpdated:z.literal(true).optional()});

export async function getContent() {
  if (!databaseConfigured()) return {data:defaults,revision:0};
  const [row] = await records<{body:unknown; revision:number}>('site_content?id=eq.1&select=body,revision');
  if (!row) return {data:defaults,revision:0};
  const {orangePalette,servicePhotosUpdated,...data} = storedContentSchema.parse(row.body);
  const services = servicePhotosUpdated ? data.services : data.services.map(item => {
    const originalImage = item.title === 'Đèn LED & Neon' ? '/media/neon.jpg' : '';
    const updatedImage = defaults.services.find(service => service.title === item.title)?.image;
    return updatedImage && item.image === originalImage ? {...item,image:updatedImage} : item;
  });
  return {data:{...data,services,accent:orangePalette?data.accent:defaults.accent},revision:row.revision};
}

export const isAdmin = async () => Boolean(await currentAdmin());

export function sameOrigin(request: Request) {
  const origin = request.headers.get('origin');
  const site = request.headers.get('sec-fetch-site');
  return site === 'same-origin' || (!site && origin === new URL(request.url).origin);
}

export type Lead = {id:string; name:string; phone:string; service:string; message:string; created:number; status:string};
