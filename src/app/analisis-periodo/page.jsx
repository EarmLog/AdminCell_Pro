'use client';

/**
 * ============================================================================
 *  ANÁLISIS POR PERÍODO
 * ----------------------------------------------------------------------------
 *  Muestra los totales de TODOS los períodos (no se filtra por el período
 *  activo). Sirve para comparar la evolución entre períodos.
 * ============================================================================
 */
import { useEffect, useState } from 'react';
import { analisisPorPeriodo } from '@/lib/repositorio';
import EncabezadoPagina from '@/components/ui/EncabezadoPagina';
import Cargando from '@/components/ui/Cargando';
import Boton from '@/components/ui/Boton';
import EstadoVacio from '@/components/ui/EstadoVacio';
import SemaforoPorcentaje from '@/components/SemaforoPorcentaje';
import SeccionGraficas from '@/components/SeccionGraficas';
import { formatearFecha } from '@/lib/formato';
import { IconoImprimir, IconoAnalisis } from '@/components/Iconos';

export default function PaginaAnalisisPorPeriodo() {
  const [resultado, setResultado] = useState({ filas: [], totales: null });
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    analisisPorPeriodo()
      .then(setResultado)
      .finally(() => setCargando(false));
  }, []);

  if (cargando) return <Cargando />;

  const { filas, totales } = resultado;
  const datosGrafica = filas.map((f) => ({
    etiqueta: f.periodo,
    personas: f.personas,
    asistencias: f.asistencias,
    porcentaje: f.porcentaje
  }));

  return (
    <div className="flex flex-col gap-4">
      <EncabezadoPagina
        titulo="Análisis por Período"
        descripcion="Comparación de todos los períodos registrados."
        acciones={
          <Boton variante="secundario" onClick={() => window.print()}>
            <IconoImprimir size={18} /> Imprimir
          </Boton>
        }
      />

      {!totales || filas.length === 0 ? (
        <EstadoVacio
          titulo="No hay datos"
          descripcion="Registre reportes en al menos un período para ver la comparación."
          icono={<IconoAnalisis size={30} />}
        />
      ) : (
        <>
          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
            <table className="min-w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500 dark:border-slate-700 dark:text-slate-400">
                  <th className="px-3 py-2 font-medium">Período</th>
                  <th className="px-3 py-2 text-right font-medium">Reportes</th>
                  <th className="px-3 py-2 text-right font-medium">Personas</th>
                  <th className="px-3 py-2 text-right font-medium">Asist.</th>
                  <th className="px-3 py-2 text-right font-medium">Inasist.</th>
                  <th className="px-3 py-2 text-right font-medium">Invit.</th>
                  <th className="px-3 py-2 text-right font-medium">Niños</th>
                  <th className="px-3 py-2 font-medium">Asistencia</th>
                </tr>
              </thead>
              <tbody>
                {filas.map((f) => (
                  <tr key={f.periodo_id} className="border-b border-slate-100 last:border-0 dark:border-slate-800">
                    <td className="px-3 py-2 text-slate-700 dark:text-slate-200">
                      {f.periodo}
                      <span className="ml-1 text-xs text-slate-400">
                        ({formatearFecha(f.fecha_inicio)} — {formatearFecha(f.fecha_fin)})
                      </span>
                    </td>
                    <td className="px-3 py-2 text-right">{f.cantidad_reportes}</td>
                    <td className="px-3 py-2 text-right">{f.personas}</td>
                    <td className="px-3 py-2 text-right">{f.asistencias}</td>
                    <td className="px-3 py-2 text-right">{f.inasistencias}</td>
                    <td className="px-3 py-2 text-right">{f.invitados}</td>
                    <td className="px-3 py-2 text-right">{f.ninos}</td>
                    <td className="px-3 py-2">
                      <SemaforoPorcentaje valor={f.porcentaje} />
                    </td>
                  </tr>
                ))}
                <tr className="border-t-2 border-slate-300 font-semibold dark:border-slate-600">
                  <td className="px-3 py-2 text-slate-800 dark:text-slate-100">Total</td>
                  <td className="px-3 py-2 text-right">{totales.cantidad_reportes}</td>
                  <td className="px-3 py-2 text-right">{totales.personas}</td>
                  <td className="px-3 py-2 text-right">{totales.asistencias}</td>
                  <td className="px-3 py-2 text-right">{totales.inasistencias}</td>
                  <td className="px-3 py-2 text-right">{totales.invitados}</td>
                  <td className="px-3 py-2 text-right">{totales.ninos}</td>
                  <td className="px-3 py-2">
                    <SemaforoPorcentaje valor={totales.porcentaje} />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
            <SeccionGraficas
              datos={datosGrafica}
              etiquetaBarras="Personas vs. Asistencias por período"
              etiquetaPorcentajes="% de asistencia por período"
            />
          </div>
        </>
      )}
    </div>
  );
}
