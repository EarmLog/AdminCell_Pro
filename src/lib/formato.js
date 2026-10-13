/**
 * ============================================================================
 *  UTILIDADES DE FORMATO Y PRESENTACIÓN
 * ============================================================================
 */

/** Convierte una proporción (0-1) en texto de porcentaje. */
export function formatearPorcentaje(valor) {
  const numero = Number(valor) || 0;
  return `${(numero * 100).toFixed(1)}%`;
}

/** Formatea una fecha ISO (YYYY-MM-DD) al formato local DD/MM/YYYY. */
export function formatearFecha(iso) {
  if (!iso) return '—';
  const partes = String(iso).split('-');
  if (partes.length !== 3) return iso;
  return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

/** Devuelve las iniciales de un nombre para usar como avatar. */
export function iniciales(texto = '') {
  return String(texto)
    .split(/[\s/]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() || '')
    .join('');
}

/** Copia un texto al portapapeles (con respaldo para navegadores antiguos). */
export async function copiarAlPortapapeles(texto) {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(texto);
      return true;
    }
  } catch {
    // Se intenta con el método clásico más abajo.
  }
  try {
    const area = document.createElement('textarea');
    area.value = texto;
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.appendChild(area);
    area.select();
    const exito = document.execCommand('copy');
    document.body.removeChild(area);
    return exito;
  } catch {
    return false;
  }
}

/** Une filas en formato TSV (para pegar en hojas de cálculo). */
export function tablaATexto(encabezados, filas) {
  return [encabezados.join('\t'), ...filas.map((f) => f.join('\t'))].join('\n');
}

/** Dispara la descarga de un archivo generado en memoria. */
export function descargarArchivo(nombre, contenido, tipo = 'application/json') {
  const blob = new Blob([contenido], { type: tipo });
  const url = URL.createObjectURL(blob);
  const enlace = document.createElement('a');
  enlace.href = url;
  enlace.download = nombre;
  document.body.appendChild(enlace);
  enlace.click();
  document.body.removeChild(enlace);
  URL.revokeObjectURL(url);
}
