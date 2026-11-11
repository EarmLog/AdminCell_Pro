/**
 * ============================================================================
 *  ADAPTADOR DE BASE DE DATOS UNIFICADO (Capa de Abstracción)
 * ----------------------------------------------------------------------------
 *  Detecta la plataforma y devuelve el adaptador correcto:
 *    - Web (Vercel/PWA) ........ Dexie.js (IndexedDB)
 *    - Escritorio (Tauri) ...... SQLite vía @tauri-apps/plugin-sql
 *    - Android (Capacitor) ..... SQLite vía @capacitor-community/sqlite
 *
 *  El resto de la aplicación consume siempre el mismo objeto `bd`, por lo que
 *  no hay código duplicado por plataforma.
 * ============================================================================
 */
import { crearAdaptadorSupabase } from './adaptadorSupabase.js';

let adaptadorActivo = null;
let promesaInicializacion = null;

export async function obtenerAdaptador() {
  if (adaptadorActivo) return adaptadorActivo;
  if (promesaInicializacion) return promesaInicializacion;

  promesaInicializacion = (async () => {
    adaptadorActivo = crearAdaptadorSupabase();

    // Crea el esquema de la base de datos (idempotente).
    await adaptadorActivo.iniciar();
    return adaptadorActivo;
  })();

  return promesaInicializacion;
}

// Ejecuta una acción contra el adaptador ya resuelto.
async function conAdaptador(accion) {
  const adaptador = await obtenerAdaptador();
  return accion(adaptador);
}

/**
 * Objeto único de acceso a datos. Mantiene la misma API sin importar la
 * plataforma. Todas las operaciones devuelven promesas.
 */
export const bd = {
  listar: (tabla, criterio) => conAdaptador((ad) => ad.listar(tabla, criterio)),
  obtener: (tabla, id) => conAdaptador((ad) => ad.obtener(tabla, id)),
  insertar: (tabla, datos) => conAdaptador((ad) => ad.insertar(tabla, datos)),
  actualizar: (tabla, id, datos) => conAdaptador((ad) => ad.actualizar(tabla, id, datos)),
  eliminar: (tabla, id) => conAdaptador((ad) => ad.eliminar(tabla, id)),
  eliminarPor: (tabla, criterio) => conAdaptador((ad) => ad.eliminarPor(tabla, criterio))
};

/** Información del motor de datos en uso (para mostrar en la interfaz). */
export async function informacionMotor() {
  const adaptador = await obtenerAdaptador();
  return { nombre: adaptador.nombre, plataforma: adaptador.plataforma };
}
