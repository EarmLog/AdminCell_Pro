'use client';

/**
 * ============================================================================
 *  CONTEXTO DE DATOS
 * ----------------------------------------------------------------------------
 *  Carga sectores, períodos y líderes desde la base local, y administra el
 *  "período activo" (el que se usa para registrar reportes). Mantiene sincro-
 *  nizados los componentes tras cada cambio mediante `recargar()`.
 * ============================================================================
 */
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { listarSectores, listarPeriodos, listarLideres } from '@/lib/repositorio';
import { informacionMotor } from '@/lib/db/dbAdapter';

const DatosContext = createContext(null);
const CLAVE_PERIODO = 'admincell:periodoActivo';

export function ProveedorDatos({ children }) {
  const [sectores, setSectores] = useState([]);
  const [periodos, setPeriodos] = useState([]);
  const [lideres, setLideres] = useState([]);
  const [periodoActivo, setPeriodoActivo] = useState(null);
  const [motor, setMotor] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  // Relee todo desde la base de datos.
  const recargar = useCallback(async () => {
    try {
      setError(null);
      const [listaSectores, listaPeriodos, listaLideres] = await Promise.all([
        listarSectores(),
        listarPeriodos(),
        listarLideres()
      ]);
      setSectores(listaSectores);
      setPeriodos(listaPeriodos);
      setLideres(listaLideres);

      // Restaura el período activo guardado; si ya no existe, usa el último.
      const guardado = Number(localStorage.getItem(CLAVE_PERIODO));
      const existe = listaPeriodos.some((p) => p.id === guardado);
      setPeriodoActivo(existe ? guardado : listaPeriodos.at(-1)?.id ?? null);
    } catch (e) {
      console.error('Error al cargar datos:', e);
      setError(e);
    } finally {
      setCargando(false);
    }
  }, []);

  // Primera carga + datos del motor de base de datos en uso.
  useEffect(() => {
    recargar();
    informacionMotor().then(setMotor).catch(() => {});
  }, [recargar]);

  // Guarda el período activo cuando cambia.
  useEffect(() => {
    if (periodoActivo) localStorage.setItem(CLAVE_PERIODO, String(periodoActivo));
  }, [periodoActivo]);

  const periodoSeleccionado = periodos.find((p) => p.id === periodoActivo) || null;

  return (
    <DatosContext.Provider
      value={{
        sectores,
        periodos,
        lideres,
        periodoActivo,
        periodoSeleccionado,
        setPeriodoActivo,
        motor,
        cargando,
        error,
        recargar
      }}
    >
      {children}
    </DatosContext.Provider>
  );
}

export function usarDatos() {
  const contexto = useContext(DatosContext);
  if (!contexto) throw new Error('usarDatos debe usarse dentro de ProveedorDatos');
  return contexto;
}
