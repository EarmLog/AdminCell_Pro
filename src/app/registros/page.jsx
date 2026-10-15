'use client';

import { useEffect, useState } from 'react';
import EncabezadoPagina from '@/components/ui/EncabezadoPagina';
import Cargando from '@/components/ui/Cargando';
import Boton from '@/components/ui/Boton';
import { Campo } from '@/components/ui/Campo';
import Modal from '@/components/ui/Modal';
import ModalConfirmar from '@/components/ui/ModalConfirmar';
import { usarDatos } from '@/context/DatosContext';
import { usarNotificaciones } from '@/context/NotificacionesContext';
import {
  crearSector,
  eliminarSector,
  crearPeriodo,
  actualizarPeriodo,
  eliminarPeriodo,
  crearLider,
  eliminarLider
} from '@/lib/repositorio';
import { IconoMas, IconoEditar, IconoEliminar } from '@/components/Iconos';

function hoyISO() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function sumarDias(iso, dias) {
  const base = iso ? new Date(iso + 'T00:00:00') : new Date();
  base.setDate(base.getDate() + dias);
  const pad = (n) => String(n).padStart(2, '0');
  return `${base.getFullYear()}-${pad(base.getMonth() + 1)}-${pad(base.getDate())}`;
}

const TABS = [
  { id: 'periodos', etiqueta: 'Períodos' },
  { id: 'sectores', etiqueta: 'Sectores' },
  { id: 'lideres', etiqueta: 'Líderes' }
];

export default function PaginaRegistros() {
  const { sectores, periodos, lideres, cargando, recargar } = usarDatos();
  const { notificar } = usarNotificaciones();
  const [tab, setTab] = useState('periodos');
  const [modalSec, setModalSec] = useState({ abierto: false, nombre: '', codigo: '' });
  const [modalPer, setModalPer] = useState({ abierto: false, id: null, nombre: '', fecha_inicio: '', fecha_fin: '' });
  const [modalLid, setModalLid] = useState({ abierto: false, nombre: '' });
  const [porEliminar, setPorEliminar] = useState(null);

  useEffect(() => {
    recargar();
  }, [recargar]);

  const cerrarPer = () => setModalPer({ abierto: false, id: null, nombre: '', fecha_inicio: '', fecha_fin: '' });

  const nuevoPeriodo = () => {
    setModalPer({ abierto: true, id: null, nombre: '', fecha_inicio: hoyISO(), fecha_fin: sumarDias(hoyISO(), 30) });
  };

  const guardarPeriodo = async () => {
    if (!modalPer.nombre.trim()) {
      notificar('Indique el nombre del período.', 'error');
      return;
    }
    const data = {
      nombre: modalPer.nombre.trim(),
      fecha_inicio: modalPer.fecha_inicio || null,
      fecha_fin: modalPer.fecha_fin || null
    };
    try {
      if (modalPer.id) await actualizarPeriodo(modalPer.id, data);
      else await crearPeriodo(data);
      cerrarPer();
      await recargar();
      notificar('Período guardado.');
    } catch (e) {
      notificar(e.message || 'No se pudo guardar el período.', 'error');
    }
  };

  const guardarSector = async () => {
    if (!modalSec.nombre.trim() || !modalSec.codigo.trim()) {
      notificar('Indique nombre y código del sector.', 'error');
      return;
    }
    try {
      await crearSector({ nombre: modalSec.nombre.trim(), codigo: modalSec.codigo.trim() });
      setModalSec({ abierto: false, nombre: '', codigo: '' });
      await recargar();
      notificar('Sector creado.');
    } catch (e) {
      notificar(e.message || 'No se pudo crear el sector.', 'error');
    }
  };

  const guardarLider = async () => {
    if (!modalLid.nombre.trim()) {
      notificar('Indique el nombre del líder.', 'error');
      return;
    }
    await crearLider({ nombre: modalLid.nombre.trim() });
    setModalLid({ abierto: false, nombre: '' });
    await recargar();
    notificar('Líder creado.');
  };

  const confirmarEliminar = async () => {
    try {
      if (porEliminar.tipo === 'periodo') await eliminarPeriodo(porEliminar.item.id);
      if (porEliminar.tipo === 'sector') await eliminarSector(porEliminar.item.id);
      if (porEliminar.tipo === 'lider') await eliminarLider(porEliminar.item.id);
      notificar('Registro eliminado.');
      setPorEliminar(null);
      await recargar();
    } catch {
      notificar('No se pudo eliminar. Puede tener reportes asociados.', 'error');
      setPorEliminar(null);
    }
  };

  if (cargando) return <Cargando />;

  return (
    <div className="flex flex-col gap-4">
      <EncabezadoPagina titulo="Registros" descripcion="Crear y gestionar períodos, sectores y líderes" />

      <div className="flex flex-wrap gap-2 no-imprimir">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
              tab === t.id
                ? 'bg-marca-600 text-white'
                : 'bg-white text-slate-600 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
            }`}
          >
            {t.etiqueta}
          </button>
        ))}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
        {tab === 'periodos' && (
          <>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-base font-semibold">Períodos</h2>
              <Boton onClick={nuevoPeriodo}>
                <IconoMas size={18} /> Nuevo período
              </Boton>
            </div>
            <Tabla
              columnas={['Nombre', 'Inicio', 'Fin']}
              filas={periodos}
              renderFila={(p) => [p.nombre, p.fecha_inicio || '—', p.fecha_fin || '—']}
              onEditar={(p) => setModalPer({ abierto: true, id: p.id, nombre: p.nombre, fecha_inicio: p.fecha_inicio || '', fecha_fin: p.fecha_fin || '' })}
              onEliminar={(p) => setPorEliminar({ tipo: 'periodo', item: p })}
            />
          </>
        )}

        {tab === 'sectores' && (
          <>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-base font-semibold">Sectores</h2>
              <Boton onClick={() => setModalSec({ abierto: true, nombre: '', codigo: '' })}>
                <IconoMas size={18} /> Nuevo sector
              </Boton>
            </div>
            <Tabla
              columnas={['Nombre', 'Código']}
              filas={sectores}
              renderFila={(s) => [s.nombre, s.codigo]}
              onEliminar={(s) => setPorEliminar({ tipo: 'sector', item: s })}
            />
          </>
        )}

        {tab === 'lideres' && (
          <>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-base font-semibold">Líderes</h2>
              <Boton onClick={() => setModalLid({ abierto: true, nombre: '' })}>
                <IconoMas size={18} /> Nuevo líder
              </Boton>
            </div>
            <Tabla
              columnas={['Nombre']}
              filas={lideres}
              renderFila={(l) => [l.nombre]}
              onEliminar={(l) => setPorEliminar({ tipo: 'lider', item: l })}
            />
          </>
        )}
      </div>

      <Modal abierto={modalSec.abierto} titulo="Nuevo sector" onCerrar={() => setModalSec({ abierto: false, nombre: '', codigo: '' })}>
        <div className="flex flex-col gap-3">
          <Campo etiqueta="Nombre del sector" value={modalSec.nombre} onChange={(e) => setModalSec({ ...modalSec, nombre: e.target.value })} placeholder="Ej. El Calvario" />
          <Campo etiqueta="Código" value={modalSec.codigo} onChange={(e) => setModalSec({ ...modalSec, codigo: e.target.value.toUpperCase() })} placeholder="Ej. CVL" maxLength={12} />
          <div className="flex justify-end gap-2">
            <Boton variante="secundario" onClick={() => setModalSec({ abierto: false, nombre: '', codigo: '' })}>Cancelar</Boton>
            <Boton onClick={guardarSector}>Guardar</Boton>
          </div>
        </div>
      </Modal>

      <Modal abierto={modalPer.abierto} titulo={modalPer.id ? 'Editar período' : 'Nuevo período'} onCerrar={cerrarPer}>
        <div className="flex flex-col gap-3">
          <Campo etiqueta="Nombre" value={modalPer.nombre} onChange={(e) => setModalPer({ ...modalPer, nombre: e.target.value })} placeholder="Ej. Enero 2026" />
          <div className="grid grid-cols-2 gap-2">
            <Campo tipo="date" etiqueta="Fecha inicio" value={modalPer.fecha_inicio} onChange={(e) => setModalPer({ ...modalPer, fecha_inicio: e.target.value })} />
            <Campo tipo="date" etiqueta="Fecha fin" value={modalPer.fecha_fin} onChange={(e) => setModalPer({ ...modalPer, fecha_fin: e.target.value })} />
          </div>
          <div className="flex flex-wrap gap-2 text-xs">
            <button type="button" className="rounded border border-slate-200 px-2 py-1 hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-700" onClick={() => setModalPer((m) => ({ ...m, fecha_inicio: hoyISO(), fecha_fin: sumarDias(hoyISO(), 30) }))}>Hoy → +30 días</button>
            <button type="button" className="rounded border border-slate-200 px-2 py-1 hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-700" onClick={() => setModalPer((m) => ({ ...m, fecha_fin: sumarDias(m.fecha_inicio, 30) }))}>Fin = inicio + 30</button>
          </div>
          <div className="flex justify-end gap-2">
            <Boton variante="secundario" onClick={cerrarPer}>Cancelar</Boton>
            <Boton onClick={guardarPeriodo}>Guardar</Boton>
          </div>
        </div>
      </Modal>

      <Modal abierto={modalLid.abierto} titulo="Nuevo líder" onCerrar={() => setModalLid({ abierto: false, nombre: '' })}>
        <div className="flex flex-col gap-3">
          <Campo etiqueta="Nombre del líder" value={modalLid.nombre} onChange={(e) => setModalLid({ ...modalLid, nombre: e.target.value })} />
          <div className="flex justify-end gap-2">
            <Boton variante="secundario" onClick={() => setModalLid({ abierto: false, nombre: '' })}>Cancelar</Boton>
            <Boton onClick={guardarLider}>Guardar</Boton>
          </div>
        </div>
      </Modal>

      <ModalConfirmar
        abierto={Boolean(porEliminar)}
        titulo="Eliminar registro"
        mensaje={`¿Eliminar "${porEliminar?.item?.nombre || ''}"? Esta acción no se puede deshacer.`
        }
        onConfirmar={confirmarEliminar}
        onCancelar={() => setPorEliminar(null)}
      />
    </div>
  );
}

function Tabla({ columnas, filas, renderFila, onEditar, onEliminar }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-left text-xs uppercase text-slate-500 dark:border-slate-700 dark:text-slate-400">
            {columnas.map((c) => (
              <th key={c} className="px-3 py-2 font-medium">{c}</th>
            ))}
            <th className="px-3 py-2 text-right font-medium">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {filas.length === 0 && (
            <tr>
              <td colSpan={columnas.length + 1} className="px-3 py-6 text-center text-sm text-slate-400">Sin registros.</td>
            </tr>
          )}
          {filas.map((fila) => (
            <tr key={fila.id} className="border-b border-slate-100 last:border-0 dark:border-slate-800">
              {renderFila(fila).map((valor, i) => (
                <td key={i} className={`px-3 py-2 ${i === 1 && typeof valor === 'string' && /^[A-Z0-9]{2,}$/.test(valor) ? 'font-mono' : ''}`}>{valor}</td>
              ))}
              <td className="px-3 py-2">
                <div className="flex justify-end gap-1">
                  {onEditar && (
                    <button type="button" onClick={() => onEditar(fila)} className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-marca-600 dark:hover:bg-slate-700" title="Editar">
                      <IconoEditar size={17} />
                    </button>
                  )}
                  {onEliminar && (
                    <button type="button" onClick={() => onEliminar(fila)} className="rounded-lg p-1.5 text-slate-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950" title="Eliminar">
                      <IconoEliminar size={17} />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
