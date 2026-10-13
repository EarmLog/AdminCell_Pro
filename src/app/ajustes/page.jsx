'use client';

/**
 * ============================================================================
 *  AJUSTES
 * ----------------------------------------------------------------------------
 *  Información del entorno y herramientas de respaldo: exportar/importar la
 *  base de datos en un archivo JSON y vaciar por completo los datos locales.
 * ============================================================================
 */
import { useRef, useState } from 'react';
import { usarDatos } from '@/context/DatosContext';
import { usarNotificaciones } from '@/context/NotificacionesContext';
import { exportarRespaldo, importarRespaldo, vaciarTodo } from '@/lib/repositorio';
import { descargarArchivo } from '@/lib/formato';
import { etiquetaPlataforma } from '@/lib/plataforma';
import EncabezadoPagina from '@/components/ui/EncabezadoPagina';
import Boton from '@/components/ui/Boton';
import Tarjeta from '@/components/ui/Tarjeta';
import ModalConfirmar from '@/components/ui/ModalConfirmar';
import { IconoDescargar, IconoSubir, IconoEliminar } from '@/components/Iconos';

export default function PaginaAjustes() {
  const { motor, recargar } = usarDatos();
  const { notificar } = usarNotificaciones();
  const archivoRef = useRef(null);
  const [confirmarVaciar, setConfirmarVaciar] = useState(false);

  const exportar = async () => {
    try {
      const datos = await exportarRespaldo();
      const fecha = new Date().toISOString().slice(0, 10);
      descargarArchivo(`admincell_respaldo_${fecha}.json`, JSON.stringify(datos, null, 2));
      notificar('Respaldo descargado.');
    } catch {
      notificar('No se pudo generar el respaldo.', 'error');
    }
  };

  const importar = async (e) => {
    const archivo = e.target.files?.[0];
    if (!archivo) return;
    try {
      const contenido = await archivo.text();
      await importarRespaldo(JSON.parse(contenido));
      await recargar();
      notificar('Respaldo importado correctamente.');
    } catch (error) {
      notificar(error.message || 'El archivo no es un respaldo válido.', 'error');
    } finally {
      if (archivoRef.current) archivoRef.current.value = '';
    }
  };

  const vaciar = async () => {
    try {
      await vaciarTodo();
      await recargar();
      notificar('Se eliminaron todos los datos locales.');
    } catch {
      notificar('No se pudieron eliminar los datos.', 'error');
    } finally {
      setConfirmarVaciar(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <EncabezadoPagina titulo="Ajustes" descripcion="Información de la aplicación y gestión de datos." />

      <Tarjeta titulo="Entorno">
        <dl className="grid gap-3 sm:grid-cols-2">
          <div>
            <dt className="text-xs uppercase tracking-wide text-slate-400">Plataforma</dt>
            <dd className="text-sm font-medium text-slate-700 dark:text-slate-200">{etiquetaPlataforma()}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-slate-400">Motor de datos</dt>
            <dd className="text-sm font-medium text-slate-800 dark:text-slate-100">{motor?.nombre || '…'}</dd>
          </div>
        </dl>
        <p className="mt-4 text-xs text-slate-400">
          Toda la información se guarda en este dispositivo. No se envía nada a internet.
        </p>
      </Tarjeta>

      <Tarjeta titulo="Respaldo">
        <p className="mb-3 text-sm text-slate-500 dark:text-slate-400">
          Exporte un archivo con todos sus datos o restaure desde un respaldo anterior.
        </p>
        <div className="flex flex-wrap gap-2">
          <Boton variante="secundario" onClick={exportar}>
            <IconoDescargar size={17} /> Exportar respaldo
          </Boton>
          <Boton variante="secundario" onClick={() => archivoRef.current?.click()}>
            <IconoSubir size={17} /> Importar respaldo
          </Boton>
          <input ref={archivoRef} type="file" accept="application/json,.json" hidden onChange={importar} />
        </div>
      </Tarjeta>

      <Tarjeta titulo="Zona de riesgo">
        <p className="mb-3 text-sm text-slate-500 dark:text-slate-400">
          Elimina sectores, períodos, líderes y reportes de este dispositivo. Esta acción no se puede deshacer.
        </p>
        <Boton variante="peligro" onClick={() => setConfirmarVaciar(true)}>
          <IconoEliminar size={17} /> Borrar todos los datos
        </Boton>
      </Tarjeta>

      <p className="text-center text-xs text-slate-400">
        AdminCell Pro · Plataforma: {motor?.nombre || etiquetaPlataforma()} · Los datos se guardan localmente.
      </p>

      <ModalConfirmar
        abierto={confirmarVaciar}
        titulo="Borrar todos los datos"
        mensaje="¿Está seguro? Se eliminará toda la información guardada en este dispositivo y no se podrá recuperar."
        textoConfirmar="Sí, borrar todo"
        onConfirmar={vaciar}
        onCancelar={() => setConfirmarVaciar(false)}
      />
    </div>
  );
}
