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
import { detectarPlataforma } from '../plataforma.js';

let adaptadorActivo = null;
let promesaInicializacion = null;

/**
 * Obtiene (y crea si hace falta) el adaptador de la plataforma actual.
 * La promesa se guarda para no crear dos conexiones a la vez.
 */
export async function obtenerAdaptador() {
  if (adaptadorActivo) return adaptadorActivo;
  if (promesaInicializacion) return promesaInicializacion;

  promesaInicializacion = (async () => {
    const plataforma = detectarPlataforma();

    // Escritorio: Tauri + SQLite
    if (plataforma === 'tauri') {
      const [{ crearDriverTauri }, { crearAdaptadorSQLite }] = await Promise.all([
        import('./driverTauri.js'),
        import('./adaptadorSQLite.js')
      ]);
      adaptadorActivo = crearAdaptadorSQLite(await crearDriverTauri());
    }
    // Android: Capacitor + SQLite
    else if (plataforma === 'capacitor') {
      const [{ crearDriverCapacitor }, { crearAdaptadorSQLite }] = await Promise.all([
        import('./driverCapacitor.js'),
        import('./adaptadorSQLite.js')
      ]);
      adaptadorActivo = crearAdaptadorSQLite(await crearDriverCapacitor());
    }
    // Web (y respaldo): Dexie + IndexedDB
    else {
      const { crearAdaptadorDexie } = await import('./adaptadorDexie.js');
      adaptadorActivo = crearAdaptadorDexie();
    }

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
