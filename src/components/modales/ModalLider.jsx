'use client';

/**
 * ============================================================================
 *  MODAL DE LÍDER
 * ----------------------------------------------------------------------------
 *  Crear o editar un líder (nombre y teléfono).
 * ============================================================================
 */
import { useEffect, useState } from 'react';
import Modal from '@/components/ui/Modal';
import { Campo } from '@/components/ui/Campo';
import Boton from '@/components/ui/Boton';
import { usarNotificaciones } from '@/context/NotificacionesContext';
import { usarDatos } from '@/context/DatosContext';
import { crearLider, actualizarLider } from '@/lib/repositorio';

const VACIO = { nombre: '', telefono: '' };

export default function ModalLider({ abierto, lider, onCerrar }) {
  const { recargar } = usarDatos();
  const { notificar } = usarNotificaciones();
  const [datos, setDatos] = useState(VACIO);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    if (abierto) setDatos(lider ? { nombre: lider.nombre, telefono: lider.telefono || '' } : VACIO);
  }, [abierto, lider]);

  const cambiar = (campo) => (e) => setDatos((d) => ({ ...d, [campo]: e.target.value }));

  const guardar = async (e) => {
    e.preventDefault();
    setGuardando(true);
    try {
      if (lider) {
        await actualizarLider(lider.id, datos);
        notificar('Líder actualizado correctamente.');
      } else {
        await crearLider(datos);
        notificar('Líder creado correctamente.');
      }
      await recargar();
      onCerrar();
    } catch (error) {
      notificar(error.message || 'No se pudo guardar el líder.', 'error');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <Modal abierto={abierto} titulo={lider ? 'Editar líder' : 'Nuevo líder'} onCerrar={onCerrar}>
      <form onSubmit={guardar} className="flex flex-col gap-4">
        <Campo id="lider-nombre" etiqueta="Nombre" requerido value={datos.nombre} onChange={cambiar('nombre')} maxLength={80} />
        <Campo id="lider-telefono" etiqueta="Teléfono" value={datos.telefono} onChange={cambiar('telefono')} maxLength={30} />
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
