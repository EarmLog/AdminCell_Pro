'use client';

/**
 * ============================================================================
 *  MODAL (ventana emergente)
 * ----------------------------------------------------------------------------
 *  Muestra contenido sobre un fondo oscurecido. Se cierra con el botón, con
 *  la tecla Escape o haciendo clic fuera. Bloquea el desplazamiento del fondo.
 * ============================================================================
 */
import { useEffect } from 'react';
import { IconoCerrar } from '@/components/Iconos';

export default function Modal({ abierto, titulo, onCerrar, children, ancho = 'max-w-lg' }) {
  // Cierra con la tecla Escape y evita el scroll del fondo mientras está abierto.
  useEffect(() => {
    if (!abierto) return;
    const alPresionar = (e) => {
      if (e.key === 'Escape') onCerrar?.();
    };
    document.addEventListener('keydown', alPresionar);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', alPresionar);
      document.body.style.overflow = '';
    };
  }, [abierto, onCerrar]);

  if (!abierto) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-900/50 p-4 animate-fundido no-imprimir"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onCerrar?.();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        className={`mt-10 w-full ${ancho} rounded-xl border border-slate-200 bg-white shadow-xl animate-entrada-suave dark:border-slate-700 dark:bg-slate-800`}
      >
        <header className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-slate-700">
          <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100">{titulo}</h2>
          <button
            type="button"
            onClick={onCerrar}
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700"
            aria-label="Cerrar"
          >
            <IconoCerrar size={18} />
          </button>
        </header>
        <div className="px-4 py-4">{children}</div>
      </div>
    </div>
  );
}
