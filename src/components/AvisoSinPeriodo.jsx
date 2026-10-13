'use client';

/**
 * ============================================================================
 *  AVISO "SIN PERÍODO"
 * ----------------------------------------------------------------------------
 *  Recuerda al usuario que primero debe crear un período antes de registrar
 *  o analizar reportes.
 * ============================================================================
 */
import Link from 'next/link';
import { IconoPeriodo } from '@/components/Iconos';

export default function AvisoSinPeriodo() {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-amber-300 bg-amber-50 px-6 py-12 text-center dark:border-amber-700 dark:bg-amber-950/40">
      <span className="rounded-full bg-amber-100 p-3 text-amber-600 dark:bg-amber-900 dark:text-amber-300">
        <IconoPeriodo size={26} />
      </span>
      <h3 className="text-base font-semibold text-amber-800 dark:text-amber-200">Todavía no hay períodos</h3>
      <p className="max-w-md text-sm text-amber-700 dark:text-amber-300/90">
        Cree un período antes de registrar reportes. Los reportes y los análisis se organizan por período.
      </p>
      <Link
        href="/periodos/"
        className="mt-1 rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700"
      >
        Ir a Períodos
      </Link>
    </div>
  );
}
