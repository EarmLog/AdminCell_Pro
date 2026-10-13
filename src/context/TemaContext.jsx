'use client';

/**
 * ============================================================================
 *  CONTEXTO DE TEMA (claro / oscuro)
 * ----------------------------------------------------------------------------
 *  Guarda la preferencia del usuario en `localStorage` y aplica/quita la clase
 *  `dark` en <html>, que es la que activa el modo oscuro de Tailwind.
 * ============================================================================
 */
import { createContext, useContext, useEffect, useState } from 'react';

const TemaContext = createContext(null);
const CLAVE = 'admincell:tema';

export function ProveedorTema({ children }) {
  const [oscuro, setOscuro] = useState(false);

  // Al montar, recupera la preferencia guardada (o la del sistema).
  useEffect(() => {
    const guardado = localStorage.getItem(CLAVE);
    const prefiereOscuro =
      guardado !== null ? guardado === 'oscuro' : window.matchMedia('(prefers-color-scheme: dark)').matches;
    setOscuro(prefiereOscuro);
  }, []);

  // Cada vez que cambia, actualiza <html> y guarda la preferencia.
  useEffect(() => {
    document.documentElement.classList.toggle('dark', oscuro);
    localStorage.setItem(CLAVE, oscuro ? 'oscuro' : 'claro');
  }, [oscuro]);

  const alternarTema = () => setOscuro((valor) => !valor);

  return <TemaContext.Provider value={{ oscuro, alternarTema }}>{children}</TemaContext.Provider>;
}

export function usarTema() {
  const contexto = useContext(TemaContext);
  if (!contexto) throw new Error('usarTema debe usarse dentro de ProveedorTema');
  return contexto;
}
