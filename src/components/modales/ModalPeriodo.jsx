'use client';

/**
 * ============================================================================
 *  MODAL DE PERÍODO
 * ----------------------------------------------------------------------------
 *  Crear o editar un período (nombre y rango de fechas).
 * ============================================================================
 */
import { useEffect, useState } from 'react';
import Modal from '@/components/ui/Modal';
import { Campo } from '@/components/ui/Campo';
import Boton from '@/components/ui/Boton';
import { usarNotificaciones } from '@/context/NotificacionesContext';
import { usarDatos } from '@/context/DatosContext';
import { crearPeriodo, actualizarPeriodo } from '@/lib/repositorio';

const VACIO = { nombre: '', fecha_inicio: '', fecha_fin: '' };

export default function ModalPeriodo({ abierto, periodo, onCerrar }) {
  const { recargar } = usarDatos();
  const { notificar } = usarNotificaciones();
  const [datos, setDatos] = useState(VACIO);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    if (abierto)
      setDatos(
        periodo
          ? { nombre: periodo.nombre, fecha_inicio: periodo.fecha_inicio || '', fecha_fin: periodo.fecha_fin || '' }
          : VACIO
      );
  }, [abierto, periodo]);

  const cambiar = (campo) => (e) => setDatos((d) => ({ ...d, [campo]: e.target.value }));

  const guardar = async (e) => {
    e.preventDefault();
    setGuardando(true);
    try {
      if (periodo) {
        await actualizarPeriodo(periodo.id, datos);
        notificar('Período actualizado correctamente.');
      } else {
        await crearPeriodo(datos);
        notificar('Período creado correctamente.');
      }
      await recargar();
      onCerrar();
    } catch (error) {
      notificar(error.message || 'No se pudo guardar el período.', 'error');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <Modal abierto={abierto} titulo={periodo ? 'Editar período' : 'Nuevo período'} onCerrar={onCerrar}>
      <form onSubmit={guardar} className="flex flex-col gap-4">
        <Campo id="periodo-nombre" etiqueta="Nombre" requerido value={datos.nombre} onChange={cambiar('nombre')} maxLength={80} />
        <div className="grid grid-cols-2 gap-4">
          <Campo id="periodo-inicio" etiqueta="Fecha de inicio" requerido tipo="date" value={datos.fecha_inicio} onChange={cambiar('fecha_inicio')} />
          <Campo id="periodo-fin" etiqueta="Fecha de fin" requerido tipo="date" value={datos.fecha_fin} onChange={cambiar('fecha_fin')} />
        </div>
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
