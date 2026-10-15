'use client';

/**
 * ============================================================================
 *  PÁGINA DE REPORTES
 * ----------------------------------------------------------------------------
 *  Registra los reportes del período y sector activos. La tabla muestra,
 *  por cada sector, el detalle de sus reportes y los totales.
 * ============================================================================
 */
import { useCallback, useEffect, useState } from 'react';
import { usarDatos } from '@/context/DatosContext';
import { usarNotificaciones } from '@/context/NotificacionesContext';
import { listarReportes, eliminarReporte, cambiarEstadoReporte } from '@/lib/repositorio';
import EncabezadoPagina from '@/components/ui/EncabezadoPagina';
import Cargando from '@/components/ui/Cargando';
import Boton from '@/components/ui/Boton';
import EstadoVacio from '@/components/ui/EstadoVacio';
import ModalConfirmar from '@/components/ui/ModalConfirmar';
import ModalReporte from '@/components/modales/ModalReporte';
import TablaReportes from '@/components/TablaReportes';
import AvisoSinPeriodo from '@/components/AvisoSinPeriodo';
import { IconoMas, IconoReporte } from '@/components/Iconos';

export default function PaginaReportes() {
  const {
    sectores,
    periodos,
    periodoActivo,
    periodoSeleccionado,
    sectorActivo,
    setSectorActivo,
    cargando
  } = usarDatos();
  const { notificar } = usarNotificaciones();
  const [filas, setFilas] = useState([]);
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
      const lista = await listarReportes(periodoActivo);
      setFilas(lista);
    } catch {
      notificar('No se pudieron cargar los reportes.', 'error');
    } finally {
      setCargandoFilas(false);
    }
  }, [periodoActivo, notificar]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const alternarEstado = async (fila) => {
    const activo = !(fila.activo === 0 || fila.activo === false);
    await cambiarEstadoReporte(fila.id, !activo);
    notificar(activo ? 'Reporte inhabilitado.' : 'Reporte habilitado.');
    await cargar();
  };

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
          <Boton
            onClick={() => setModal({ abierto: true, reporte: null })}
            disabled={sectores.length === 0}
          >
            <IconoMas size={18} /> Nuevo reporte
          </Boton>
        }
      />

      {sectores.length === 0 ? (
        <EstadoVacio
          titulo="Primero cree un sector"
          descripcion="Vaya a Registros para crear un sector y luego registre sus reportes."
          icono={<IconoReporte size={30} />}
        />
      ) : (
        <>
          {cargandoFilas ? (
            <Cargando texto="Cargando reportes…" />
          ) : filas.length === 0 ? (
            <EstadoVacio
              titulo="No hay reportes"
              descripcion="Registre el primer reporte de este período."
              icono={<IconoReporte size={30} />}
              accion={
                <Boton onClick={() => setModal({ abierto: true, reporte: null })}>
                  <IconoMas size={18} /> Nuevo reporte
                </Boton>
              }
            />
          ) : (
            <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-700 dark:bg-slate-800">
              <TablaReportes
                filas={filas}
                onEditar={(f) => setModal({ abierto: true, reporte: f })}
                onEliminar={(f) => setPorEliminar(f)}
                onToggleEstado={alternarEstado}
              />
            </div>
          )}
        </>
      )}

      <ModalReporte
        abierto={modal.abierto}
        reporte={modal.reporte}
        sectorIdPredef={sectorActivo}
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
