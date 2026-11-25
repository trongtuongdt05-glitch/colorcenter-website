import { mutation, records } from '../../../lib/supabase';
import { siteSchema } from '../../../lib/colorcenter';
import { isAdmin, sameOrigin } from '../../../lib/colorcenter-server';

export async function PUT(request: Request) {
  if (!sameOrigin(request) || !await isAdmin()) return new Response(null, {status: 403});
  const payload = await request.json().catch(() => null) as {data?:unknown; revision?:unknown} | null;
  const parsed = siteSchema.safeParse(payload?.data);
  if (!parsed.success && parsed.error.issues.some(issue => issue.path[0] === 'leadEmail')) {
    return Response.json({error: 'Vui lòng nhập email nhận lead hợp lệ hoặc để trống.'}, {status: 400});
  }
  const revision = payload?.revision;
  if (!parsed.success || typeof revision !== 'number' || !Number.isSafeInteger(revision) || revision < 0)
    return Response.json({error: 'Kiểm tra nội dung, màu, email và đường dẫn ảnh trước khi lưu.'}, {status: 400});
  const body = {...parsed.data, orangePalette:true, servicePhotosUpdated:true};
  const next = revision + 1;
  const result = revision === 0
    ? await records('site_content?on_conflict=id',mutation('POST',{id:1,revision:next,body},'resolution=ignore-duplicates,return=representation'))
    : await records(`site_content?id=eq.1&revision=eq.${revision}`,mutation('PATCH',{revision:next,body},'return=representation'));
  if (!result.length) return Response.json({error: 'Nội dung đã được lưu từ một phiên khác. Mở lại trang quản trị để lấy phiên bản mới nhất.'}, {status: 409});
  return Response.json({revision: next});
}
