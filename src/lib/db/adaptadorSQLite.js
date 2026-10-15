/**
 * ============================================================================
 *  ADAPTADOR SQLITE (compartido por Tauri y Capacitor)
 * ----------------------------------------------------------------------------
 *  Recibe un "driver" con dos operaciones de bajo nivel:
 *     consultar(sql, params) → filas[]
 *     ejecutar(sql, params)  -> { lastId, cambios }
 *  y expone la misma interfaz de colecciones que el adaptador de Dexie.
 *  Así la lógica de negocio (repositorio) no sabe en qué plataforma corre.
 * ============================================================================
 */
import { SQL_ESQUEMA, SQL_MIGRACIONES, TABLAS, TABLAS_SIN_ID } from './esquema.js';

// Escapa un identificador (tabla/columna) usando comillas dobles.
function comillas(identificador) {
  return `"${String(identificador).replace(/"/g, '""')}"`;
}

// Valida que la tabla exista en el esquema (lista blanca).
function validarTabla(tabla) {
  if (!TABLAS[tabla]) throw new Error(`Tabla desconocida: ${tabla}`);
  return tabla;
}

// Construye un WHERE parametrizado a partir de un objeto {campo: valor}.
function construirDonde(criterio) {
  if (!criterio || Object.keys(criterio).length === 0) return { sql: '', params: [] };
  const partes = [];
  const params = [];
  for (const [campo, valor] of Object.entries(criterio)) {
    partes.push(`${campo} = ?`);
    params.push(valor);
  }
  return { sql: ` WHERE ${partes.join(' AND ')}`, params };
}

/** Crea el adaptador SQLite a partir de un driver (Tauri o Capacitor). */
export function crearAdaptadorSQLite(driver) {
  return {
    nombre: driver.nombre,
    plataforma: driver.plataforma,

    // Crea todas las tablas (idempotente).
    async iniciar() {
      for (const sentencia of SQL_ESQUEMA) {
        await driver.ejecutar(sentencia, []);
      }
      // Aplica migraciones tolerantes (si la columna ya existe, se ignora).
      for (const sentencia of SQL_MIGRACIONES) {
        try {
          await driver.ejecutar(sentencia, []);
        } catch {
          /* columna ya presente */
        }
      }
    },

    // Devuelve todos los registros de una tabla, opcionalmente filtrados.
    async listar(tabla, criterio = null) {
      construirDondeValidando(tabla, criterio);
      const { sql, params } = construirDonde(criterio);
      return driver.consultar(`SELECT * FROM ${tabla}${sql}`, params);
    },

    // Busca un registro por su id.
    async obtener(tabla, id) {
      const filas = await driver.consultar(`SELECT * FROM ${tabla} WHERE id = ?`, [id]);
      return filas[0] || null;
    },

    // Inserta un registro y devuelve el id generado.
    async insertar(tabla, datos) {
      validarColumnas(tabla, datos);
      const columnas = Object.keys(datos);
      const marcas = columnas.map(() => '?').join(', ');
      const prefijo = tabla === 'reporte_lideres' ? 'INSERT OR IGNORE' : 'INSERT';
      const resultado = await driver.ejecutar(
        `${prefijo} INTO ${tabla} (${columnas.join(', ')}) VALUES (${marcas})`,
        Object.values(datos)
      );
      return resultado.cambios > 0 ? resultado.lastId : null;
    },

    // Actualiza un registro por id.
    async actualizar(tabla, id, datos) {
      validarColumnas(tabla, datos);
      const asignaciones = Object.keys(datos).map((c) => `${c} = ?`).join(', ');
      await driver.ejecutar(`UPDATE ${tabla} SET ${asignaciones} WHERE id = ?`, [...Object.values(datos), id]);
    },

    // Elimina un registro por id (borra en cascada lo relacionado en SQLite).
    async eliminar(tabla, id) {
      await driver.ejecutar(`DELETE FROM ${tabla} WHERE id = ?`, [id]);
    },

    // Elimina todos los registros que cumplan el criterio.
    async eliminarPor(tabla, criterio) {
      const { sql, params } = construirDonde(criterio);
      await driver.ejecutar(`DELETE FROM ${tabla}${sql}`, params);
    }
  };
}

// Valida que las columnas enviadas existan en la tabla (lista blanca).
function validarColumnas(tabla, datos) {
  validarTabla(tabla);
  for (const campo of Object.keys(datos)) {
    if (!TABLAS[tabla].includes(campo)) {
      throw new Error(`Columna no válida "${campo}" en la tabla ${tabla}`);
    }
  }
}

// Valida tanto la tabla como las columnas usadas en el filtro.
function construirDondeValidando(tabla, criterio) {
  validarTabla(tabla);
  if (!criterio) return;
  for (const campo of Object.keys(criterio)) {
    if (!TABLAS[tabla].includes(campo)) throw new Error(`Columna desconocida: ${campo}`);
  }
}
