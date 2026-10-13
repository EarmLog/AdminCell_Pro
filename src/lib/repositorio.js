/**
 * ============================================================================
 *  REPOSITORIO / LÓGICA DE NEGOCIO
 * ----------------------------------------------------------------------------
 *  Todas las operaciones sobre sectores, períodos, líderes y reportes, más
 *  los módulos de análisis y el respaldo. Trabaja siempre contra el adaptador
 *  `bd`, por lo que funciona igual en Web, Escritorio y Android.
 *
 *  Nota: como la Web (IndexedDB) no aplica borrado en cascada, aquí se elimina
 *  manualmente lo relacionado para que el comportamiento sea idéntico en todas
 *  las plataformas.
 * ============================================================================
 */
import { bd } from './db/dbAdapter.js';
import { fechaLocalAhora } from './db/esquema.js';
import { limpiarTexto, aEnteroPositivo, validarCodigo, validarPrefijo } from './sanitizar.js';

// ---------------------------------------------------------------------------
// UTILIDADES INTERNAS
// ---------------------------------------------------------------------------

function sumar(reportes, campo) {
  return reportes.reduce((total, r) => total + (Number(r[campo]) || 0), 0);
}

/** Promedio del % de asistencia (solo reportes con personas > 0). */
function promedioPorcentaje(reportes) {
  const validos = reportes.filter((r) => (Number(r.personas) || 0) > 0);
  if (validos.length === 0) return 0;
  const suma = validos.reduce((total, r) => total + (Number(r.asistencias) || 0) / Number(r.personas), 0);
  return suma / validos.length;
}

function totalesVacios() {
  return {
    cantidad_reportes: 0,
    personas: 0,
    asistencias: 0,
    inasistentes: 0,
    invitados: 0,
    ninos: 0,
    porcentaje: 0
  };
}

/** Elimina los reportes de un criterio y sus vínculos con líderes. */
async function eliminarReportesPorCriterio(criterio) {
  const reportes = await bd.listar('reportes', criterio);
  for (const r of reportes) {
    await bd.eliminarPor('reporte_lideres', { reporte_id: r.id });
  }
  await bd.eliminarPor('reportes', criterio);
}

// ---------------------------------------------------------------------------
// SECTORES
// ---------------------------------------------------------------------------

export async function listarSectores() {
  const sectores = await bd.listar('sectores');
  return sectores.sort((a, b) => String(a.nombre).localeCompare(String(b.nombre)));
}

export async function obtenerSector(id) {
  return bd.obtener('sectores', id);
}

export async function crearSector(datos) {
  const nombre = limpiarTexto(datos.nombre, 80);
  const codigo = validarPrefijo(datos.codigo);
  if (!nombre) throw new Error('El nombre del sector es obligatorio.');
  if (!codigo) throw new Error('El código del sector es obligatorio.');
  return bd.insertar('sectores', { nombre, codigo, descripcion: limpiarTexto(datos.descripcion, 200) });
}

export async function actualizarSector(id, datos) {
  const nombre = limpiarTexto(datos.nombre, 80);
  const codigo = validarPrefijo(datos.codigo);
  if (!nombre) throw new Error('El nombre del sector es obligatorio.');
  if (!codigo) throw new Error('El código del sector es obligatorio.');
  await bd.actualizar('sectores', id, { nombre, codigo, descripcion: limpiarTexto(datos.descripcion, 200) });
}

export async function eliminarSector(id) {
  // Borra en cascada: reportes del sector y sus vínculos con líderes.
  await eliminarReportesPorCriterio({ sector_id: id });
  await bd.eliminar('sectores', id);
}

// ---------------------------------------------------------------------------
// PERÍODOS
// ---------------------------------------------------------------------------

export async function listarPeriodos() {
  const periodos = await bd.listar('periodos');
  return periodos.sort(
    (a, b) => String(a.fecha_inicio || '').localeCompare(String(b.fecha_inicio || '')) || a.id - b.id
  );
}

export async function obtenerPeriodo(id) {
  return bd.obtener('periodos', id);
}

export async function crearPeriodo(datos) {
  const nombre = limpiarTexto(datos.nombre, 80);
  if (!nombre) throw new Error('El nombre del período es obligatorio.');
  if (!datos.fecha_inicio || !datos.fecha_fin) throw new Error('Debe indicar la fecha de inicio y la de fin.');
  if (datos.fecha_inicio > datos.fecha_fin) throw new Error('La fecha de inicio no puede ser mayor que la de fin.');
  return bd.insertar('periodos', {
    nombre,
    fecha_inicio: limpiarTexto(datos.fecha_inicio, 10),
    fecha_fin: limpiarTexto(datos.fecha_fin, 10)
  });
}

export async function actualizarPeriodo(id, datos) {
  const nombre = limpiarTexto(datos.nombre, 80);
  if (!nombre) throw new Error('El nombre del período es obligatorio.');
  if (datos.fecha_inicio && datos.fecha_fin && datos.fecha_inicio > datos.fecha_fin) {
    throw new Error('La fecha de inicio no puede ser mayor que la de fin.');
  }
  await bd.actualizar('periodos', id, {
    nombre,
    fecha_inicio: limpiarTexto(datos.fecha_inicio, 10),
    fecha_fin: limpiarTexto(datos.fecha_fin, 10)
  });
}

export async function eliminarPeriodo(id) {
  await eliminarReportesPorCriterio({ periodo_id: id });
  await bd.eliminar('periodos', id);
}

// ---------------------------------------------------------------------------
// LÍDERES
// ---------------------------------------------------------------------------

export async function listarLideres() {
  const lideres = await bd.listar('lideres');
  return lideres.sort((a, b) => String(a.nombre).localeCompare(String(b.nombre)));
}

export async function obtenerLider(id) {
  return bd.obtener('lideres', id);
}

export async function crearLider(datos) {
  const nombre = limpiarTexto(datos.nombre, 80);
  if (!nombre) throw new Error('El nombre del líder es obligatorio.');
  return bd.insertar('lideres', { nombre, telefono: limpiarTexto(datos.telefono, 30) });
}

export async function actualizarLider(id, datos) {
  const nombre = limpiarTexto(datos.nombre, 80);
  if (!nombre) throw new Error('El nombre del líder es obligatorio.');
  await bd.actualizar('lideres', id, { nombre, telefono: limpiarTexto(datos.telefono, 30) });
}

export async function eliminarLider(id) {
  await bd.eliminarPor('reporte_lideres', { lider_id: id });
  await bd.eliminar('lideres', id);
}

// ---------------------------------------------------------------------------
// REPORTES
// ---------------------------------------------------------------------------

/** Devuelve los líderes (nombres e ids) agrupados por reporte. */
async function mapaDeLideres() {
  const [lideres, relaciones] = await Promise.all([bd.listar('lideres'), bd.listar('reporte_lideres')]);
  const porId = new Map(lideres.map((l) => [l.id, l]));
  const porReporte = new Map();
  for (const rel of relaciones) {
    const lider = porId.get(rel.lider_id);
    if (!lider) continue;
    if (!porReporte.has(rel.reporte_id)) porReporte.set(rel.reporte_id, []);
    porReporte.get(rel.reporte_id).push(lider);
  }
  return porReporte;
}

/**
 * Lista los reportes de un período con datos del sector y sus líderes.
 * Permite filtrar por sector y por código (de la célula o del sector).
 */
export async function listarReportes(periodoId, { sectorId = null, codigo = null } = {}) {
  const [reportes, sectores, lideresPorReporte] = await Promise.all([
    bd.listar('reportes', { periodo_id: periodoId }),
    bd.listar('sectores'),
    mapaDeLideres()
  ]);

  const mapaSectores = new Map(sectores.map((s) => [s.id, s]));
  let filas = reportes.map((r) => {
    const sector = mapaSectores.get(r.sector_id);
    const lideres = lideresPorReporte.get(r.id) || [];
    return {
      ...r,
      sector: sector?.nombre || '—',
      sector_codigo: sector?.codigo || '',
      lideres_nombres: lideres.map((l) => l.nombre).join(' / '),
      lideres_ids: lideres.map((l) => l.id)
    };
  });

  // Filtros opcionales en memoria (los conjuntos de datos son pequeños).
  if (sectorId) {
    filas = filas.filter((r) => String(r.sector_id) === String(sectorId));
  }
  if (codigo) {
    const texto = String(codigo).toLowerCase().trim();
    filas = filas.filter(
      (r) =>
        String(r.codigo || '').toLowerCase().includes(texto) ||
        String(r.sector_codigo || '').toLowerCase().includes(texto)
    );
  }

  filas.sort((a, b) => String(a.sector).localeCompare(String(b.sector)) || String(a.codigo).localeCompare(String(b.codigo)));
  return filas;
}

/** Calcula el siguiente código de célula (001, 002, …) para período + sector. */
export async function siguienteCodigoCeldula(periodoId, sectorId) {
  if (!periodoId || !sectorId) return '001';
  const reportes = await bd.listar('reportes', { periodo_id: periodoId, sector_id: sectorId });
  let max = 0;
  for (const r of reportes) {
    const coincidencia = String(r.codigo || '').match(/\d+$/);
    if (coincidencia) {
      const valor = parseInt(coincidencia[0], 10);
      if (!Number.isNaN(valor) && valor > max) max = valor;
    }
  }
  return String(max + 1).padStart(3, '0');
}

export async function obtenerReporte(id) {
  const reporte = await bd.obtener('reportes', id);
  if (!reporte) return null;
  const relaciones = await bd.listar('reporte_lideres', { reporte_id: id });
  return { ...reporte, liderIds: relaciones.map((r) => r.lider_id) };
}

/** Vincula una lista de líderes a un reporte (reemplaza los vínculos previos). */
async function guardarLideresDeReporte(reporteId, liderIds = []) {
  await bd.eliminarPor('reporte_lideres', { reporte_id: reporteId });
  for (const liderId of liderIds) {
    await bd.insertar('reporte_lideres', { reporte_id: reporteId, lider_id: Number(liderId) });
  }
}

export async function crearReporte(datos) {
  const codigo = validarCodigo(datos.codigo);
  if (!datos.periodoId) throw new Error('Debe seleccionar un período.');
  if (!datos.sectorId) throw new Error('Debe seleccionar un sector.');
  if (!codigo) throw new Error('El código de la célula es obligatorio.');

  const ahora = fechaLocalAhora();
  const id = await bd.insertar('reportes', {
    periodo_id: Number(datos.periodoId),
    sector_id: Number(datos.sectorId),
    codigo,
    lideres: limpiarTexto(datos.lideres, 160),
    personas: aEnteroPositivo(datos.personas),
    asistencias: aEnteroPositivo(datos.asistencias),
    inasistencias: aEnteroPositivo(datos.inasistencias),
    invitados: aEnteroPositivo(datos.invitados),
    ninos: aEnteroPositivo(datos.ninos),
    observaciones: limpiarTexto(datos.observaciones, 200),
    creado_en: ahora,
    actualizado_en: ahora
  });
  await guardarLideresDeReporte(id, datos.liderIds);
  return id;
}

export async function actualizarReporte(id, datos) {
  const codigo = validarCodigo(datos.codigo);
  if (!datos.sectorId) throw new Error('Debe seleccionar un sector.');
  if (!codigo) throw new Error('El código de la célula es obligatorio.');

  await bd.actualizar('reportes', id, {
    sector_id: Number(datos.sectorId),
    codigo,
    lideres: limpiarTexto(datos.lideres, 160),
    personas: aEnteroPositivo(datos.personas),
    asistencias: aEnteroPositivo(datos.asistencias),
    inasistencias: aEnteroPositivo(datos.inasistencias),
    invitados: aEnteroPositivo(datos.invitados),
    ninos: aEnteroPositivo(datos.ninos),
    observaciones: limpiarTexto(datos.observaciones, 200),
    actualizado_en: fechaLocalAhora()
  });
  await guardarLideresDeReporte(id, datos.liderIds);
}

export async function eliminarReporte(id) {
  await bd.eliminarPor('reporte_lideres', { reporte_id: id });
  await bd.eliminar('reportes', id);
}

/** Cuenta reportes por período: { periodoId: cantidad }. */
export async function contarReportesPorPeriodo() {
  const reportes = await bd.listar('reportes');
  const mapa = {};
  for (const r of reportes) mapa[r.periodo_id] = (mapa[r.periodo_id] || 0) + 1;
  return mapa;
}

/** Cuenta reportes por sector: { sectorId: cantidad }. */
export async function contarReportesPorSector() {
  const reportes = await bd.listar('reportes');
  const mapa = {};
  for (const r of reportes) mapa[r.sector_id] = (mapa[r.sector_id] || 0) + 1;
  return mapa;
}

// ---------------------------------------------------------------------------
// ANÁLISIS
// ---------------------------------------------------------------------------

/** Análisis general: agrupa los reportes por sector en un período. */
export async function analisisGeneral(periodoId) {
  if (!periodoId) return { filas: [], totales: totalesVacios() };

  const [reportes, sectores] = await Promise.all([
    bd.listar('reportes', { periodo_id: periodoId }),
    bd.listar('sectores')
  ]);
  const mapaSectores = new Map(sectores.map((s) => [s.id, s]));

  const grupos = new Map();
  for (const r of reportes) {
    if (!grupos.has(r.sector_id)) {
      const sector = mapaSectores.get(r.sector_id);
      grupos.set(r.sector_id, {
        sector_id: r.sector_id,
        sector: sector?.nombre || '—',
        sector_codigo: sector?.codigo || '',
        lista: []
      });
    }
    grupos.get(r.sector_id).lista.push(r);
  }

  const filas = [...grupos.values()].map((g) => ({
    sector_id: g.sector_id,
    sector: g.sector,
    sector_codigo: g.sector_codigo,
    cantidad_reportes: g.lista.length,
    personas: sumar(g.lista, 'personas'),
    asistencias: sumar(g.lista, 'asistencias'),
    inasistencias: sumar(g.lista, 'inasistencias'),
    invitados: sumar(g.lista, 'invitados'),
    ninos: sumar(g.lista, 'ninos'),
    porcentaje: promedioPorcentaje(g.lista)
  }));

  const totales = {
    cantidad_reportes: reportes.length,
    personas: sumar(reportes, 'personas'),
    asistencias: sumar(reportes, 'asistencias'),
    inasistentes: sumar(reportes, 'inasistencias'),
    invitados: sumar(reportes, 'invitados'),
    ninos: sumar(reportes, 'ninos'),
    porcentaje: promedioPorcentaje(reportes)
  };

  return { filas, totales };
}

/** Análisis por período: totales de cada período (no se filtra por selección). */
export async function analisisPorPeriodo() {
  const [periodos, reportes] = await Promise.all([listarPeriodos(), bd.listar('reportes')]);

  const filas = periodos.map((p) => {
    const lista = reportes.filter((r) => r.periodo_id === p.id);
    return {
      periodo_id: p.id,
      periodo: p.nombre,
      fecha_inicio: p.fecha_inicio,
      fecha_fin: p.fecha_fin,
      cantidad_reportes: lista.length,
      personas: sumar(lista, 'personas'),
      asistencias: sumar(lista, 'asistencias'),
      inasistencias: sumar(lista, 'inasistencias'),
      invitados: sumar(lista, 'invitados'),
      ninos: sumar(lista, 'ninos'),
      porcentaje: promedioPorcentaje(lista)
    };
  });

  const totales = {
    cantidad_reportes: reportes.length,
    personas: sumar(reportes, 'personas'),
    asistencias: sumar(reportes, 'asistencias'),
    inasistentes: sumar(reportes, 'inasistencias'),
    invitados: sumar(reportes, 'invitados'),
    ninos: sumar(reportes, 'ninos'),
    porcentaje: promedioPorcentaje(reportes)
  };

  return { filas, totales };
}

// ---------------------------------------------------------------------------
// RESPALDO (Ajustes)
// ---------------------------------------------------------------------------

/** Exporta toda la base a un objeto JSON (para respaldo). */
export async function exportarRespaldo() {
  const [sectores, periodos, lideres, reportes, reporte_lideres] = await Promise.all([
    bd.listar('sectores'),
    bd.listar('periodos'),
    bd.listar('lideres'),
    bd.listar('reportes'),
    bd.listar('reporte_lideres')
  ]);
  return { version: 1, exportado_en: fechaLocalAhora(), sectores, periodos, lideres, reportes, reporte_lideres };
}

/** Vacía por completo la base de datos local. */
export async function vaciarTodo() {
  await bd.eliminarPor('reporte_lideres', {});
  await bd.eliminarPor('reportes', {});
  await bd.eliminarPor('lideres', {});
  await bd.eliminarPor('sectores', {});
  await bd.eliminarPor('periodos', {});
}

/** Importa un respaldo JSON (reemplazando los datos actuales). */
export async function importarRespaldo(datos) {
  if (!datos || typeof datos !== 'object') throw new Error('El archivo de respaldo no es válido.');
  await vaciarTodo();
  for (const s of datos.sectores || []) await bd.insertar('sectores', s);
  for (const p of datos.periodos || []) await bd.insertar('periodos', p);
  for (const l of datos.lideres || []) await bd.insertar('lideres', l);
  for (const r of datos.reportes || []) await bd.insertar('reportes', r);
  for (const rl of datos.reporte_lideres || []) await bd.insertar('reporte_lideres', rl);
}
