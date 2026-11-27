import { records } from '../../lib/supabase';

export async function allRows<T>(table: string) {
  const result: T[] = [];
  const limit = 200;
  for (let offset = 0; ; offset += limit) {
    const batch = await records<T>(`${table}?order=id.asc&offset=${offset}&limit=${limit}`);
    result.push(...batch);
    if (batch.length < limit) return result;
  }
}

