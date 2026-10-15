'use client';

import { useEffect, useState } from 'react';
import { usarDatos } from '@/context/DatosContext';
import { analisisGeneral } from '@/lib/repositorio';
import EncabezadoPagina from '@/components/ui/EncabezadoPagina';
import Cargando from '@/components/ui/Cargando';
import Boton from '@/components/ui/Boton';
import EstadoVacio from '@/components/ui/EstadoVacio';
import SemaforoPorcentaje from '@/components/SemaforoPorcentaje';
import SeccionGraficas from '@/components/SeccionGraficas';
import { listarReportes } from '@/lib/repositorio';
import { formatearPorcentaje } from '@/lib/formato';
import { IconoImprimir, IconoAnalisis } from '@/components/Iconos';

function porcentaje(f) {
  const p = Number(f.personas)||0;
  if (p<=0) return 0;
  return Math.min((Number(f.asistencias)||0)/p,1);
}

export default function PaginaAnalisisTotal() {
  const { periodos, periodoActivo, periodoSeleccionado, cargando } = usarDatos();
  const [resultado, setResultado] = useState({ filas: [], totales: null });
  const [reportes, setReportes] = useState([]);
  const [cargandoRep, setCargandoRep] = useState(false);

  useEffect(() => {
    let v=true;
    if (!periodoActivo) { setResultado({filas:[],totales:null}); setReportes([]); return; }
    analisisGeneral(periodoActivo).then(d=>{ if(v) setResultado(d); });
    setCargandoRep(true);
    listarReportes(periodoActivo).then(r=>{ if(v) setReportes(r); }).finally(()=>setCargandoRep(false));
    return ()=>{v=false};
  }, [periodoActivo]);

  if (cargando) return <Cargando />;
  if (periodos.length === 0) return null;

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
        titulo="Análisis Total"
        descripcion={periodoSeleccionado ? `Período: ${periodoSeleccionado.nombre}` : ''}
        acciones={
          <Boton variante="secundario" onClick={() => window.print()}>
            <IconoImprimir size={18} /> Imprimir
          </Boton>
        }
      />
      <div className="hidden print:block">
        <h2 className="text-lg font-bold">Análisis Total</h2>
        <p className="text-sm">Período: {periodoSeleccionado?.nombre}</p>
      </div>
      {!totales || totales.cantidad_reportes === 0 ? (
        <EstadoVacio titulo="Sin datos en este período" descripcion="Registre reportes para ver los análisis." icono={<IconoAnalisis size={30} />} />
      ) : (
        <>
          <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
              <p className="text-xs uppercase text-slate-400">Reportes</p>
              <p className="text-2xl font-bold">{totales.cantidad_reportes}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
              <p className="text-xs uppercase text-slate-400">Personas</p>
              <p className="text-2xl font-bold">{totales.personas}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
              <p className="text-xs uppercase text-slate-400">Asistencias</p>
              <p className="text-2xl font-bold">{totales.asistencias}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
              <p className="text-xs uppercase text-slate-400">Asistencia</p>
              <SemaforoPorcentaje valor={totales.porcentaje} />
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
            <h2 className="mb-3 text-base font-semibold">Detalle por sector</h2>
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b text-xs uppercase text-slate-500">
                  <th className="p-2 text-left">Sector</th>
                  <th className="p-2 text-right">Reportes</th>
                  <th className="p-2 text-right">Personas</th>
                  <th className="p-2 text-right">Asist.</th>
                  <th className="p-2 text-right">Inasist.</th>
                  <th className="p-2 text-right">Invit.</th>
                  <th className="p-2 text-right">Niños</th>
                  <th className="p-2">Asistencia</th>
                </tr>
              </thead>
              <tbody>
                {filas.map((f) => (
                  <tr key={f.sector_id} className="border-b">
                    <td className="p-2">{f.sector} ({f.sector_codigo})</td>
                    <td className="p-2 text-right">{f.cantidad_reportes}</td>
                    <td className="p-2 text-right">{f.personas}</td>
                    <td className="p-2 text-right">{f.asistencias}</td>
                    <td className="p-2 text-right">{f.inasistencias}</td>
                    <td className="p-2 text-right">{f.invitados}</td>
                    <td className="p-2 text-right">{f.ninos}</td>
                    <td className="p-2"><SemaforoPorcentaje valor={f.porcentaje} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
            <h2 className="mb-3 text-base font-semibold">Detalle individual por reporte</h2>
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b text-xs uppercase text-slate-500">
                  <th className="p-2 text-left">Sector</th>
                  <th className="p-2 text-left">Código</th>
                  <th className="p-2 text-left">Líder(es)</th>
                  <th className="p-2 text-right">Personas</th>
                  <th className="p-2 text-right">Asist.</th>
                  <th className="p-2 text-right">Inasist.</th>
                  <th className="p-2 text-right">Invit.</th>
                  <th className="p-2 text-right">Niños</th>
                  <th className="p-2">%</th>
                </tr>
              </thead>
              <tbody>
                {reportes.map((r) => {
                  const pr = porcentaje(r);
                  return (
                    <tr key={r.id} className="border-b">
                      <td className="p-2">{r.sector} ({r.sector_codigo})</td>
                      <td className="p-2 font-mono">{r.codigo}</td>
                      <td className="p-2">{r.lideres_nombres || '-'}</td>
                      <td className="p-2 text-right">{r.personas}</td>
                      <td className="p-2 text-right">{r.asistencias}</td>
                      <td className="p-2 text-right">{r.inasistencias}</td>
                      <td className="p-2 text-right">{r.invitados}</td>
                      <td className="p-2 text-right">{r.ninos}</td>
                      <td className="p-2"><SemaforoPorcentaje valor={pr} /></td>
                    </tr>
                  );
                })}
                {totales && (
                  <tr className="border-t-2 font-semibold">
                    <td className="p-2" colSpan={3}>TOTAL</td>
                    <td className="p-2 text-right">{totales.personas}</td>
                    <td className="p-2 text-right">{totales.asistencias}</td>
                    <td className="p-2 text-right">{totales.inasistencias}</td>
                    <td className="p-2 text-right">{totales.invitados}</td>
                    <td className="p-2 text-right">{totales.ninos}</td>
                    <td className="p-2">{formatearPorcentaje(totales.porcentaje)}</td>
                  </tr>
                )}
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
