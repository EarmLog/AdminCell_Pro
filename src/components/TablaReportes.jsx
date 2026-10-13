'use client';

/**
 * ============================================================================
 *  TABLA DE REPORTES
 * ----------------------------------------------------------------------------
 *  Muestra los reportes con sus datos. Reutilizada por la vista de reportes y
 *  por los módulos de análisis. Si recibe `onEditar`/`onEliminar` muestra la
 *  columna de acciones.
 * ============================================================================
 */
import SemaforoPorcentaje from '@/components/SemaforoPorcentaje';
import { IconoEditar, IconoEliminar } from '@/components/Iconos';

function porcentajeDe(fila) {
  const personas = Number(fila.personas) || 0;
  if (personas <= 0) return 0;
  return Math.min((Number(fila.asistencias) || 0) / personas, 1);
}

export default function TablaReportes({ filas = [], onEditar, onEliminar, ocultarSector = false }) {
  const mostrarAcciones = Boolean(onEditar || onEliminar);
  const columnas = 6 + (ocultarSector ? 0 : 1) + (mostrarAcciones ? 1 : 0);

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500 dark:border-slate-700 dark:text-slate-400">
            {!ocultarSector && <th className="px-3 py-2 font-medium">Sector</th>}
            <th className="px-3 py-2 font-medium">Código</th>
            <th className="px-3 py-2 font-medium">Líderes</th>
            <th className="px-3 py-2 text-right font-medium">Personas</th>
            <th className="px-3 py-2 text-right font-medium">Asist.</th>
            <th className="px-3 py-2 text-right font-medium">Inasist.</th>
            <th className="px-3 py-2 font-medium">Asistencia</th>
            {mostrarAcciones && <th className="px-3 py-2 text-right font-medium no-imprimir">Acciones</th>}
          </tr>
        </thead>
        <tbody>
          {filas.map((fila) => (
            <tr
              key={fila.id}
              className="border-b border-slate-100 last:border-0 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/50"
            >
              {!ocultarSector && (
                <td className="px-3 py-2 text-slate-700 dark:text-slate-200">
                  {fila.sector}
                  {fila.sector_codigo && (
                    <span className="ml-1 text-xs text-slate-400">({fila.sector_codigo})</span>
                  )}
                </td>
              )}
              <td className="px-3 py-2 font-mono text-slate-700 dark:text-slate-200">{fila.codigo}</td>
              <td className="px-3 py-2 text-slate-600 dark:text-slate-300">{fila.lideres_nombres || '—'}</td>
              <td className="px-3 py-2 text-right text-slate-700 dark:text-slate-200">{fila.personas}</td>
              <td className="px-3 py-2 text-right text-slate-700 dark:text-slate-200">{fila.asistencias}</td>
              <td className="px-3 py-2 text-right text-slate-700 dark:text-slate-200">{fila.inasistencias}</td>
              <td className="px-3 py-2">
                <SemaforoPorcentaje valor={porcentajeDe(fila)} />
              </td>
              {mostrarAcciones && (
                <td className="px-3 py-2 no-imprimir">
                  <div className="flex justify-end gap-1">
                    {onEditar && (
                      <button
                        type="button"
                        onClick={() => onEditar(fila)}
                        className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-marca-600 dark:hover:bg-slate-700"
                        title="Editar"
                      >
                        <IconoEditar size={17} />
                      </button>
                    )}
                    {onEliminar && (
                      <button
                        type="button"
                        onClick={() => onEliminar(fila)}
                        className="rounded-lg p-1.5 text-slate-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950"
                        title="Eliminar"
                      >
                        <IconoEliminar size={17} />
                      </button>
                    )}
                  </div>
                </td>
              )}
            </tr>
          ))}
          {filas.length === 0 && (
            <tr>
              <td colSpan={columnas} className="px-3 py-8 text-center text-sm text-slate-400">
                No hay reportes para mostrar.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
