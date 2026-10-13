/**
 * ============================================================================
 *  DRIVER SQLITE PARA TAURI (Escritorio)
 * ----------------------------------------------------------------------------
 *  Usa el plugin `@tauri-apps/plugin-sql`. Traduce las operaciones genéricas
 *  (consultar/ejecutar) al API de la conexión de Tauri.
 * ============================================================================
 */
import { NOMBRE_BD } from './esquema.js';

/** Abre (o crea) la base de datos SQLite en el escritorio. */
export async function crearDriverTauri() {
  const { default: Database } = await import('@tauri-apps/plugin-sql');

  // `sqlite:archivo.db` crea el archivo en el directorio de datos de la app.
  const conexion = await Database.load(`sqlite:${NOMBRE_BD}.db`);

  return {
    nombre: 'SQLite (Tauri)',
    plataforma: 'tauri',

    // Lectura de datos.
    async consultar(sql, params = []) {
      return conexion.select(sql, params);
    },

    // Escritura / DDL: devuelve el id insertado y las filas afectadas.
    async ejecutar(sql, params = []) {
      const resultado = await conexion.execute(sql, params);
      return {
        lastId: resultado.lastInsertId ?? null,
        cambios: resultado.rowsAffected ?? 0
      };
    }
  };
}
