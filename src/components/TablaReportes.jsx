'use client';

/**
 * ============================================================================
 *  TABLA DE REPORTES
 * ----------------------------------------------------------------------------
 *  Muestra los reportes agrupados por sector con totales por sector y global.
 * ============================================================================
 */
import SemaforoPorcentaje from '@/components/SemaforoPorcentaje';
import { IconoEditar, IconoEliminar, IconoPause } from '@/components/Iconos';

function porcentajeDe(f) {
  const p = Number(f.personas) || 0;
  if (p <= 0) return 0;
  return Math.min((Number(f.asistencias) || 0) / p, 1);
}

function sumar(a, b) {
  return (Number(a) || 0) + (Number(b) || 0);
}

export default function TablaReportes({ filas = [], onEditar, onEliminar, onToggleEstado }) {
  const mostrarAcciones = Boolean(onEditar || onEliminar || onToggleEstado);
  // agrupar
  const grupos = {};
  filas.forEach((f) => {
    const key = f.sector_id || f.sector || 'sin';
    if (!grupos[key]) {
      grupos[key] = { sector: f.sector, sector_codigo: f.sector_codigo, items: [], t: { personas: 0, asistencias: 0, inasistencias: 0, invitados: 0, ninos: 0 } };
    }
    grupos[key].items.push(f);
    const t = grupos[key].t;
    t.personas += sumar(f.personas, 0);
    t.asistencias += sumar(f.asistencias, 0);
    t.inasistencias += sumar(f.inasistencias, 0);
    t.invitados += sumar(f.invitados, 0);
    t.ninos += sumar(f.ninos, 0);
  });
  const gt = { personas: 0, asistencias: 0, inasistencias: 0, invitados: 0, ninos: 0 };
  Object.values(grupos).forEach((g) => { gt.personas += g.t.personas; gt.asistencias += g.t.asistencias; gt.inasistencias += g.t.inasistencias; gt.invitados += g.t.invitados; gt.ninos += g.t.ninos; });
  const gruposArr = Object.entries(grupos).map(([id, g]) => ({ id, ...g }));

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500 dark:border-slate-700 dark:text-slate-400">
            <th className="px-2 py-2 font-medium">Sector</th>
            <th className="px-2 py-2 font-medium">Código</th>
            <th className="px-2 py-2 font-medium">Líder(es)</th>
            <th className="px-2 py-2 text-right font-medium">Asignados</th>
            <th className="px-2 py-2 text-right font-medium">Asist.</th>
            <th className="px-2 py-2 text-right font-medium">Inasist.</th>
            <th className="px-2 py-2 text-right font-medium">Invitados</th>
            <th className="px-2 py-2 text-right font-medium">Niños</th>
            <th className="px-2 py-2 font-medium">% Asist.</th>
            {mostrarAcciones && <th className="px-2 py-2 text-right font-medium no-imprimir">Acciones</th>}
          </tr>
        </thead>
        <tbody>
          {gruposArr.length === 0 && (
            <tr>
              <td colSpan={9 + (mostrarAcciones ? 1 : 0)} className="px-3 py-8 text-center text-sm text-slate-400">No hay reportes para mostrar.</td>
            </tr>
          )}
          {gruposArr.map((g) => (
            <>
              {g.items.map((fila, idx) => (
                <tr key={fila.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/50">
                  {idx === 0 && <td rowSpan={g.items.length} className="px-2 py-2 align-top font-medium">{g.sector}{g.sector_codigo && <span className="ml-1 text-xs text-slate-400">({g.sector_codigo})</span>}</td>}
                  <td className="px-2 py-2 font-mono">{fila.codigo}</td>
                  <td className="px-2 py-2">{fila.lideres_nombres || '—'}</td>
                  <td className="px-2 py-2 text-right">{fila.personas}</td>
                  <td className="px-2 py-2 text-right">{fila.asistencias}</td>
                  <td className="px-2 py-2 text-right">{fila.inasistencias}</td>
                  <td className="px-2 py-2 text-right">{fila.invitados}</td>
                  <td className="px-2 py-2 text-right">{fila.ninos}</td>
                  <td className="px-2 py-2"><SemaforoPorcentaje valor={porcentajeDe(fila)} /></td>
                  {mostrarAcciones && (
                    <td className="px-2 py-2 no-imprimir">
                      <div className="flex justify-end gap-1">
                        {onEditar && <button type="button" onClick={() => onEditar(fila)} className="rounded p-1.5 hover:bg-slate-100" title="Editar"><IconoEditar size={16} /></button>}
                        {onToggleEstado && <button type="button" onClick={() => onToggleEstado(fila)} className="rounded p-1.5 hover:bg-slate-100" title="Inhabilitar/Mostrar"><IconoPause size={16} /></button>}
                        {onEliminar && <button type="button" onClick={() => onEliminar(fila)} className="rounded p-1.5 hover:bg-red-50" title="Eliminar"><IconoEliminar size={16} /></button>}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
              <tr className="bg-slate-50 font-semibold dark:bg-slate-800/60">
                <td className="px-2 py-1" colSpan={3}>TOTAL SECTOR ({g.sector})</td>
                <td className="px-2 py-1 text-right">{g.t.personas}</td>
                <td className="px-2 py-1 text-right">{g.t.asistencias}</td>
                <td className="px-2 py-1 text-right">{g.t.inasistencias}</td>
                <td className="px-2 py-1 text-right">{g.t.invitados}</td>
                <td className="px-2 py-1 text-right">{g.t.ninos}</td>
                <td className="px-2 py-1"><SemaforoPorcentaje valor={g.t.personas ? g.t.asistencias/g.t.personas : 0} /></td>
                {mostrarAcciones && <td />}
              </tr>
            </>
          ))}
          {gruposArr.length > 0 && (
            <tr className="border-t-2 bg-slate-100 font-bold dark:bg-slate-700/40">
              <td className="px-2 py-1" colSpan={3}>TOTAL GENERAL</td>
              <td className="px-2 py-1 text-right">{gt.personas}</td>
              <td className="px-2 py-1 text-right">{gt.asistencias}</td>
              <td className="px-2 py-1 text-right">{gt.inasistencias}</td>
              <td className="px-2 py-1 text-right">{gt.invitados}</td>
              <td className="px-2 py-1 text-right">{gt.ninos}</td>
              <td className="px-2 py-1"><SemaforoPorcentaje valor={gt.personas ? gt.asistencias/gt.personas : 0} /></td>
              {mostrarAcciones && <td />}
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
