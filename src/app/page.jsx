'use client';

/**
 * ============================================================================
 *  PÁGINA DE INICIO
 * ----------------------------------------------------------------------------
 *  Resumen general: cantidad de sectores, períodos, líderes y reportes del
 *  período activo, con accesos rápidos a los módulos principales.
 * ============================================================================
 */
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usarDatos } from '@/context/DatosContext';
import { listarReportes } from '@/lib/repositorio';
import Tarjeta from '@/components/ui/Tarjeta';
import EncabezadoPagina from '@/components/ui/EncabezadoPagina';
import { IconoSectores, IconoPeriodo, IconoLider, IconoReporte, IconoAnalisis } from '@/components/Iconos';

function TarjetaResumen({ href, etiqueta, valor, Icono }) {
  return (
    <Link
      href={href}
      className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-marca-400 hover:shadow dark:border-slate-700 dark:bg-slate-800"
    >
      <div className="flex items-center justify-between">
        <span className="rounded-lg bg-marca-50 p-2 text-marca-600 dark:bg-marca-900/50 dark:text-marca-300">
          <Icono size={20} />
        </span>
        <span className="text-2xl font-bold text-slate-800 dark:text-slate-100">{valor}</span>
      </div>
      <p className="mt-2 text-sm font-medium text-slate-500 dark:text-slate-400">{etiqueta}</p>
    </Link>
  );
}

export default function PaginaInicio() {
  const { sectores, periodos, lideres, periodoActivo, periodoSeleccionado, cargando, motor } = usarDatos();
  const [reportesActivos, setReportesActivos] = useState(0);

  // Cuenta los reportes del período activo.
  useEffect(() => {
    let vigente = true;
    if (!periodoActivo) {
      setReportesActivos(0);
      return;
    }
    listarReportes(periodoActivo)
      .then((filas) => {
        if (vigente) setReportesActivos(filas.length);
      })
      .catch(() => {});
    return () => {
      vigente = false;
    };
  }, [periodoActivo]);

  if (cargando) {
    return <p className="text-sm text-slate-400">Cargando…</p>;
  }

  return (
    <div className="flex flex-col gap-5">
      <EncabezadoPagina
        titulo="Inicio"
        descripcion={
          periodoSeleccionado ? `Período activo: ${periodoSeleccionado.nombre}` : 'Cree un período para comenzar'
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <TarjetaResumen href="/periodos/" etiqueta="Períodos" valor={periodos.length} Icono={IconoPeriodo} />
        <TarjetaResumen href="/sectores/" etiqueta="Sectores" valor={sectores.length} Icono={IconoSectores} />
        <TarjetaResumen href="/lideres/" etiqueta="Líderes" valor={lideres.length} IconoLider={true} Icono={IconoLider} />
        <TarjetaResumen href="/reportes/" etiqueta="Reportes (período activo)" valor={reportesActivos} Icono={IconoReporte} />
      </div>

      <Tarjeta titulo="Accesos rápidos">
        <div className="grid gap-3 sm:grid-cols-2">
          <Link
            href="/reportes/"
            className="flex items-center gap-3 rounded-lg border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            <IconoReporte size={18} /> Registrar un reporte
          </Link>
          <Link
            href="/analisis-general/"
            className="flex items-center gap-3 rounded-lg border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            <IconoAnalisis size={18} /> Ver análisis general
          </Link>
        </div>
        {motor && (
          <p className="mt-4 text-xs text-slate-400">
            Datos guardados localmente con {motor.nombre}. La aplicación funciona sin conexión.
          </p>
        )}
      </Tarjeta>
    </div>
  );
}
