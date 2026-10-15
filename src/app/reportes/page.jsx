'use client';

/**
 * ============================================================================
 *  PÁGINA DE REPORTES
 * ----------------------------------------------------------------------------
 *  Registra los reportes del período activo.
 * ============================================================================
 */
import { useCallback, useEffect, useState } from 'react';
import { usarDatos } from '@/context/DatosContext';
import { usarNotificaciones } from '@/context/NotificacionesContext';
import { listarReportes, eliminarReporte } from '@/lib/repositorio';
import EncabezadoPagina from '@/components/ui/EncabezadoPagina';
import Cargando from '@/components/ui/Cargando';
import Boton from '@/components/ui/Boton';
import Selector from '@/components/ui/Selector';
import { Campo } from '@/components/ui/Campo';
import EstadoVacio from '@/components/ui/EstadoVacio';
import ModalConfirmar from '@/components/ui/ModalConfirmar';
import ModalReporte from '@/components/modales/ModalReporte';
import TablaReportes from '@/components/TablaReportes';
import AvisoSinPeriodo from '@/components/AvisoSinPeriodo';
import { formatearFecha } from '@/lib/formato';
import { IconoMas, IconoImprimir, IconoBuscar, IconoReporte } from '@/components/Iconos';

export default function PaginaReportes() {
  const { sectores, periodos, periodoActivo, periodoSeleccionado, cargando, recargar } = usarDatos();
  const { notificar } = usarNotificaciones();
  const [filas, setFilas] = useState([]);
  const [filtroSector, setFiltroSector] = useState('');
  const [filtroCodigo, setFiltroCodigo] = useState('');
  const [modal, setModal] = useState({ abierto: false, reporte: null });
  const [porEliminar, setPorEliminar] = useState(null);
  const [cargandoFilas, setCargandoFilas] = useState(false);

  const cargar = useCallback(async () => {
    if (!periodoActivo) {
      setFilas([]);
      return;
    }
    setCargandoFilas(true);
    try {
      const lista = await listarReportes(periodoActivo, { sectorId: filtroSector || null, codigo: filtroCodigo });
      setFilas(lista);
    } catch {
      notificar('No se pudieron cargar los reportes.', 'error');
    } finally {
      setCargandoFilas(false);
    }
  }, [periodoActivo, filtroSector, filtroCodigo, notificar]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const confirmarEliminar = async () => {
    try {
      await eliminarReporte(porEliminar.id);
      notificar('Reporte eliminado.');
      setPorEliminar(null);
      await cargar();
    } catch {
      notificar('No se pudo eliminar el reporte.', 'error');
    }
  };

  if (cargando) return <Cargando />;
  if (periodos.length === 0) return <AvisoSinPeriodo />;

  return (
    <div className="flex flex-col gap-4">
      <EncabezadoPagina
        titulo="Reportes"
        descripcion={periodoSeleccionado ? `Período: ${periodoSeleccionado.nombre}` : ''}
        acciones={
          <>
            <Boton variante="secundario" onClick={() => window.print()}>
              <IconoImprimir size={18} /> Imprimir
            </Boton>
            <Boton onClick={() => setModal({ abierto: true, reporte: null })}>
              <IconoMas size={18} /> Nuevo reporte
            </Boton>
          </>
        }
      />

      <div className="hidden print:block">
        <h2 className="text-lg font-bold">Reportes de células</h2>
        <p className="text-sm">
          Período: {periodoSeleccionado?.nombre} ({formatearFecha(periodoSeleccionado?.fecha_inicio)} —{' '}
          {formatearFecha(periodoSeleccionado?.fecha_fin)})
        </p>
      </div>

      <div className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:grid-cols-2 dark:border-slate-700 dark:bg-slate-800 no-imprimir">
        <Selector
          id="filtro-sector"
          etiqueta="Sector"
          placeholder="Todos los sectores"
          value={filtroSector}
          onChange={(e) => setFiltroSector(e.target.value)}
          opciones={sectores.map((s) => ({ valor: s.id, etiqueta: s.nombre }))}
        />
        <Campo
          id="filtro-codigo"
          etiqueta="Código"
          placeholder="Buscar por código"
          value={filtroCodigo}
          onChange={(e) => setFiltroCodigo(e.target.value)}
        />
      </div>

      {sectores.length === 0 ? (
        <EstadoVacio
          titulo="Primero cree un sector"
          descripcion="Necesita al menos un sector para registrar reportes."
          icono={<IconoReporte size={30} />}
        />
      ) : cargandoFilas ? (
        <Cargando texto="Cargando reportes…" />
      ) : filas.length === 0 ? (
        <EstadoVacio
          titulo="No hay reportes"
          descripcion="Registre el primer reporte de este período o ajuste los filtros."
          icono={<IconoBuscar size={30} />}
        />
      ) : (
        <div className="rounded-xl border border-slate-200 bg-white p-2 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <TablaReportes
            filas={filas}
            onEditar={(f) => setModal({ abierto: true, reporte: f })}
            onEliminar={(f) => setPorEliminar(f)}
          />
        </div>
      )}

      <ModalReporte
        abierto={modal.abierto}
        reporte={modal.reporte}
        onCerrar={() => {
          setModal({ abierto: false, reporte: null });
          cargar();
        }}
      />
      <ModalConfirmar
        abierto={Boolean(porEliminar)}
        titulo="Eliminar reporte"
        mensaje="¿Eliminar este reporte? Esta acción no se puede deshacer."
        onConfirmar={confirmarEliminar}
        onCancelar={() => setPorEliminar(null)}
      />
    </div>
  );
}
