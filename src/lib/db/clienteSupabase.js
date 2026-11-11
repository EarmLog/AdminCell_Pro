import { createClient } from '@supabase/supabase-js';

let cliente;

export function obtenerClienteSupabase() {
  if (cliente) return cliente;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://qqqpmabsdvqrjygvgfqy.supabase.co';
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFxcXBtYWJzZHZxcmp5Z3ZnZnF5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIzNjQyOTUsImV4cCI6MjEwNzk0MDI5NX0.UTQLiIqJ74RTTL_cwxf-mFpDiv5IiQk1tEU7Sn9Qn9s';

  if (!url || !anonKey) return null;

  cliente = createClient(url, anonKey, { db: { schema: 'AdminCellPro' } });
  return cliente;
}
