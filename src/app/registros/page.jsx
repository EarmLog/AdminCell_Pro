'use client';

import { useEffect, useState } from 'react';
import EncabezadoPagina from '@/components/ui/EncabezadoPagina';
import Cargando from '@/components/ui/Cargando';
import Boton from '@/components/ui/Boton';
import { Campo } from '@/components/ui/Campo';
import Modal from '@/components/ui/Modal';
import { usarDatos } from '@/context/DatosContext';
import { usarNotificaciones } from '@/context/NotificacionesContext';
import { listarSectores, crearSector, eliminarSector, listarPeriodos, crearPeriodo, actualizarPeriodo, eliminarPeriodo, listarLideres, crearLider, eliminarLider } from '@/lib/repositorio';

export default function PaginaRegistros() {
  const { cargando } = usarDatos();
  const { notificar } = usarNotificaciones();
  const [tab, setTab] = useState('periodos');
  const [sectores, setSectores] = useState([]);
  const [periodos, setPeriodos] = useState([]);
  const [lideres, setLideres] = useState([]);
  const [modalSec, setModalSec] = useState({ abierto: false, nombre: '', codigo: '' });
  const [modalPer, setModalPer] = useState({ abierto: false, id: null, nombre: '', fecha_inicio: '', fecha_fin: '' });
  const [modalLid, setModalLid] = useState({ abierto: false, id: null, nombre: '' });

  const cargar = async () => {
    setSectores(await listarSectores());
    setPeriodos(await listarPeriodos());
    setLideres(await listarLideres());
  };

  useEffect(() => { cargar(); }, []);

  if (cargando) return <Cargando />;

  return (
    <div className="flex flex-col gap-4">
      <EncabezadoPagina titulo="Registros" descripcion="Crear y gestionar períodos, sectores y líderes" />
      <div className="flex gap-2 no-imprimir">
        {['periodos','sectores','lideres'].map((t) => (
          <button key={t} className={`px-3 py-1 rounded ${tab===t?'bg-slate-900 text-white':''}`} onClick={() => setTab(t)}>{t}</button>
        ))}
      </div>

      {tab==='periodos' && (
        <div className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-800">
          <Boton onClick={() => setModalPer({ abierto: true, id: null, nombre: '', fecha_inicio: '', fecha_fin: '' })}>Nuevo período</Boton>
          <table className="min-w-full text-sm mt-3">
            <thead><tr className="border-b"><th className="p-2">Nombre</th><th className="p-2">Inicio</th><th className="p-2">Fin</th><th className="p-2 text-right">Acciones</th></tr></thead>
            <tbody>
              {periodos.map((p) => (
                <tr key={p.id} className="border-b">
                  <td className="p-2">{p.nombre}</td>
                  <td className="p-2">{p.fecha_inicio}</td>
                  <td className="p-2">{p.fecha_fin}</td>
                  <td className="p-2 text-right">
                    <Boton variante="secundario" onClick={() => setModalPer({ abierto: true, id: p.id, nombre: p.nombre, fecha_inicio: p.fecha_inicio, fecha_fin: p.fecha_fin })}>Editar</Boton>
                    <Boton variante="peligro" onClick={async () => { if (!confirm('Eliminar?')) return; await eliminarPeriodo(p.id); cargar(); }}>Eliminar</Boton>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab==='sectores' && (
        <div className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-800">
          <Boton onClick={() => setModalSec({ abierto: true, nombre: '', codigo: '' })}>Nuevo sector</Boton>
          <table className="min-w-full text-sm mt-3">
            <thead><tr className="border-b"><th className="p-2">Nombre</th><th className="p-2">Código</th><th className="p-2 text-right">Acciones</th></tr></thead>
            <tbody>
              {sectores.map((s) => (
                <tr key={s.id} className="border-b">
                  <td className="p-2">{s.nombre}</td>
                  <td className="p-2 font-mono">{s.codigo}</td>
                  <td className="p-2 text-right"><Boton variante="peligro" onClick={async () => { if (!confirm('Eliminar sector?')) return; try { await eliminarSector(s.id); cargar(); notificar('Eliminado'); } catch(e) { notificar('No se pudo eliminar', 'error'); } }}>Eliminar</Boton></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab==='lideres' && (
        <div className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-800">
          <Boton onClick={() => setModalLid({ abierto: true, id: null, nombre: '' })}>Nuevo líder</Boton>
          <table className="min-w-full text-sm mt-3">
            <thead><tr className="border-b"><th className="p-2">Nombre</th><th className="p-2 text-right">Acciones</th></tr></thead>
            <tbody>
              {lideres.map((l) => (
                <tr key={l.id} className="border-b">
                  <td className="p-2">{l.nombre}</td>
                  <td className="p-2 text-right"><Boton variante="peligro" onClick={async () => { await eliminarLider(l.id); cargar(); }}>Eliminar</Boton></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* modals */}
      <Modal abierto={modalSec.abierto} titulo="Crear sector" onCerrar={() => setModalSec({ abierto: false, nombre: '', codigo: '' })}>
        <div className="flex flex-col gap-3">
          <Campo etiqueta="Nombre" value={modalSec.nombre} onChange={(e) => setModalSec({ ...modalSec, nombre: e.target.value })} />
          <Campo etiqueta="Código" value={modalSec.codigo} onChange={(e) => setModalSec({ ...modalSec, codigo: e.target.value })} />
          <div className="flex justify-end gap-2">
            <Boton variante="secundario" onClick={() => setModalSec({ abierto: false, nombre: '', codigo: '' })}>Cancelar</Boton>
            <Boton onClick={async () => { await crearSector({ nombre: modalSec.nombre, codigo: modalSec.codigo }); setModalSec({ abierto: false, nombre: '', codigo: '' }); cargar(); notificar('Creado'); }}>Guardar</Boton>
          </div>
        </div>
      </Modal>

      <Modal abierto={modalPer.abierto} titulo={modalPer.id?'Editar período':'Nuevo período'} onCerrar={() => setModalPer({ abierto: false, id: null, nombre: '', fecha_inicio: '', fecha_fin: '' })}>
        <div className="flex flex-col gap-3">
          <Campo etiqueta="Nombre" value={modalPer.nombre} onChange={(e) => setModalPer({ ...modalPer, nombre: e.target.value })} />
          <div className="grid grid-cols-2 gap-2">
            <Campo tipo="date" etiqueta="Fecha inicio" value={modalPer.fecha_inicio} onChange={(e) => setModalPer({ ...modalPer, fecha_inicio: e.target.value })} />
            <Campo tipo="date" etiqueta="Fecha fin" value={modalPer.fecha_fin} onChange={(e) => setModalPer({ ...modalPer, fecha_fin: e.target.value })} />
          </div>
          <div className="flex justify-end gap-2">
            <Boton variante="secundario" onClick={() => setModalPer({ abierto: false, id: null, nombre: '', fecha_inicio: '', fecha_fin: '' })}>Cancelar</Boton>
            <Boton onClick={async () => {
              const data={ nombre: modalPer.nombre, fecha_inicio: modalPer.fecha_inicio, fecha_fin: modalPer.fecha_fin };
              if (modalPer.id) await actualizarPeriodo(modalPer.id, data); else await crearPeriodo(data);
              setModalPer({ abierto: false, id: null, nombre: '', fecha_inicio: '', fecha_fin: '' }); cargar(); notificar('Guardado');
            }}>Guardar</Boton>
          </div>
        </div>
      </Modal>

      <Modal abierto={modalLid.abierto} titulo="Crear líder" onCerrar={() => setModalLid({ abierto: false, id: null, nombre: '' })}>
        <div className="flex flex-col gap-3">
          <Campo etiqueta="Nombre" value={modalLid.nombre} onChange={(e) => setModalLid({ ...modalLid, nombre: e.target.value })} />
          <div className="flex justify-end gap-2">
            <Boton variante="secundario" onClick={() => setModalLid({ abierto: false, id: null, nombre: '' })}>Cancelar</Boton>
            <Boton onClick={async () => { await crearLider({ nombre: modalLid.nombre }); setModalLid({ abierto: false, id: null, nombre: '' }); cargar(); notificar('Creado'); }}>Guardar</Boton>
          </div>
        </div>
      </Modal>
    </div>
  );
}
