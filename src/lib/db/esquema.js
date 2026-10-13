/**
 * ============================================================================
 *  ESQUEMA DE DATOS (común para Web y Escritorio/Android)
 * ----------------------------------------------------------------------------
 *  Un solo lugar define las tablas/colecciones. A partir de aquí se generan:
 *    - El esquema de Dexie (IndexedDB) que usa la Web.
 *    - El esquema SQL (CREATE TABLE) que usan Tauri y Capacitor (SQLite).
 *  Mantener una única definición evita que las plataformas se desincronicen.
 * ============================================================================
 */

// Nombre lógico de la base de datos (se usa como archivo en SQLite).
export const NOMBRE_BD = process.env.NEXT_PUBLIC_DB_NOMBRE || 'admincell_pro';

// Columnas válidas por tabla. Se usan como lista blanca para construir SQL.
export const TABLAS = {
  sectores: ['id', 'nombre', 'codigo', 'descripcion', 'creado_en'],
  periodos: ['id', 'nombre', 'fecha_inicio', 'fecha_fin', 'creado_en'],
  reportes: [
    'id',
    'periodo_id',
    'sector_id',
    'codigo',
    'lideres',
    'personas',
    'asistencias',
    'inasistencias',
    'invitados',
    'ninos',
    'observaciones',
    'creado_en',
    'actualizado_en'
  ],
  lideres: ['id', 'nombre', 'telefono', 'creado_en'],
  // Relación muchos a muchos: reporte ↔ líderes (clave primaria compuesta).
  reporte_lideres: ['reporte_id', 'lider_id']
};

// Tablas con clave primaria compuesta (no tienen columna `id`).
export const TABLAS_SIN_ID = ['reporte_lideres'];

// ---------------------------------------------------------------------------
//  Esquema SQL (SQLite) — usado por Tauri (Escritorio) y Capacitor (Android)
// ---------------------------------------------------------------------------
export const SQL_ESQUEMA = [
  `CREATE TABLE IF NOT EXISTS sectores (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre        TEXT    NOT NULL UNIQUE,
      codigo        TEXT    NOT NULL,
      descripcion   TEXT,
      creado_en     TEXT    NOT NULL DEFAULT (datetime('now','localtime'))
  )`,

  `CREATE TABLE IF NOT EXISTS periodos (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre        TEXT    NOT NULL UNIQUE,
      fecha_inicio  TEXT,
      fecha_fin     TEXT,
      creado_en     TEXT    NOT NULL DEFAULT (datetime('now','localtime'))
  )`,

  `CREATE TABLE IF NOT EXISTS reportes (
      id             INTEGER PRIMARY KEY AUTOINCREMENT,
      periodo_id     INTEGER NOT NULL,
      sector_id      INTEGER NOT NULL,
      codigo         TEXT    NOT NULL,
      lideres        TEXT,
      personas       INTEGER NOT NULL DEFAULT 0,
      asistencias    INTEGER NOT NULL DEFAULT 0,
      inasistencias  INTEGER NOT NULL DEFAULT 0,
      invitados      INTEGER NOT NULL DEFAULT 0,
      ninos          INTEGER NOT NULL DEFAULT 0,
      observaciones  TEXT,
      creado_en      TEXT    NOT NULL DEFAULT (datetime('now','localtime')),
      actualizado_en TEXT    NOT NULL DEFAULT (datetime('now','localtime')),
      FOREIGN KEY (periodo_id) REFERENCES periodos(id) ON DELETE CASCADE,
      FOREIGN KEY (sector_id)  REFERENCES sectores(id) ON DELETE CASCADE
  )`,

  `CREATE TABLE IF NOT EXISTS lideres (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre     TEXT    NOT NULL UNIQUE,
      telefono   TEXT,
      creado_en  TEXT    NOT NULL DEFAULT (datetime('now','localtime'))
  )`,

  `CREATE TABLE IF NOT EXISTS reporte_lideres (
      reporte_id INTEGER NOT NULL,
      lider_id   INTEGER NOT NULL,
      PRIMARY KEY (reporte_id, lider_id),
      FOREIGN KEY (reporte_id) REFERENCES reportes(id) ON DELETE CASCADE,
      FOREIGN KEY (lider_id)   REFERENCES lideres(id)  ON DELETE CASCADE
  )`
];

// ---------------------------------------------------------------------------
//  Esquema de Dexie (IndexedDB) — usado por la Web (Vercel / PWA)
// ---------------------------------------------------------------------------
export const ESQUEMA_DEXIE = {
  sectores: '++id, nombre, codigo',
  periodos: '++id, nombre, fecha_inicio',
  reportes: '++id, periodo_id, sector_id, codigo',
  lideres: '++id, nombre',
  reporte_lideres: '[reporte_id+lider_id], reporte_id, lider_id'
};

/** Devuelve la fecha/hora local en formato ISO (YYYY-MM-DD HH:MM:SS). */
export function fechaLocalAhora() {
  const ahora = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return (
    `${ahora.getFullYear()}-${pad(ahora.getMonth() + 1)}-${pad(ahora.getDate())} ` +
    `${pad(ahora.getHours())}:${pad(ahora.getMinutes())}:${pad(ahora.getSeconds())}`
  );
}
