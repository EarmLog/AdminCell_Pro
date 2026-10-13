'use client';

/**
 * ============================================================================
 *  PÁGINA DE SECTORES
 * ----------------------------------------------------------------------------
 *  Lista, crea, edita y elimina sectores. Cada sector tiene un código que sirve
 *  de referencia y participa en el agrupamiento de los análisis.
 * ============================================================================
 */
import { useEffect, useState } from 'react';
import { usarDatos } from '@/context/DatosContext';
import { usarNotificaciones } from '@/context/NotificacionesContext';
import { eliminarSector, contarReportesPorSector } from '@/lib/repositorio';
import EncabezadoPagina from '@/components/ui/EncabezadoPagina';
import Cargando from '@/components/ui/Cargando';
import Boton from '@/components/ui/Boton';
import EstadoVacio from '@/components/ui/EstadoVacio';
import ModalConfirmar from '@/components/ui/ModalConfirmar';
import ModalSector from '@/components/modales/ModalSector';
import { IconoSectores, IconoMas, IconoEditar, IconoEliminar } from '@/components/Iconos';

export default function PaginaSectores() {
  const { sectores, recargar, cargando } = usarDatos();
  const { notificar } = usarNotificaciones();
  const [conteos, setConteos] = useState({});
  const [modal, setModal] = useState({ abierto: false, sector: null });
  const [porEliminar, setPorEliminar] = useState(null);

  useEffect(() => {
    contarReportesPorSector().then(setConteos).catch(() => {});
  }, [sectores]);

  const confirmarEliminar = async () => {
    try {
      await eliminarSector(porEliminar.id);
      notificar('Sector eliminado junto con sus reportes.');
      setPorEliminar(null);
      await recargar();
    } catch {
      notificar('No se pudo eliminar el sector.', 'error');
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <EncabezadoPagina
        titulo="Sectores"
        descripcion="Defina los sectores donde se reúnen las células."
        acciones={
          <Boton onClick={() => setModal({ abierto: true, sector: null })}>
            <IconoMas size={18} /> Nuevo sector
          </Boton>
        }
      />

      {cargando ? (
        <Cargando />
      ) : sectores.length === 0 ? (
        <EstadoVacio
          titulo="No hay sectores"
          descripcion="Cree el primer sector para poder registrar reportes."
          icono={<IconoSectores size={30} />}
          accion={<Boton onClick={() => setModal({ abierto: true, sector: null })}>Crear sector</Boton>}
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {sectores.map((s) => (
            <div key={s.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold text-slate-800 dark:text-slate-100">{s.nombre}</h3>
                <span className="rounded-md bg-slate-100 px-2 py-0.5 font-mono text-xs text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                  {s.codigo}
                </span>
              </div>
              {s.descripcion && <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{s.descripcion}</p>}
              <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">{conteos[s.id] || 0} reporte(s)</p>
              <div className="mt-3 flex flex-wrap gap-2 no-imprimir">
                <Boton tamano="sm" variante="fantasma" onClick={() => setModal({ abierto: true, sector: s })}>
                  <IconoEditar size={15} /> Editar
                </Boton>
                <Boton tamano="sm" variante="fantasma" onClick={() => setPorEliminar(s)}>
                  <IconoEliminar size={15} /> Eliminar
                </Boton>
              </div>
            </div>
          ))}
        </div>
      )}

      <ModalSector
        abierto={modal.abierto}
        sector={modal.sector}
        onCerrar={() => setModal({ abierto: false, sector: null })}
      />
      <ModalConfirmar
        abierto={Boolean(porEliminar)}
        titulo="Eliminar sector"
        mensaje={`¿Eliminar "${porEliminar?.nombre}"? Se borrarán también todos los reportes asociados. Esta acción no se puede deshacer.`}
        onConfirmar={confirmarEliminar}
        onCancelar={() => setPorEliminar(null)}
      />
    </div>
  );
}
