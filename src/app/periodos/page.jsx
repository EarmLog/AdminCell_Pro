'use client';

/**
 * ============================================================================
 *  PÁGINA DE PERÍODOS
 * ----------------------------------------------------------------------------
 *  Lista, crea, edita y elimina períodos. El período activo (elegido en el menú)
 *  es el que se usa para registrar y analizar reportes.
 * ============================================================================
 */
import { useEffect, useState } from 'react';
import { usarDatos } from '@/context/DatosContext';
import { usarNotificaciones } from '@/context/NotificacionesContext';
import { eliminarPeriodo, contarReportesPorPeriodo } from '@/lib/repositorio';
import EncabezadoPagina from '@/components/ui/EncabezadoPagina';
import Cargando from '@/components/ui/Cargando';
import Boton from '@/components/ui/Boton';
import Badge from '@/components/ui/Badge';
import EstadoVacio from '@/components/ui/EstadoVacio';
import ModalConfirmar from '@/components/ui/ModalConfirmar';
import ModalPeriodo from '@/components/modales/ModalPeriodo';
import { formatearFecha } from '@/lib/formato';
import { IconoPeriodo, IconoMas, IconoEditar, IconoEliminar, IconoCheck } from '@/components/Iconos';

export default function PaginaPeriodos() {
  const { periodos, periodoActivo, setPeriodoActivo, recargar, cargando } = usarDatos();
  const { notificar } = usarNotificaciones();
  const [conteos, setConteos] = useState({});
  const [modal, setModal] = useState({ abierto: false, periodo: null });
  const [porEliminar, setPorEliminar] = useState(null);

  const refrescarConteos = () => contarReportesPorPeriodo().then(setConteos).catch(() => {});

  useEffect(() => {
    refrescarConteos();
  }, [periodos]);

  const confirmarEliminar = async () => {
    try {
      await eliminarPeriodo(porEliminar.id);
      notificar('Período eliminado junto con sus reportes.');
      setPorEliminar(null);
      await recargar();
    } catch {
      notificar('No se pudo eliminar el período.', 'error');
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <EncabezadoPagina
        titulo="Períodos"
        descripcion="Organice los reportes por períodos. Debe existir un período para poder registrar."
        acciones={
          <Boton onClick={() => setModal({ abierto: true, periodo: null })}>
            <IconoMas size={18} /> Nuevo período
          </Boton>
        }
      />

      {cargando ? (
        <Cargando />
      ) : periodos.length === 0 ? (
        <EstadoVacio
          titulo="No hay períodos"
          descripcion="Cree el primer período para empezar a registrar reportes."
          icono={<IconoPeriodo size={30} />}
          accion={<Boton onClick={() => setModal({ abierto: true, periodo: null })}>Crear período</Boton>}
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {periodos.map((p) => {
            const activo = p.id === periodoActivo;
            return (
              <div
                key={p.id}
                className={`rounded-xl border bg-white p-4 shadow-sm dark:bg-slate-800 ${
                  activo ? 'border-marca-500 ring-1 ring-marca-500' : 'border-slate-200 dark:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold text-slate-800 dark:text-slate-100">{p.nombre}</h3>
                    <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                      {formatearFecha(p.fecha_inicio)} — {formatearFecha(p.fecha_fin)}
                    </p>
                  </div>
                  {activo && <Badge color="marca">Activo</Badge>}
                </div>

                <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
                  {conteos[p.id] || 0} reporte(s)
                </p>

                <div className="mt-3 flex flex-wrap gap-2 no-imprimir">
                  {!activo && (
                    <Boton tamano="sm" variante="secundario" onClick={() => setPeriodoActivo(p.id)}>
                      <IconoCheck size={15} /> Usar
                    </Boton>
                  )}
                  <Boton tamano="sm" variante="fantasma" onClick={() => setModal({ abierto: true, periodo: p })}>
                    <IconoEditar size={15} /> Editar
                  </Boton>
                  <Boton tamano="sm" variante="fantasma" onClick={() => setPorEliminar(p)}>
                    <IconoEliminar size={15} /> Eliminar
                  </Boton>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <ModalPeriodo
        abierto={modal.abierto}
        periodo={modal.periodo}
        onCerrar={() => setModal({ abierto: false, periodo: null })}
      />
      <ModalConfirmar
        abierto={Boolean(porEliminar)}
        titulo="Eliminar período"
        mensaje={`¿Eliminar "${porEliminar?.nombre}"? Se borrarán también todos los reportes de este período. Esta acción no se puede deshacer.`}
        onConfirmar={confirmarEliminar}
        onCancelar={() => setPorEliminar(null)}
      />
    </div>
  );
}
