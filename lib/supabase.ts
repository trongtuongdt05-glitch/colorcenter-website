export function databaseConfigured() {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SECRET_KEY);
}

export function adminConfigured() {
  return Boolean(databaseConfigured() && process.env.SUPABASE_PUBLISHABLE_KEY && process.env.ADMIN_EMAIL);
}

export function supabase(path: string, options: RequestInit = {}, access?: {token?: string}) {
  const url = process.env.SUPABASE_URL;
  const key = access ? process.env.SUPABASE_PUBLISHABLE_KEY : process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) throw new Error('Supabase is not configured');
  const headers = new Headers(options.headers);
  headers.set('apikey', key);
  if (access?.token) headers.set('Authorization', `Bearer ${access.token}`);
  else if (key.startsWith('eyJ')) headers.set('Authorization', `Bearer ${key}`);
  return fetch(new URL(path, url), {...options, headers, cache:'no-store', signal: AbortSignal.timeout(8000)});
}

export async function records<T>(tableQuery: string, options?: RequestInit) {
  const response = await supabase('/rest/v1/' + tableQuery, options);
  if (!response.ok) throw new Error(`Supabase data request returned HTTP ${response.status}`);
  const body = await response.text();
  return body.trim() ? JSON.parse(body) as T[] : [];
}

export function mutation(method: string, body: unknown, prefer = 'return=minimal'): RequestInit {
  return {method, headers:{'Content-Type':'application/json',Prefer:prefer}, body:JSON.stringify(body)};
}
