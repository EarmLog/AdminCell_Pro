/**
 * ============================================================================
 *  ADAPTADOR DEXIE (IndexedDB) — usado por la Web (Vercel / PWA)
 * ----------------------------------------------------------------------------
 *  Expone la misma interfaz que el adaptador SQLite: listar, obtener, insertar,
 *  actualizar, eliminar y eliminarPor. Así el resto de la app no sabe si la
 *  base de datos es IndexedDB (Web) o SQLite (Escritorio/Android).
 * ============================================================================
 */
import { ESQUEMA_DEXIE, NOMBRE_BD, fechaLocalAhora } from './esquema.js';

let bdCache = null;
let promesaApertura = null;

/** Abre la base de datos de Dexie una sola vez (perezoso). */
async function abrir() {
  if (bdCache) return bdCache;
  if (promesaApertura) return promesaApertura;

  promesaApertura = (async () => {
    // Dexie solo vive en el navegador: se importa de forma diferida.
    const { default: Dexie } = await import('dexie');
    const bd = new Dexie(NOMBRE_BD);
    bd.version(1).stores(ESQUEMA_DEXIE);
    await bd.open();
    bdCache = bd;
    return bd;
  })();

  return promesaApertura;
}

/** Crea el adaptador de base de datos basado en Dexie. */
export function crearAdaptadorDexie() {
  return {
    nombre: 'Dexie (IndexedDB)',
    plataforma: 'web',

    async iniciar() {
      await abrir();
    },

    async listar(tabla, criterio = null) {
      const bd = await abrir();
      const coleccion = bd.table(tabla).toCollection();
      if (!criterio || Object.keys(criterio).length === 0) {
        return coleccion.toArray();
      }
      const entradas = Object.entries(criterio);
      return coleccion.filter((r) => entradas.every(([campo, valor]) => r[campo] === valor)).toArray();
    },

    async obtener(tabla, id) {
      const bd = await abrir();
      return (await bd.table(tabla).get(id)) || null;
    },

    async insertar(tabla, datos) {
      const bd = await abrir();
      // reporte_lideres usa clave compuesta: `put` evita error si ya existe.
      if (tabla === 'reporte_lideres') {
        await bd.table(tabla).put({ reporte_id: datos.reporte_id, lider_id: datos.lider_id });
        return null;
      }
      return bd.table(tabla).add({ creado_en: fechaLocalAhora(), ...datos });
    },

    async actualizar(tabla, id, datos) {
      const bd = await abrir();
      await bd.table(tabla).update(id, datos);
    },

    async eliminar(tabla, id) {
      const bd = await abrir();
      await bd.table(tabla).delete(id);
    },

    async eliminarPor(tabla, criterio) {
      const bd = await abrir();
      // Camino rápido para la relación reporte ↔ líderes.
      if (tabla === 'reporte_lideres' && criterio.reporte_id !== undefined) {
        await bd.table(tabla).where('reporte_id').equals(criterio.reporte_id).delete();
        return;
      }
      const entradas = Object.entries(criterio);
      const claves = await bd
        .table(tabla)
        .toCollection()
        .filter((r) => entradas.every(([campo, valor]) => r[campo] === valor))
        .primaryKeys();
      await bd.table(tabla).bulkDelete(claves);
    }
  };
}
