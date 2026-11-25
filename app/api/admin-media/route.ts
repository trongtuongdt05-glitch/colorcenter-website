import { databaseConfigured, supabase } from '../../../lib/supabase';
import { isAdmin, sameOrigin } from '../../../lib/colorcenter-server';

export async function POST(request: Request) {
  if (!sameOrigin(request) || !await isAdmin()) return new Response(null, {status: 403});
  if (!databaseConfigured()) return Response.json({error: 'Kho ảnh chưa sẵn sàng.'}, {status: 503});
  const form = await request.formData().catch(() => null);
  const file = form?.get('image');
  if (!(file instanceof File) || !file.size || file.size > 4 * 1024 * 1024)
    return Response.json({error: 'Chọn ảnh JPG, PNG hoặc WebP, tối đa 4 MB.'}, {status: 400});
  const b = new Uint8Array(await file.slice(0, 12).arrayBuffer());
  const png = [137,80,78,71,13,10,26,10].every((v,i) => b[i] === v);
  const jpeg = b[0] === 255 && b[1] === 216 && b[2] === 255;
  const webp = b.length === 12 && String.fromCharCode(...b.slice(0,4), ...b.slice(8,12)) === 'RIFFWEBP';
  const ext = png ? 'png' : jpeg ? 'jpg' : webp ? 'webp' : null;
  if (!ext) return Response.json({error: 'Định dạng ảnh chưa được hỗ trợ.'}, {status: 400});
  const name = `${crypto.randomUUID()}.${ext}`;
  const uploaded = await supabase(`/storage/v1/object/colorcenter-media/${name}`,{method:'POST',headers:{'Content-Type':jpeg?'image/jpeg':`image/${ext}`},body:file});
  if (!uploaded.ok) return Response.json({error:'Tải ảnh chưa thành công.'},{status:502});
  return Response.json({url: `/api/media/${name}`});
}
