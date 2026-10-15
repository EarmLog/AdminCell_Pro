'use client';

/**
 * ============================================================================
 *  TABLA DE REPORTES
 * ----------------------------------------------------------------------------
 *  Muestra los reportes agrupados por sector con totales por sector y global.
 *  Cada fila permite editar, inhabilitar (no cuenta en análisis) y eliminar.
 * ============================================================================
 */
import { Fragment } from 'react';
import SemaforoPorcentaje from '@/components/SemaforoPorcentaje';
import { IconoEditar, IconoEliminar, IconoPause, IconoPlay } from '@/components/Iconos';

function porcentajeDe(f) {
  const p = Number(f.personas) || 0;
  if (p <= 0) return 0;
  return Math.min((Number(f.asistencias) || 0) / p, 1);
}

function esActivo(f) {
  return !(f.activo === 0 || f.activo === false);
}

export default function TablaReportes({ filas = [], onEditar, onEliminar, onToggleEstado, ocultarSector = false }) {
  const mostrarAcciones = Boolean(onEditar || onEliminar || onToggleEstado);

  const grupos = new Map();
  for (const f of filas) {
    const key = f.sector_id ?? f.sector ?? 'sin';
    if (!grupos.has(key)) {
      grupos.set(key, {
        sector: f.sector,
        sector_codigo: f.sector_codigo,
        items: [],
        t: { personas: 0, asistencias: 0, inasistencias: 0, invitados: 0, ninos: 0 }
      });
    }
    const g = grupos.get(key);
    g.items.push(f);
    if (esActivo(f)) {
      g.t.personas += Number(f.personas) || 0;
      g.t.asistencias += Number(f.asistencias) || 0;
      g.t.inasistencias += Number(f.inasistencias) || 0;
      g.t.invitados += Number(f.invitados) || 0;
      g.t.ninos += Number(f.ninos) || 0;
    }
  }

  const gt = { personas: 0, asistencias: 0, inasistencias: 0, invitados: 0, ninos: 0 };
  for (const g of grupos.values()) {
    gt.personas += g.t.personas;
    gt.asistencias += g.t.asistencias;
    gt.inasistencias += g.t.inasistencias;
    gt.invitados += g.t.invitados;
    gt.ninos += g.t.ninos;
  }

  const gruposArr = [...grupos.values()];
  const totalColumnas = (ocultarSector ? 0 : 1) + 8 + (mostrarAcciones ? 1 : 0);

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500 dark:border-slate-700 dark:text-slate-400">
            {!ocultarSector && <th className="px-2 py-2 font-medium">Sector</th>}
            <th className="px-2 py-2 font-medium">Código</th>
            <th className="px-2 py-2 font-medium">Líder(es)</th>
            <th className="px-2 py-2 text-right font-medium">Asignados</th>
            <th className="px-2 py-2 text-right font-medium">Asist.</th>
            <th className="px-2 py-2 text-right font-medium">Inasist.</th>
            <th className="px-2 py-2 text-right font-medium">Invit.</th>
            <th className="px-2 py-2 text-right font-medium">Niños</th>
            <th className="px-2 py-2 font-medium">% Asist.</th>
            {mostrarAcciones && <th className="px-2 py-2 text-right font-medium no-imprimir">Acciones</th>}
          </tr>
        </thead>
        <tbody>
          {gruposArr.length === 0 && (
            <tr>
              <td colSpan={totalColumnas} className="px-3 py-8 text-center text-sm text-slate-400">
                No hay reportes para mostrar.
              </td>
            </tr>
          )}

          {gruposArr.map((g, gi) => (
            <Fragment key={g.sector_codigo ? g.sector_codigo + gi : gi}>
              {g.items.map((fila, idx) => {
                const activo = esActivo(fila);
                return (
                  <tr
                    key={fila.id}
                    className={`border-b border-slate-100 last:border-0 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/50 ${
                      activo ? '' : 'opacity-50'
                    }`}
                  >
                    {!ocultarSector && idx === 0 && (
                      <td rowSpan={g.items.length} className="px-2 py-2 align-top font-medium">
                        {g.sector}
                        {g.sector_codigo && <span className="ml-1 text-xs text-slate-400">({g.sector_codigo})</span>}
                      </td>
                    )}
                    <td className="px-2 py-2 font-mono">{fila.codigo}</td>
                    <td className="px-2 py-2">{fila.lideres_nombres || '—'}</td>
                    <td className="px-2 py-2 text-right">{fila.personas}</td>
                    <td className="px-2 py-2 text-right">{fila.asistencias}</td>
                    <td className="px-2 py-2 text-right">{fila.inasistencias}</td>
                    <td className="px-2 py-2 text-right">{fila.invitados}</td>
                    <td className="px-2 py-2 text-right">{fila.ninos}</td>
                    <td className="px-2 py-2">
                      <SemaforoPorcentaje valor={porcentajeDe(fila)} />
                    </td>
                    {mostrarAcciones && (
                      <td className="px-2 py-2 no-imprimir">
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
                          {onToggleEstado && (
                            <button
                              type="button"
                              onClick={() => onToggleEstado(fila)}
                              className="rounded-lg p-1.5 text-slate-500 hover:bg-amber-50 hover:text-amber-600 dark:hover:bg-amber-950"
                              title={activo ? 'Inhabilitar (no cuenta en análisis)' : 'Habilitar'}
                            >
                              {activo ? <IconoPause size={17} /> : <IconoPlay size={17} />}
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
                );
              })}
              <tr className="border-t bg-slate-50 font-semibold dark:bg-slate-800/60">
                <td className="px-2 py-1.5" colSpan={(ocultarSector ? 0 : 1) + 3}>
                  TOTAL {!ocultarSector && g.sector ? g.sector : ''}
                </td>
                <td className="px-2 py-1.5 text-right">{g.t.personas}</td>
                <td className="px-2 py-1.5 text-right">{g.t.asistencias}</td>
                <td className="px-2 py-1.5 text-right">{g.t.inasistencias}</td>
                <td className="px-2 py-1.5 text-right">{g.t.invitados}</td>
                <td className="px-2 py-1.5 text-right">{g.t.ninos}</td>
                <td className="px-2 py-1.5">
                  <SemaforoPorcentaje valor={g.t.personas ? g.t.asistencias / g.t.personas : 0} />
                </td>
                {mostrarAcciones && <td className="no-imprimir" />}
              </tr>
            </Fragment>
          ))}

          {gruposArr.length > 0 && (
            <tr className="border-t-2 border-slate-300 bg-slate-100 font-bold dark:border-slate-600 dark:bg-slate-700/50">
              <td className="px-2 py-1.5" colSpan={(ocultarSector ? 0 : 1) + 3}>
                TOTAL GENERAL
              </td>
              <td className="px-2 py-1.5 text-right">{gt.personas}</td>
              <td className="px-2 py-1.5 text-right">{gt.asistencias}</td>
              <td className="px-2 py-1.5 text-right">{gt.inasistencias}</td>
              <td className="px-2 py-1.5 text-right">{gt.invitados}</td>
              <td className="px-2 py-1.5 text-right">{gt.ninos}</td>
              <td className="px-2 py-1.5">
                <SemaforoPorcentaje valor={gt.personas ? gt.asistencias / gt.personas : 0} />
              </td>
              {mostrarAcciones && <td className="no-imprimir" />}
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
