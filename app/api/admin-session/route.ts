import { NextResponse } from 'next/server';
import { sameOrigin } from '../../../lib/colorcenter-server';
import { sessionCookie } from '../../../lib/admin-auth';
import { adminConfigured, supabase } from '../../../lib/supabase';

export async function POST(request: Request) {
  if (!sameOrigin(request)) return new Response(null,{status:403});
  const form = await request.formData().catch(() => null);
  const reply = (query = '') => NextResponse.redirect(new URL('/cpanel' + query, request.url),303);
  if (form?.get('action') === 'logout') {
    const response = reply();
    response.cookies.delete(sessionCookie);
    return response;
  }
  if (!adminConfigured()) return reply('?loi=cau-hinh');
  const email = form?.get('email');
  const password = form?.get('password');
  if (typeof email !== 'string' || typeof password !== 'string' || password.length > 256) return reply('?loi=dang-nhap');
  try {
    const auth = await supabase('/auth/v1/token?grant_type=password', {
      method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:email.trim(),password}),
    }, {});
    if (!auth.ok) return reply('?loi=dang-nhap');
    const result = await auth.json() as {access_token?:string; expires_in?:number; user?:{email?:string}};
    if (!result.access_token || !result.expires_in || result.user?.email?.toLowerCase() !== process.env.ADMIN_EMAIL?.trim().toLowerCase())
      return reply('?loi=dang-nhap');
    const response = reply();
    response.cookies.set(sessionCookie,result.access_token,{httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'lax',path:'/',maxAge:result.expires_in});
    return response;
  } catch {
    return reply('?loi=ket-noi');
  }
}
