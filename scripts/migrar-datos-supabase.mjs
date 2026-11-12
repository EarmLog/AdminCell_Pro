import 'fake-indexeddb/auto';
import Dexie from 'dexie';
import { createClient } from '@supabase/supabase-js';

const DB_NAME = 'admincell_pro';
const ESQUEMA = 'public';
const SUPABASE_URL = 'https://qqqpmabsdvqrjygvgfqy.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFxcXBtYWJzZHZxcmp5Z3ZnZnF5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIzNjQyOTUsImV4cCI6MjEwNzk0MDI5NX0.UTQLiIqJ74RTTL_cwxf-mFpDiv5IiQk1tEU7Sn9Qn9s';

const db = new Dexie(DB_NAME);
db.version(1).stores({
  sectores: '++id, nombre, codigo',
  periodos: '++id, nombre, fecha_inicio',
  reportes: '++id, periodo_id, sector_id, codigo',
  lideres: '++id, nombre',
  reporte_lideres: '[reporte_id+lider_id], reporte_id, lider_id'
});

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { db: { schema: ESQUEMA } });

async function main() {
  const sectores = await db.table('sectores').toArray();
  const periodos = await db.table('periodos').toArray();
  const reportes = await db.table('reportes').toArray();
  const lideres = await db.table('lideres').toArray();
  const reporteLideres = await db.table('reporte_lideres').toArray();

  console.log(`sectores=${sectores.length} periodos=${periodos.length} reportes=${reportes.length} lideres=${lideres.length} reporte_lideres=${reporteLideres.length}`);

  for (const s of sectores) {
    const { error } = await supabase.from('sectores').insert({
      nombre: s.nombre,
      codigo: s.codigo,
      descripcion: s.descripcion ?? null,
      creado_en: s.creado_en ?? new Date().toISOString()
    });
    if (error) console.error('Error migrando sector', s.id, error.message);
  }

  for (const p of periodos) {
    const { error } = await supabase.from('periodos').insert({
      nombre: p.nombre,
      fecha_inicio: p.fecha_inicio ?? null,
      fecha_fin: p.fecha_fin ?? null,
      creado_en: p.creado_en ?? new Date().toISOString()
    });
    if (error) console.error('Error migrando periodo', p.id, error.message);
  }

  for (const r of reportes) {
    const { error } = await supabase.from('reportes').insert({
      periodo_id: r.periodo_id,
      sector_id: r.sector_id,
      personas: r.personas ?? 0,
      asistencias: r.asistencias ?? 0,
      inasistencias: r.inasistencias ?? 0,
      invitados: r.invitados ?? 0,
      ninos: r.ninos ?? 0,
      activo: r.activo ?? 1,
      observaciones: r.observaciones ?? null,
      creado_en: r.creado_en ?? new Date().toISOString(),
      actualizado_en: r.actualizado_en ?? new Date().toISOString()
    });
    if (error) console.error('Error migrando reporte', r.id, error.message);
  }

  for (const l of lideres) {
    const { error } = await supabase.from('lideres').insert({
      nombre: l.nombre,
      telefono: l.telefono ?? null,
      creado_en: l.creado_en ?? new Date().toISOString()
    });
    if (error) console.error('Error migrando lider', l.id, error.message);
  }

  for (const rl of reporteLideres) {
    const { error } = await supabase.from('reporte_lideres').insert({
      reporte_id: rl.reporte_id,
      lider_id: rl.lider_id
    });
    if (error) console.error('Error migrando reporte_lider', rl, error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((e) => { console.error(e); process.exit(1); });
