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

function formatearFechaISO(fecha) {
  const d = new Date(fecha);
  const año = d.getFullYear();
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const dia = String(d.getDate()).padStart(2, '0');
  return `${año}-${mes}-${dia}`;
}

function hoyISO() {
  return formatearFechaISO(new Date());
}

function sumarDias(fecha, dias) {
  const d = new Date(fecha);
  d.setDate(d.getDate() + dias);
  return formatearFechaISO(d);
}

function inicioFinMes(fecha = new Date()) {
  const d = new Date(fecha.getFullYear(), fecha.getMonth(), 1);
  const f = new Date(fecha.getFullYear(), fecha.getMonth() + 1, 0);
  return { inicio: formatearFechaISO(d), fin: formatearFechaISO(f) };
}

export default function ModalPeriodo({ abierto, periodo, onCerrar }) {
  const { recargar } = usarDatos();
  const { notificar } = usarNotificaciones();
  const [datos, setDatos] = useState({ nombre: '', fecha_inicio: '', fecha_fin: '' });
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    if (abierto) {
      if (periodo) {
        setDatos({
          nombre: periodo.nombre,
          fecha_inicio: periodo.fecha_inicio || '',
          fecha_fin: periodo.fecha_fin || ''
        });
      } else {
        const inicio = hoyISO();
        const fin = sumarDias(inicio, 30);
        setDatos({ nombre: '', fecha_inicio: inicio, fecha_fin: fin });
      }
    }
  }, [abierto, periodo]);

  const cambiar = (campo) => (e) => {
    const valor = e.target.value;
    setDatos((d) => ({ ...d, [campo]: valor }));
  };

  useEffect(() => {
    if (!abierto) return;
    if (periodo) return;
    if (datos.fecha_inicio && !datos.fecha_fin) {
      setDatos((d) => ({ ...d, fecha_fin: sumarDias(d.fecha_inicio, 30) }));
    }
  }, [abierto, periodo, datos.fecha_inicio, datos.fecha_fin]);

  const aplicarAtajo = (tipo) => {
    const inicioHoy = hoyISO();
    if (tipo === 'hoy') {
      setDatos((d) => ({ ...d, fecha_inicio: inicioHoy, fecha_fin: inicioHoy }));
      return;
    }
    if (tipo === 'siete') {
      setDatos((d) => ({ ...d, fecha_inicio: inicioHoy, fecha_fin: sumarDias(inicioHoy, 7) }));
      return;
    }
    if (tipo === 'treinta') {
      setDatos((d) => ({ ...d, fecha_inicio: inicioHoy, fecha_fin: sumarDias(inicioHoy, 30) }));
      return;
    }
    if (tipo === 'mes') {
      const { inicio, fin } = inicioFinMes();
      setDatos((d) => ({ ...d, fecha_inicio: inicio, fecha_fin: fin }));
    }
  };

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
        {!periodo && (
          <div className="flex flex-wrap gap-2 text-xs">
            <Boton type="button" tamano="sm" variante="secundario" onClick={() => aplicarAtajo('hoy')}>
              Hoy
            </Boton>
            <Boton type="button" tamano="sm" variante="secundario" onClick={() => aplicarAtajo('siete')}>
              +7 días
            </Boton>
            <Boton type="button" tamano="sm" variante="secundario" onClick={() => aplicarAtajo('treinta')}>
              +30 días
            </Boton>
            <Boton type="button" tamano="sm" variante="secundario" onClick={() => aplicarAtajo('mes')}>
              Este mes
            </Boton>
          </div>
        )}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Campo id="periodo-inicio" etiqueta="Fecha de inicio" requerido tipo="date" value={datos.fecha_inicio} onChange={cambiar('fecha_inicio')} />
          <Campo id="periodo-fin" etiqueta="Fecha de fin" requerido tipo="date" value={datos.fecha_fin} onChange={cambiar('fecha_fin')} />
        </div>
        <div className="flex justify-end gap-2">
          <Boton type="button" variante="secundario" onClick={onCerrar}>
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
