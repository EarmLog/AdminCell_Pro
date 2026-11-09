import { crearAdaptadorDexie } from './adaptadorDexie.js';
import { obtenerClienteSupabase } from './clienteSupabase.js';

const TABLAS = ['sectores', 'periodos', 'reportes', 'lideres', 'reporte_lideres'];

export async function sincronizarConSupabase() {
  const cliente = obtenerClienteSupabase();
  if (!cliente) {
    throw new Error('Supabase no configurado');
  }

  const adaptadorLocal = crearAdaptadorDexie();
  const resultados = {};

  for (const tabla of TABLAS) {
    const filas = await adaptadorLocal.listar(tabla);
    if (!filas || filas.length === 0) continue;
    const { error } = await cliente.from(tabla).insert(filas);
    if (error) throw error;
    resultados[tabla] = filas.length;
  }

  return resultados;
}
