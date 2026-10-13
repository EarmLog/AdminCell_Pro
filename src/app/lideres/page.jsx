'use client';

/**
 * ============================================================================
 *  PÁGINA DE LÍDERES
 * ----------------------------------------------------------------------------
 *  Directorio de líderes. Pueden vincularse a uno o varios reportes desde el
 *  formulario de reportes.
 * ============================================================================
 */
import { useState } from 'react';
import { usarDatos } from '@/context/DatosContext';
import { usarNotificaciones } from '@/context/NotificacionesContext';
import { eliminarLider } from '@/lib/repositorio';
import EncabezadoPagina from '@/components/ui/EncabezadoPagina';
import Cargando from '@/components/ui/Cargando';
import Boton from '@/components/ui/Boton';
import EstadoVacio from '@/components/ui/EstadoVacio';
import ModalConfirmar from '@/components/ui/ModalConfirmar';
import ModalLider from '@/components/modales/ModalLider';
import { iniciales } from '@/lib/formato';
import { IconoLider, IconoMas, IconoEditar, IconoEliminar } from '@/components/Iconos';

export default function PaginaLideres() {
  const { lideres, recargar, cargando } = usarDatos();
  const { notificar } = usarNotificaciones();
  const [modal, setModal] = useState({ abierto: false, lider: null });
  const [porEliminar, setPorEliminar] = useState(null);

  const confirmarEliminar = async () => {
    try {
      await eliminarLider(porEliminar.id);
      notificar('Líder eliminado.');
      setPorEliminar(null);
      await recargar();
    } catch {
      notificar('No se pudo eliminar el líder.', 'error');
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <EncabezadoPagina
        titulo="Líderes"
        descripcion="Personas que lideran las células."
        acciones={
          <Boton onClick={() => setModal({ abierto: true, lider: null })}>
            <IconoMas size={18} /> Nuevo líder
          </Boton>
        }
      />

      {cargando ? (
        <Cargando />
      ) : lideres.length === 0 ? (
        <EstadoVacio
          titulo="No hay líderes"
          descripcion="Registre a las personas que lideran las células."
          icono={<IconoLider size={30} />}
          accion={<Boton onClick={() => setModal({ abierto: true, lider: null })}>Crear líder</Boton>}
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {lideres.map((l) => (
            <div key={l.id} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-marca-100 text-sm font-semibold text-marca-700 dark:bg-marca-900 dark:text-marca-200">
                {iniciales(l.nombre)}
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="truncate font-semibold text-slate-800 dark:text-slate-100">{l.nombre}</h3>
                <p className="truncate text-xs text-slate-500 dark:text-slate-400">{l.telefono || 'Sin teléfono'}</p>
              </div>
              <div className="flex gap-1 no-imprimir">
                <button
                  type="button"
                  onClick={() => setModal({ abierto: true, lider: l })}
                  className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700"
                  title="Editar"
                >
                  <IconoEditar size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => setPorEliminar(l)}
                  className="rounded-lg p-1.5 text-slate-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950"
                  title="Eliminar"
                >
                  <IconoEliminar size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ModalLider abierto={modal.abierto} lider={modal.lider} onCerrar={() => setModal({ abierto: false, lider: null })} />
      <ModalConfirmar
        abierto={Boolean(porEliminar)}
        titulo="Eliminar líder"
        mensaje={`¿Eliminar a "${porEliminar?.nombre}"? Se quitará de los reportes donde esté vinculado.`}
        onConfirmar={confirmarEliminar}
        onCancelar={() => setPorEliminar(null)}
      />
    </div>
  );
}
