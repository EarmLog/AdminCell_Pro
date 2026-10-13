/**
 * ============================================================================
 *  SEMÁFORO DE PORCENTAJE
 * ----------------------------------------------------------------------------
 *  Muestra el % de asistencia con un color según su nivel:
 *    - rojo   ... menos de 30 %
 *    - ámbar  ... entre 30 % y 70 %
 *    - verde  ... 70 % o más
 * ============================================================================
 */
import { formatearPorcentaje } from '@/lib/formato';

/** Devuelve la categoría del semáforo para un porcentaje entre 0 y 1. */
export function nivelPorcentaje(porcentaje) {
  if (porcentaje < 0.3) return { nivel: 'bajo', color: 'text-red-600 dark:text-red-400', fondo: 'bg-red-500' };
  if (porcentaje < 0.7) return { nivel: 'medio', color: 'text-amber-600 dark:text-amber-400', fondo: 'bg-amber-500' };
  return { nivel: 'alto', color: 'text-green-600 dark:text-green-400', fondo: 'bg-green-500' };
}

export default function SemaforoPorcentaje({ valor, mostrarBarra = true }) {
  const porcentaje = Number(valor) || 0;
  const { color, fondo } = nivelPorcentaje(porcentaje);
  const ancho = Math.min(Math.max(porcentaje, 0), 1) * 100;

  return (
    <div className="flex min-w-[110px] flex-col gap-1">
      <span className={`text-sm font-semibold ${color}`}>{formatearPorcentaje(porcentaje)}</span>
      {mostrarBarra && (
        <span className="block h-1.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
          <span className={`block h-full rounded-full ${fondo}`} style={{ width: `${ancho}%` }} />
        </span>
      )}
    </div>
  );
}
