'use client';

/**
 * ============================================================================
 *  MODAL DE CONFIRMACIÓN
 * ----------------------------------------------------------------------------
 *  Pide confirmación antes de una acción destructiva (por ejemplo, eliminar).
 * ============================================================================
 */
import Modal from '@/components/ui/Modal';
import Boton from '@/components/ui/Boton';
import { IconoAlerta } from '@/components/Iconos';

export default function ModalConfirmar({ abierto, titulo, mensaje, onConfirmar, onCancelar, textoConfirmar = 'Eliminar' }) {
  return (
    <Modal abierto={abierto} titulo={titulo || 'Confirmar acción'} onCerrar={onCancelar} ancho="max-w-md">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 rounded-full bg-red-100 p-2 text-red-600 dark:bg-red-900/50 dark:text-red-300">
          <IconoAlerta size={20} />
        </span>
        <p className="text-sm text-slate-600 dark:text-slate-300">{mensaje}</p>
      </div>
      <div className="mt-5 flex justify-end gap-2">
        <Boton variante="secundario" onClick={onCancelar}>
          Cancelar
        </Boton>
        <Boton variante="peligro" onClick={onConfirmar}>
          {textoConfirmar}
        </Boton>
      </div>
    </Modal>
  );
}
