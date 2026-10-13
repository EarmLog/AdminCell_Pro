'use client';

/**
 * ============================================================================
 *  ANÁLISIS GENERAL
 * ----------------------------------------------------------------------------
 *  Totales y gráficas del período activo, agrupados por sector.
 * ============================================================================
 */
import { useEffect, useState } from 'react';
import { usarDatos } from '@/context/DatosContext';
import { analisisGeneral } from '@/lib/repositorio';
import EncabezadoPagina from '@/components/ui/EncabezadoPagina';
import Cargando from '@/components/ui/Cargando';
import Boton from '@/components/ui/Boton';
import EstadoVacio from '@/components/ui/EstadoVacio';
import SemaforoPorcentaje from '@/components/SemaforoPorcentaje';
import SeccionGraficas from '@/components/SeccionGraficas';
import AvisoSinPeriodo from '@/components/AvisoSinPeriodo';
import { IconoImprimir, IconoAnalisis } from '@/components/Iconos';

function TarjetaTotal({ etiqueta, valor }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800 evitar-corte">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{etiqueta}</p>
      <p className="mt-1 text-2xl font-bold text-slate-800 dark:text-slate-100">{valor}</p>
    </div>
  );
}

export default function PaginaAnalisisGeneral() {
  const { periodos, periodoActivo, periodoSeleccionado, cargando } = usarDatos();
  const [resultado, setResultado] = useState({ filas: [], totales: null });

  useEffect(() => {
    let vigente = true;
    if (!periodoActivo) {
      setResultado({ filas: [], totales: null });
      return;
    }
    analisisGeneral(periodoActivo).then((datos) => {
      if (vigente) setResultado(datos);
    });
    return () => {
      vigente = false;
    };
  }, [periodoActivo]);

  if (cargando) return <Cargando />;
  if (periodos.length === 0) return <AvisoSinPeriodo />;

  const { filas, totales } = resultado;
  const datosGrafica = filas.map((f) => ({
    etiqueta: f.sector_codigo || f.sector,
    personas: f.personas,
    asistencias: f.asistencias,
    porcentaje: f.porcentaje
  }));

  return (
    <div className="flex flex-col gap-5">
      <EncabezadoPagina
        titulo="Análisis General"
        descripcion={periodoSeleccionado ? `Período: ${periodoSeleccionado.nombre}` : ''}
        acciones={
          <Boton variante="secundario" onClick={() => window.print()}>
            <IconoImprimir size={18} /> Imprimir
          </Boton>
        }
      />

      <div className="hidden print:block">
        <h2 className="text-lg font-bold">Análisis general</h2>
        <p className="text-sm">Período: {periodoSeleccionado?.nombre}</p>
      </div>

      {!totales || totales.cantidad_reportes === 0 ? (
        <EstadoVacio
          titulo="Sin datos en este período"
          descripcion="Registre reportes para ver los análisis."
          icono={<IconoAnalisis size={30} />}
        />
      ) : (
        <>
          <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
            <TarjetaTotal etiqueta="Reportes" valor={totales.cantidad_reportes} />
            <TarjetaTotal etiqueta="Personas" valor={totales.personas} />
            <TarjetaTotal etiqueta="Asistencias" valor={totales.asistencias} />
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800 evitar-corte">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Asistencia</p>
              <div className="mt-1">
                <SemaforoPorcentaje valor={totales.porcentaje} />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
            <h2 className="mb-3 text-base font-semibold text-slate-700 dark:text-slate-200">Detalle por sector</h2>
            <table className="min-w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500 dark:border-slate-700 dark:text-slate-400">
                  <th className="px-3 py-2 font-medium">Sector</th>
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
                  <tr key={f.sector_id} className="border-b border-slate-100 last:border-0 dark:border-slate-800">
                    <td className="px-3 py-2 text-slate-700 dark:text-slate-200">
                      {f.sector} <span className="text-xs text-slate-400">({f.sector_codigo})</span>
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
              </tbody>
            </table>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
            <SeccionGraficas
              datos={datosGrafica}
              etiquetaBarras="Personas vs. Asistencias por sector"
              etiquetaPorcentajes="% de asistencia por sector"
            />
          </div>
        </>
      )}
    </div>
  );
}
