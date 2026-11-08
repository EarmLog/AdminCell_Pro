import { createClient } from '@supabase/supabase-js';

let cliente;

export function obtenerClienteSupabase() {
  if (cliente) return cliente;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) return null;

  cliente = createClient(url, anonKey, { db: { schema: 'AdminCellPro' } });
  return cliente;
}
