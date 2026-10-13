/**
 * ============================================================================
 *  ESTADO VACÍO
 * ----------------------------------------------------------------------------
 *  Mensaje amigable cuando una lista o módulo no tiene datos todavía.
 * ============================================================================
 */

export default function EstadoVacio({ titulo, descripcion, accion, icono }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-slate-300 px-6 py-12 text-center dark:border-slate-600">
      {icono && <div className="text-slate-400 dark:text-slate-500">{icono}</div>}
      <h3 className="text-base font-semibold text-slate-700 dark:text-slate-200">{titulo}</h3>
      {descripcion && <p className="max-w-md text-sm text-slate-500 dark:text-slate-400">{descripcion}</p>}
      {accion && <div className="mt-1">{accion}</div>}
    </div>
  );
}
