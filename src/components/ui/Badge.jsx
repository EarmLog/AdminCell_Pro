/**
 * ============================================================================
 *  ETIQUETA (Badge)
 * ----------------------------------------------------------------------------
 *  Pequeña píldora de color para estados y categorías.
 * ============================================================================
 */

const COLORES = {
  neutro: 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200',
  marca: 'bg-marca-100 text-marca-800 dark:bg-marca-900 dark:text-marca-200',
  exito: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
  alerta: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
  peligro: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
};

export default function Badge({ children, color = 'neutro', className = '' }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${COLORES[color] || COLORES.neutro} ${className}`}
    >
      {children}
    </span>
  );
}
