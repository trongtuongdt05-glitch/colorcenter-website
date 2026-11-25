import { cookies } from 'next/headers';
import { adminConfigured, supabase } from './supabase';

export const sessionCookie = 'colorcenter_admin';

export async function currentAdmin() {
  if (!adminConfigured()) return null;
  const token = (await cookies()).get(sessionCookie)?.value;
  if (!token) return null;
  try {
    const response = await supabase('/auth/v1/user', {}, {token});
    if (!response.ok) return null;
    const user = await response.json() as {email?:string};
    return user.email && user.email.toLowerCase() === process.env.ADMIN_EMAIL?.trim().toLowerCase() ? {email:user.email} : null;
  } catch {
    return null;
  }
}
