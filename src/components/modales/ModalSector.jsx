'use client';

/**
 * ============================================================================
 *  MODAL DE SECTOR
 * ----------------------------------------------------------------------------
 *  Crear o editar un sector (nombre, código y descripción).
 * ============================================================================
 */
import { useEffect, useState } from 'react';
import Modal from '@/components/ui/Modal';
import { Campo, AreaTexto } from '@/components/ui/Campo';
import Boton from '@/components/ui/Boton';
import { usarNotificaciones } from '@/context/NotificacionesContext';
import { usarDatos } from '@/context/DatosContext';
import { crearSector, actualizarSector } from '@/lib/repositorio';

const VACIO = { nombre: '', codigo: '', descripcion: '' };

export default function ModalSector({ abierto, sector, onCerrar }) {
  const { recargar } = usarDatos();
  const { notificar } = usarNotificaciones();
  const [datos, setDatos] = useState(VACIO);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    if (abierto) setDatos(sector ? { nombre: sector.nombre, codigo: sector.codigo, descripcion: sector.descripcion || '' } : VACIO);
  }, [abierto, sector]);

  const cambiar = (campo) => (e) => setDatos((d) => ({ ...d, [campo]: e.target.value }));

  const guardar = async (e) => {
    e.preventDefault();
    setGuardando(true);
    try {
      if (sector) {
        await actualizarSector(sector.id, datos);
        notificar('Sector actualizado correctamente.');
      } else {
        await crearSector(datos);
        notificar('Sector creado correctamente.');
      }
      await recargar();
      onCerrar();
    } catch (error) {
      notificar(error.message || 'No se pudo guardar el sector.', 'error');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <Modal abierto={abierto} titulo={sector ? 'Editar sector' : 'Nuevo sector'} onCerrar={onCerrar}>
      <form onSubmit={guardar} className="flex flex-col gap-4">
        <Campo id="sector-nombre" etiqueta="Nombre" requerido value={datos.nombre} onChange={cambiar('nombre')} maxLength={80} />
        <Campo
          id="sector-codigo"
          etiqueta="Código"
          requerido
          value={datos.codigo}
          onChange={cambiar('codigo')}
          maxLength={12}
          ayuda="Se usa como prefijo en el código de las células (por ejemplo: CENTRO)."
        />
        <AreaTexto id="sector-desc" etiqueta="Descripción" value={datos.descripcion} onChange={cambiar('descripcion')} maxLength={200} />
        <div className="flex justify-end gap-2">
          <Boton variante="secundario" onClick={onCerrar}>
            Cancelar
          </Boton>
          <Boton tipo="submit" disabled={guardando}>
            {guardando ? 'Guardando…' : 'Guardar'}
          </Boton>
        </div>
      </form>
    </Modal>
  );
}
