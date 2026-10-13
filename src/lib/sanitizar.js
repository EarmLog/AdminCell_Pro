/**
 * ============================================================================
 *  UTILIDADES DE SANITIZACIÓN Y VALIDACIÓN DE ENTRADAS
 * ----------------------------------------------------------------------------
 *  Toda la información que escribe el usuario pasa por aquí antes de guardarse
 *  o mostrarse. Aunque React ya escapa el HTML al renderizar, normalizamos y
 *  recortamos los textos para evitar datos inesperados (y posibles XSS).
 * ============================================================================
 */

/** Limpia un texto: quita caracteres de control, recorta espacios y limita longitud. */
export function limpiarTexto(valor, maximaLongitud = 200) {
  if (valor === null || valor === undefined) return '';
  return String(valor)
    .replace(/[\u0000-\u001F\u007F]/g, '')
    .trim()
    .slice(0, maximaLongitud);
}

/** Escapa caracteres HTML peligrosos (por si el texto se usa fuera de React). */
export function escaparHTML(valor) {
  return String(valor ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Convierte a entero no negativo (0 si el valor no es válido). */
export function aEnteroPositivo(valor, maximo = 100000) {
  const numero = parseInt(valor, 10);
  if (Number.isNaN(numero) || numero < 0) return 0;
  return Math.min(numero, maximo);
}

/** Normaliza un código de célula (letras, números y guiones). */
export function validarCodigo(valor) {
  return limpiarTexto(valor, 20).replace(/[^A-Za-z0-9-]/g, '');
}

/** Normaliza el prefijo de un sector (mayúsculas, sin espacios ni símbolos). */
export function validarPrefijo(valor) {
  return limpiarTexto(valor, 12)
    .toUpperCase()
    .replace(/[^A-Z0-9-]/g, '');
}

/** Verifica si una cadena es una fecha ISO válida (YYYY-MM-DD). */
export function esFechaValida(valor) {
  if (!valor) return false;
  return /^\d{4}-\d{2}-\d{2}$/.test(String(valor));
}
