/**
 * ============================================================================
 *  DETECCIÓN DE PLATAFORMA
 * ----------------------------------------------------------------------------
 *  Permite saber si la app corre en Web, en Escritorio (Tauri) o en Android
 *  (Capacitor) para elegir el adaptador de base de datos correcto.
 * ============================================================================
 */

/** Devuelve 'tauri', 'capacitor' o 'web' según el entorno de ejecución. */
export function detectarPlataforma() {
  // En el render del servidor (SSG) todavía no hay ventana.
  if (typeof window === 'undefined') return 'servidor';

  // Tauri 2 expone estos objetos globales cuando corre como app de escritorio.
  if (window.__TAURI_INTERNALS__ || window.__TAURI__) return 'tauri';

  // Capacitor marca la plataforma nativa (android/ios) frente a 'web'.
  const cap = window.Capacitor;
  if (cap && typeof cap.isNativePlatform === 'function' && cap.isNativePlatform()) {
    return 'capacitor';
  }
  if (cap && cap.platform && cap.platform !== 'web') return 'capacitor';

  return 'web';
}

/** Etiqueta legible de la plataforma, para mostrar en la interfaz. */
export function etiquetaPlataforma() {
  const plataforma = detectarPlataforma();
  if (plataforma === 'tauri') return 'Escritorio (Tauri)';
  if (plataforma === 'capacitor') return 'Android (Capacitor)';
  if (plataforma === 'web') return 'Web';
  return 'Servidor';
}
