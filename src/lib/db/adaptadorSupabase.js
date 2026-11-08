import { obtenerClienteSupabase } from './clienteSupabase.js';

const COLUMNAS_VALIDAS = {
  sectores: ['id', 'nombre', 'codigo', 'descripcion', 'creado_en'],
  periodos: ['id', 'nombre', 'fecha_inicio', 'fecha_fin', 'creado_en'],
  reportes: ['id', 'periodo_id', 'sector_id', 'personas', 'asistencias', 'inasistencias', 'invitados', 'ninos', 'activo', 'observaciones', 'creado_en', 'actualizado_en'],
  lideres: ['id', 'nombre', 'telefono', 'creado_en'],
  reporte_lideres: ['reporte_id', 'lider_id']
};

const TABLAS_SIN_ID = ['reporte_lideres'];

function validarTabla(tabla) {
  if (!Object.prototype.hasOwnProperty.call(COLUMNAS_VALIDAS, tabla)) {
    throw new Error(`Tabla desconocida: ${tabla}`);
  }
  return tabla;
}

function validarColumnas(tabla, datos) {
  validarTabla(tabla);
  const permitidas = COLUMNAS_VALIDAS[tabla];
  for (const campo of Object.keys(datos)) {
    if (!permitidas.includes(campo)) {
      throw new Error(`Columna no valida "${campo}" en la tabla ${tabla}`);
    }
  }
}

function construirFiltro(cliente, tabla, criterio) {
  let query = cliente.from(tabla).select('*');
  if (criterio) {
    for (const [campo, valor] of Object.entries(criterio)) {
      if (!COLUMNAS_VALIDAS[tabla].includes(campo)) {
        throw new Error(`Columna desconocida: ${campo}`);
      }
      query = query.eq(campo, valor);
    }
  }
  return query;
}

export function crearAdaptadorSupabase() {
  const cliente = obtenerClienteSupabase();
  if (!cliente) {
    throw new Error('No se pudo inicializar el cliente de Supabase');
  }

  async function iniciar() {}

  async function listar(tabla, criterio = null) {
    const query = construirFiltro(cliente, tabla, criterio);
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  async function obtener(tabla, id) {
    const query = construirFiltro(cliente, tabla, { id });
    const { data, error } = await query.maybeSingle();
    if (error) throw error;
    return data;
  }

  async function insertar(tabla, datos) {
    validarTabla(tabla);
    validarColumnas(tabla, datos);
    const { error } = await cliente.from(tabla).insert(datos);
    if (error) throw error;
  }

  async function actualizar(tabla, id, datos) {
    validarTabla(tabla);
    validarColumnas(tabla, datos);
    const { error } = await cliente.from(tabla).update(datos).eq('id', id);
    if (error) throw error;
  }

  async function eliminar(tabla, id) {
    validarTabla(tabla);
    const { error } = await cliente.from(tabla).delete().eq('id', id);
    if (error) throw error;
  }

  async function eliminarPor(tabla, criterio) {
    validarTabla(tabla);
    let query = cliente.from(tabla).delete();
    if (criterio) {
      for (const [campo, valor] of Object.entries(criterio)) {
        if (!COLUMNAS_VALIDAS[tabla].includes(campo)) {
          throw new Error(`Columna desconocida: ${campo}`);
        }
        query = query.eq(campo, valor);
      }
    }
    const { error } = await query;
    if (error) throw error;
  }

  return { iniciar, listar, obtener, insertar, actualizar, eliminar, eliminarPor };
}
