import {databaseConfigured,supabase} from '../../../../lib/supabase';

export async function GET(_:Request,{params}:{params:Promise<{name:string}>}) {
  const {name} = await params;
  const ext = /^[a-f0-9-]{36}\.(png|jpg|webp)$/.exec(name)?.[1];
  if (!ext || !databaseConfigured()) return new Response(null,{status:404});
  const image = await supabase(`/storage/v1/object/authenticated/colorcenter-media/${name}`);
  if (!image.ok) return new Response(null,{status:image.status===404?404:502});
  return new Response(image.body,{headers:{
    'Content-Type':ext==='jpg'?'image/jpeg':`image/${ext}`,
    'Cache-Control':'public, max-age=86400','X-Content-Type-Options':'nosniff',
  }});
}
