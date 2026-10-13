'use client';

/**
 * ============================================================================
 *  CONTEXTO DE NOTIFICACIONES (avisos flotantes)
 * ----------------------------------------------------------------------------
 *  Expone `notificar(mensaje, tipo)` para mostrar mensajes de éxito, error o
 *  información. Los avisos desaparecen solos después de unos segundos.
 * ============================================================================
 */
import { createContext, useCallback, useContext, useRef, useState } from 'react';

const NotificacionesContext = createContext(null);

export function ProveedorNotificaciones({ children }) {
  const [avisos, setAvisos] = useState([]);
  const contador = useRef(0);

  const cerrar = useCallback((id) => {
    setAvisos((lista) => lista.filter((aviso) => aviso.id !== id));
  }, []);

  const notificar = useCallback(
    (mensaje, tipo = 'exito') => {
      contador.current += 1;
      const id = contador.current;
      setAvisos((lista) => [...lista, { id, mensaje, tipo }]);
      setTimeout(() => cerrar(id), 3500);
    },
    [cerrar]
  );

  return (
    <NotificacionesContext.Provider value={{ notificar }}>
      {children}
      {/* Capa de avisos flotantes. */
      }
      <div className="no-imprimir pointer-events-none fixed bottom-4 right-4 z-[60] flex w-full max-w-sm flex-col gap-2">
        {avisos.map((aviso) => (
          <div
            key={aviso.id}
            className={`pointer-events-auto animate-entrada-suave rounded-lg px-4 py-3 text-sm font-medium text-white shadow-lg ${
              aviso.tipo === 'error'
                ? 'bg-red-600'
                : aviso.tipo === 'info'
                  ? 'bg-slate-700'
                  : 'bg-marca-600'
            }`}
          >
            {aviso.mensaje}
          </div>
        ))}
      </div>
    </NotificacionesContext.Provider>
  );
}

export function usarNotificaciones() {
  const contexto = useContext(NotificacionesContext);
  if (!contexto) throw new Error('usarNotificaciones debe usarse dentro de ProveedorNotificaciones');
  return contexto;
}
