/**
 * ============================================================================
 *  BOTÓN
 * ----------------------------------------------------------------------------
 *  Variantes visuales: primario, secundario, fantasma (ghost) y peligro.
 * ============================================================================
 */

const VARIANTES = {
  primario: 'bg-marca-600 text-white hover:bg-marca-700 focus:ring-marca-500',
  secundario:
    'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-100 dark:border-slate-600 dark:hover:bg-slate-700 focus:ring-marca-500',
  fantasma:
    'bg-transparent text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700 focus:ring-marca-500',
  peligro: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500'
};

const TAMANOS = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-5 py-2.5 text-base'
};

export default function Boton({
  children,
  variante = 'primario',
  tamano = 'md',
  tipo = 'button',
  className = '',
  ...resto
}) {
  return (
    <button
      type={tipo}
      className={`inline-flex items-center justify-center gap-2 rounded-lg font-medium transition
        focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50
        dark:focus:ring-offset-slate-900 ${VARIANTES[variante] || VARIANTES.primario} ${TAMANOS[tamano] || TAMANOS.md} ${className}`}
      {...resto}
    >
      {children}
    </button>
  );
}
