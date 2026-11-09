import Dexie from 'dexie';
import { createClient } from '@supabase/supabase-js';
import 'fake-indexeddb/auto';

process.env.NEXT_PUBLIC_SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://db.qqqpmabsdvqrjygvgfqy.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFxcXBtYWJzZHZxcmp5Z3ZnZnF5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIzNjQyOTUsImV4cCI6MjEwNzk0MDI5NX0.UTQLiIqJ74RTTL_cwxf-mFpDiv5IiQk1tEU7Sn9Qn9s';

const NOMBRE_BD = 'admincell_pro';
const ESQUEMA_DEXIE = {
  sectores: '++id, nombre, codigo',
  periodos: '++id, nombre, fecha_inicio',
  reportes: '++id, periodo_id, sector_id, codigo',
  lideres: '++id, nombre',
  reporte_lideres: '[reporte_id+lider_id], reporte_id, lider_id'
};

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, { db: { schema: 'AdminCellPro' } });

const bd = new Dexie(NOMBRE_BD);
bd.version(1).stores(ESQUEMA_DEXIE);
await bd.open();

const TABLAS = ['sectores', 'periodos', 'reportes', 'lideres', 'reporte_lideres'];

for (const tabla of TABLAS) {
  const filas = await bd.table(tabla).toArray();
  if (!filas || filas.length === 0) continue;
  const { error } = await supabase.from(tabla).insert(filas);
  if (error) throw error;
}

await bd.close();
console.log('Migracion completada');
