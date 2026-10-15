'use client';

/**
 * ============================================================================
 *  MODAL DE REPORTE (registro de célula)
 * ----------------------------------------------------------------------------
 *  Permite crear o editar el reporte de una célula. El código de célula se
 *  genera automáticamente (correlativo por período + sector).
 * ============================================================================
 */
import { useEffect, useState } from 'react';
import Modal from '@/components/ui/Modal';
import { Campo, AreaTexto } from '@/components/ui/Campo';
import Selector from '@/components/ui/Selector';
import Boton from '@/components/ui/Boton';
import { IconoAuto } from '@/components/Iconos';
import { usarNotificaciones } from '@/context/NotificacionesContext';
import { usarDatos } from '@/context/DatosContext';
import {
  crearReporte,
  actualizarReporte,
  obtenerReporte,
  siguienteCodigoCeldula,
  crearSector,
  crearLider
} from '@/lib/repositorio';

const VACIO = {
  sectorId: '',
  nuevoSector: '',
  codigoSector: '',
  crearSector: false,
  codigo: '',
  lideresTxt: '',
  personas: '',
  asistencias: '',
  inasistencias: '',
  invitados: '',
  ninos: '',
  observaciones: ''
};

const CLAVE_LIDERES = 'admincell:ultimosLideres';

function cargarLideres() {
  try {
    const raw = localStorage.getItem(CLAVE_LIDERES);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr.slice(0, 15) : [];
  } catch {
    return [];
  }
}

function guardarLideres(lista) {
  try {
    localStorage.setItem(CLAVE_LIDERES, JSON.stringify(lista.slice(0, 15)));
  } catch {}
}

export default function ModalReporte({ abierto, reporte, onCerrar, sectorIdPredef = null }) {
  const { sectores, periodoActivo, recargar } = usarDatos();
  const { notificar } = usarNotificaciones();
  const [datos, setDatos] = useState(VACIO);
  const [inasistenciasManual, setInasistenciasManual] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [sugerencias, setSugerencias] = useState([]);

  const sectorFijo = sectorIdPredef ? sectores.find((s) => String(s.id) === String(sectorIdPredef)) : null;

  useEffect(() => {
    if (!abierto) return;
    let activo = true;
    (async () => {
      setSugerencias(cargarLideres());
      if (reporte) {
        const completo = await obtenerReporte(reporte.id);
        if (!activo || !completo) return;
        setDatos({
          sectorId: sectorIdPredef || completo.sector_id,
          nuevoSector: '',
          codigoSector: '',
          crearSector: false,
          codigo: completo.codigo || '',
          lideresTxt: completo.lideres_nombres || '',
          personas: String(completo.personas ?? ''),
          asistencias: String(completo.asistencias ?? ''),
          inasistencias: String(completo.inasistencias ?? ''),
          invitados: String(completo.invitados ?? ''),
          ninos: String(completo.ninos ?? ''),
          observaciones: completo.observaciones || ''
        });
        setInasistenciasManual(true);
      } else {
        const base = { ...VACIO, sectorId: sectorIdPredef || '' };
        setDatos(base);
        setInasistenciasManual(false);
        if (sectorIdPredef && periodoActivo) {
          const codigo = await siguienteCodigoCeldula(periodoActivo, Number(sectorIdPredef));
          if (activo) setDatos((d) => ({ ...d, codigo }));
        }
      }
    })();
    return () => {
      activo = false;
    };
  }, [abierto, reporte, sectorIdPredef, periodoActivo]);

  const cambiar = (campo) => (e) => setDatos((d) => ({ ...d, [campo]: e.target.value }));

  useEffect(() => {
    if (inasistenciasManual) return;
    const personas = Number(datos.personas) || 0;
    const asistencias = Number(datos.asistencias) || 0;
    setDatos((d) => ({ ...d, inasistencias: String(Math.max(personas - asistencias, 0)) }));
  }, [datos.personas, datos.asistencias, inasistenciasManual]);

  const generarCodigo = async () => {
    try {
      let sectorId = datos.sectorId;
      if (datos.crearSector || !sectorId) {
        if (!datos.nuevoSector || !datos.codigoSector) {
          notificar('Indique nombre y código del sector.', 'error');
          return;
        }
        const creado = await crearSector({ nombre: datos.nuevoSector, codigo: datos.codigoSector, descripcion: '' });
        sectorId = creado.id;
        await recargar();
        setDatos((d) => ({ ...d, sectorId, crearSector: false }));
      }
      if (!sectorId) {
        notificar('Seleccione un sector.', 'error');
        return;
      }
      const codigo = await siguienteCodigoCeldula(periodoActivo, Number(sectorId));
      setDatos((d) => ({ ...d, codigo, sectorId }));
    } catch (e) {
      notificar(e.message || 'No se pudo generar código.', 'error');
    }
  };

  const guardar = async (e) => {
    e.preventDefault();
    if (!periodoActivo) {
      notificar('Debe seleccionar un período activo primero.', 'error');
      return;
    }
    setGuardando(true);
    try {
      let sectorId = datos.sectorId;
      if (!sectorFijo && (datos.crearSector || !sectorId)) {
        if (!datos.nuevoSector || !datos.codigoSector) {
          throw new Error('Falta nombre o código del sector.');
        }
        const creado = await crearSector({ nombre: datos.nuevoSector, codigo: datos.codigoSector, descripcion: '' });
        sectorId = creado.id;
        await recargar();
      }
      if (!sectorId) throw new Error('Debe seleccionar un sector.');

      let codigo = (datos.codigo || '').trim();
      if (!reporte && !codigo) {
        codigo = await siguienteCodigoCeldula(periodoActivo, Number(sectorId));
      }

      const nombres = (datos.lideresTxt || '').trim();
      if (nombres) {
        const actual = cargarLideres();
        const set = new Set(actual);
        nombres
          .split(/[/,;&]+/)
          .map((x) => x.trim())
          .filter(Boolean)
          .forEach((x) => set.add(x));
        guardarLideres(Array.from(set));
      }

      const carga = { ...datos, codigo, periodoId: periodoActivo, sectorId, lideres: nombres };
      if (reporte) {
        await actualizarReporte(reporte.id, carga);
        notificar('Reporte actualizado correctamente.');
      } else {
        await crearReporte(carga);
        notificar('Reporte registrado correctamente.');
      }
      onCerrar();
    } catch (error) {
      notificar(error.message || 'No se pudo guardar el reporte.', 'error');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <Modal abierto={abierto} titulo={reporte ? 'Editar reporte' : 'Nuevo reporte'} onCerrar={onCerrar} ancho="max-w-2xl">
      <form onSubmit={guardar} className="flex flex-col gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            {sectorFijo ? (
              <div>
                <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Sector</span>
                <p className="mt-1 rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700">
                  {sectorFijo.nombre} <span className="text-slate-400">({sectorFijo.codigo})</span>
                </p>
              </div>
            ) : (
              <>
                <Selector
                  id="reporte-sector"
                  etiqueta="Sector"
                  placeholder="Seleccione un sector"
                  value={datos.sectorId}
                  onChange={(e) => setDatos((d) => ({ ...d, sectorId: e.target.value, crearSector: false }))}
                  opciones={sectores.map((s) => ({ valor: s.id, etiqueta: `${s.nombre} (${s.codigo})` }))}
                />
                <div className="flex items-center gap-2 text-xs">
                  <input
                    type="checkbox"
                    id="crear-sector"
                    checked={datos.crearSector}
                    onChange={(e) => setDatos((d) => ({ ...d, crearSector: e.target.checked, sectorId: '' }))}
                  />
                  <label htmlFor="crear-sector">Crear nuevo sector</label>
                </div>
                {datos.crearSector && (
                  <div className="grid gap-2 sm:grid-cols-2">
                    <Campo id="nuevo-sector" etiqueta="Nombre del sector" value={datos.nuevoSector} onChange={cambiar('nuevoSector')} />
                    <Campo id="codigo-sector" etiqueta="Código (ej. CVL)" value={datos.codigoSector} onChange={cambiar('codigoSector')} maxLength={12} />
                  </div>
                )}
              </>
            )}
          </div>
          <div className="flex items-end gap-2">
            <Campo
              id="reporte-codigo"
              etiqueta="Código de célula"
              className="flex-1"
              value={datos.codigo}
              onChange={(e) => setDatos((d) => ({ ...d, codigo: e.target.value }))}
              maxLength={20}
            />
            <Boton variante="secundario" onClick={generarCodigo} type="button">
              <IconoAuto size={16} /> Auto
            </Boton>
          </div>
        </div>

        <Campo
          id="lideres-txt"
          etiqueta="Líder(es)"
          list="lideres-sugeridos"
          value={datos.lideresTxt}
          onChange={cambiar('lideresTxt')}
          placeholder="Separados por / o coma"
        />
        <datalist id="lideres-sugeridos">
          {sugerencias.map((s) => (
            <option key={s} value={s} />
          ))}
        </datalist>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          <Campo id="reporte-personas" etiqueta="Asignados" tipo="number" min="0" value={datos.personas} onChange={cambiar('personas')} />
          <Campo id="reporte-asistencias" etiqueta="Asistencias" tipo="number" min="0" value={datos.asistencias} onChange={cambiar('asistencias')} />
          <Campo
            id="reporte-inasistencias"
            etiqueta="Inasistencias"
            tipo="number"
            min="0"
            value={datos.inasistencias}
            onChange={(e) => {
              setInasistenciasManual(true);
              cambiar('inasistencias')(e);
            }}
          />
          <Campo id="reporte-invitados" etiqueta="Invitados" tipo="number" min="0" value={datos.invitados} onChange={cambiar('invitados')} />
          <Campo id="reporte-ninos" etiqueta="Niños" tipo="number" min="0" value={datos.ninos} onChange={cambiar('ninos')} />
        </div>

        <AreaTexto id="reporte-obs" etiqueta="Observaciones" value={datos.observaciones} onChange={cambiar('observaciones')} maxLength={200} />

        <div className="flex justify-end gap-2">
          <Boton variante="secundario" onClick={onCerrar} type="button">
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
