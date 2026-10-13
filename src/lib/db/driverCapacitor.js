/**
 * ============================================================================
 *  DRIVER SQLITE PARA CAPACITOR (Android)
 * ----------------------------------------------------------------------------
 *  Usa el plugin `@capacitor-community/sqlite`. Expone las operaciones
 *  genéricas (consultar/ejecutar) que consume el adaptador SQLite.
 * ============================================================================
 */
import { NOMBRE_BD } from './esquema.js';

/** Abre (o crea) la base de datos SQLite nativa en Android. */
export async function crearDriverCapacitor() {
  const { CapacitorSQLite, SQLiteConnection } = await import('@capacitor-community/sqlite');

  const sqlite = new SQLiteConnection(CapacitorSQLite);
  // createConnection(nombre, readOnly, encryption, version, isEncryption)
  const conexion = await sqlite.createConnection(NOMBRE_BD, false, 'no-encryption', 1, false);
  await conexion.open();

  return {
    nombre: 'SQLite (Capacitor)',
    plataforma: 'capacitor',

    // Lectura de datos.
    async consultar(sql, params = []) {
      const resultado = await conexion.query(sql, params);
      return resultado.values || [];
    },

    // Escritura / DDL: devuelve el id insertado y las filas afectadas.
    async ejecutar(sql, params = []) {
      const resultado = await conexion.run(sql, params);
      return {
        lastId: resultado.changes?.lastId ?? null,
        cambios: resultado.changes?.changes ?? 0
      };
    }
  };
}
