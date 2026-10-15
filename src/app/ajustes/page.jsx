'use client';

import { useEffect, useState } from 'react';
import EncabezadoPagina from '@/components/ui/EncabezadoPagina';
import Cargando from '@/components/ui/Cargando';
import Boton from '@/components/ui/Boton';
import { Campo } from '@/components/ui/Campo';
import { usarDatos } from '@/context/DatosContext';
import { usarNotificaciones } from '@/context/NotificacionesContext';
import { listarSectores, eliminarSector, crearSector } from '@/lib/repositorio';
import { IconoEliminar, IconoMas } from '@/components/Iconos';
import Modal from '@/components/ui/Modal';

export default function PaginaAjustes() {
  const { cargando } = usarDatos();
  const { notificar } = usarNotificaciones();
  const [sectores, setSectores] = useState([]);
  const [modal, setModal] = useState({ abierto: false, nombre: '', codigo: '' });

  const cargar = async () => {
    const s = await listarSectores();
    setSectores(s);
  };

  useEffect(() => { cargar(); }, []);

  if (cargando) return <Cargando />;

  return (
    <div className="flex flex-col gap-4">
      <EncabezadoPagina
        titulo="Ajustes"
        descripcion="Gestión de sectores (eliminar los registrados por error)"
        acciones={
          <Boton onClick={() => setModal({ abierto: true, nombre: '', codigo: '' })}>
            <IconoMas size={18} /> Nuevo sector
          </Boton>
        }
      />
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white p-2 dark:border-slate-700 dark:bg-slate-800">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b text-left">
              <th className="p-2">Nombre</th>
              <th className="p-2">Código</th>
              <th className="p-2 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {sectores.map((s) => (
              <tr key={s.id} className="border-b">
                <td className="p-2">{s.nombre}</td>
                <td className="p-2 font-mono">{s.codigo}</td>
                <td className="p-2 text-right">
                  <Boton variante="peligro" onClick={async () => {
                    if (!confirm('¿Eliminar sector? Si tiene reportes puede fallar.')) return;
                    try { await eliminarSector(s.id); notificar('Sector eliminado'); cargar(); } catch (e) { notificar('No se pudo eliminar: ' + (e.message||''), 'error'); }
                  }}>
                    <IconoEliminar size={16} /> Eliminar
                  </Boton>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Modal abierto={modal.abierto} titulo="Crear sector" onCerrar={() => setModal({ abierto: false, nombre: '', codigo: '' })}>
        <div className="flex flex-col gap-3">
          <Campo etiqueta="Nombre" value={modal.nombre} onChange={(e) => setModal({ ...modal, nombre: e.target.value })} />
          <Campo etiqueta="Código" value={modal.codigo} onChange={(e) => setModal({ ...modal, codigo: e.target.value })} />
          <div className="flex justify-end gap-2">
            <Boton variante="secundario" onClick={() => setModal({ abierto: false, nombre: '', codigo: '' })}>Cancelar</Boton>
            <Boton onClick={async () => {
              try { await crearSector({ nombre: modal.nombre, codigo: modal.codigo }); notificar('Creado'); setModal({ abierto: false, nombre: '', codigo: '' }); cargar(); }
              catch (e) { notificar('Error: ' + (e.message||''), 'error'); }
            }}>Guardar</Boton>
          </div>
        </div>
      </Modal>
    </div>
  );
}
