'use client';

/**
 * ============================================================================
 *  MODAL DE REPORTE (registro de célula)
 * ----------------------------------------------------------------------------
 *  Permite crear o editar el reporte de una célula. Incluye:
 *    - Generador automático del código de célula (001, 002, …).
 *    - Selección de líderes participantes.
 *    - Sugerencia automática de inasistencias (personas − asistencias),
 *      que el usuario puede corregir a mano.
 * ============================================================================
 */
import { useEffect, useMemo, useState } from 'react';
import Modal from '@/components/ui/Modal';
import { Campo, AreaTexto } from '@/components/ui/Campo';
import Selector from '@/components/ui/Selector';
import Boton from '@/components/ui/Boton';
import { IconoAuto } from '@/components/Iconos';
import { usarNotificaciones } from '@/context/NotificacionesContext';
import { usarDatos } from '@/context/DatosContext';
import { crearReporte, actualizarReporte, obtenerReporte, siguienteCodigoCeldula } from '@/lib/repositorio';

const VACIO = {
  sectorId: '',
  codigo: '',
  liderIds: [],
  personas: '',
  asistencias: '',
  inasistencias: '',
  invitados: '',
  ninos: '',
  observaciones: ''
};

export default function ModalReporte({ abierto, reporte, onCerrar }) {
  const { sectores, lideres, periodoActivo, recargar } = usarDatos();
  const { notificar } = usarNotificaciones();
  const [datos, setDatos] = useState(VACIO);
  const [inasistenciasManual, setInasistenciasManual] = useState(false);
  const [guardando, setGuardando] = useState(false);

  // Al abrir, carga el reporte (edición) o parte de un formulario vacío.
  useEffect(() => {
    if (!abierto) return;
    let activo = true;
    (async () => {
      if (reporte) {
        const completo = await obtenerReporte(reporte.id);
        if (!activo || !completo) return;
        setDatos({
          sectorId: completo.sector_id,
          codigo: completo.codigo,
          liderIds: completo.liderIds || [],
          personas: String(completo.personas ?? ''),
          asistencias: String(completo.asistencias ?? ''),
          inasistencias: String(completo.inasistencias ?? ''),
          invitados: String(completo.invitados ?? ''),
          ninos: String(completo.ninos ?? ''),
          observaciones: completo.observaciones || ''
        });
        setInasistenciasManual(true);
      } else {
        setDatos(VACIO);
        setInasistenciasManual(false);
      }
    })();
    return () => {
      activo = false;
    };
  }, [abierto, reporte]);

  const cambiar = (campo) => (e) => setDatos((d) => ({ ...d, [campo]: e.target.value }));

  // Al cambiar personas o asistencias, sugiere las inasistencias (salvo edición manual).
  useEffect(() => {
    if (inasistenciasManual) return;
    const personas = Number(datos.personas) || 0;
    const asistencias = Number(datos.asistencias) || 0;
    setDatos((d) => ({ ...d, inasistencias: String(Math.max(personas - asistencias, 0)) }));
  }, [datos.personas, datos.asistencias, inasistenciasManual]);

  const generarCodigo = async () => {
    if (!datos.sectorId) {
      notificar('Seleccione un sector para generar el código.', 'error');
      return;
    }
    const codigo = await siguienteCodigoCeldula(periodoActivo, Number(datos.sectorId));
    setDatos((d) => ({ ...d, codigo }));
  };

  const alternarLider = (id) => {
    setDatos((d) => ({
      ...d,
      liderIds: d.liderIds.includes(id) ? d.liderIds.filter((x) => x !== id) : [...d.liderIds, id]
    }));
  };

  const nombresLideres = useMemo(
    () =>
      lideres
        .filter((l) => datos.liderIds.includes(l.id))
        .map((l) => l.nombre)
        .join(' / '),
    [lideres, datos.liderIds]
  );

  const guardar = async (e) => {
    e.preventDefault();
    if (!periodoActivo) {
      notificar('Debe seleccionar un período activo primero.', 'error');
      return;
    }
    setGuardando(true);
    try {
      const carga = { ...datos, periodoId: periodoActivo, lideres: nombresLideres };
      if (reporte) {
        await actualizarReporte(reporte.id, carga);
        notificar('Reporte actualizado correctamente.');
      } else {
        await crearReporte(carga);
        notificar('Reporte registrado correctamente.');
      }
      await recargar();
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
          <Selector
            id="reporte-sector"
            etiqueta="Sector"
            requerido
            placeholder="Seleccione un sector"
            value={datos.sectorId}
            onChange={(e) => setDatos((d) => ({ ...d, sectorId: e.target.value }))}
            opciones={sectores.map((s) => ({ valor: s.id, etiqueta: `${s.nombre} (${s.codigo})` }))}
          />
          <div className="flex items-end gap-2">
            <Campo
              id="reporte-codigo"
              etiqueta="Código de célula"
              requerido
              className="flex-1"
              value={datos.codigo}
              onChange={(e) => setDatos((d) => ({ ...d, codigo: e.target.value }))}
              maxLength={20}
            />
            <Boton variante="secundario" onClick={generarCodigo} tipo="button">
              <IconoAuto size={16} /> Auto
            </Boton>
          </div>
        </div>

        <fieldset>
          <legend className="mb-2 text-sm font-medium text-slate-700 dark:text-slate-200">Líderes</legend>
          {lideres.length === 0 ? (
            <p className="text-sm text-slate-400">No hay líderes registrados. Puede crearlos en el módulo Líderes.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {lideres.map((l) => {
                const activo = datos.liderIds.includes(l.id);
                return (
                  <button
                    type="button"
                    key={l.id}
                    onClick={() => alternarLider(l.id)}
                    className={`rounded-full border px-3 py-1 text-sm transition ${
                      activo
                        ? 'border-marca-600 bg-marca-600 text-white'
                        : 'border-slate-300 text-slate-600 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700'
                    }`}
                  >
                    {l.nombre}
                  </button>
                );
              })}
            </div>
          )}
        </fieldset>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Campo id="reporte-personas" etiqueta="Personas" tipo="number" min="0" value={datos.personas} onChange={(e) => setDatos((d) => ({ ...d, personas: e.target.value }))} />
          <Campo id="reporte-asistencias" etiqueta="Asistencias" tipo="number" min="0" value={datos.asistencias} onChange={(e) => setDatos((d) => ({ ...d, asistencias: e.target.value }))} />
          <Campo
            id="reporte-inasistencias"
            etiqueta="Inasistencias"
            tipo="number"
            min="0"
            value={datos.inasistencias}
            onChange={(e) => {
              setInasistenciasManual(true);
              setDatos((d) => ({ ...d, inasistencias: e.target.value }));
            }}
            ayuda="Sugerida automáticamente"
          />
          <Campo id="reporte-invitados" etiqueta="Invitados" tipo="number" min="0" value={datos.invitados} onChange={(e) => setDatos((d) => ({ ...d, invitados: e.target.value }))} />
        </div>

        <Campo id="reporte-ninos" etiqueta="Niños" tipo="number" min="0" value={datos.ninos} onChange={(e) => setDatos((d) => ({ ...d, ninos: e.target.value }))} className="sm:max-w-[50%]" />
        <AreaTexto id="reporte-obs" etiqueta="Observaciones" value={datos.observaciones} onChange={(e) => setDatos((d) => ({ ...d, observaciones: e.target.value }))} maxLength={200} />

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
