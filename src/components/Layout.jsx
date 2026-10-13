'use client';

/**
 * ============================================================================
 *  LAYOUT DE LA APLICACIÓN (navegación)
 * ----------------------------------------------------------------------------
 *  - Escritorio: barra lateral fija con los módulos.
 *  - Móvil: barra superior con menú desplegable.
 *  Incluye el selector de período activo y el interruptor de tema claro/oscuro.
 * ============================================================================
 */
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { usarDatos } from '@/context/DatosContext';
import { usarTema } from '@/context/TemaContext';
import Selector from '@/components/ui/Selector';
import {
  IconoInicio,
  IconoSectores,
  IconoPeriodo,
  IconoReporte,
  IconoLider,
  IconoAnalisis,
  IconoAjustes,
  IconoSol,
  IconoLuna,
  IconoMenu,
  IconoCerrar
} from '@/components/Iconos';

const MODULOS = [
  { href: '/', etiqueta: 'Inicio', Icono: IconoInicio },
  { href: '/periodos/', etiqueta: 'Períodos', Icono: IconoPeriodo },
  { href: '/sectores/', etiqueta: 'Sectores', Icono: IconoSectores },
  { href: '/reportes/', etiqueta: 'Reportes', Icono: IconoReporte },
  { href: '/lideres/', etiqueta: 'Líderes', Icono: IconoLider },
  { href: '/analisis-general/', etiqueta: 'Análisis General', Icono: IconoAnalisis },
  { href: '/analisis-periodo/', etiqueta: 'Análisis por Período', Icono: IconoAnalisis },
  { href: '/ajustes/', etiqueta: 'Ajustes', Icono: IconoAjustes }
];

function enlaceActivo(pathname, href) {
  if (href === '/') return pathname === '/' || pathname === '';
  return pathname.startsWith(href.replace(/\/$/, ''));
}

function SelectorPeriodo() {
  const { periodos, periodoActivo, setPeriodoActivo } = usarDatos();
  if (!periodos.length) return null;
  return (
    <div className="w-full">
      <Selector
        id="periodo-activo"
        etiqueta="Período activo"
        value={periodoActivo ?? ''}
        onChange={(e) => setPeriodoActivo(Number(e.target.value))}
        opciones={periodos.map((p) => ({ valor: p.id, etiqueta: p.nombre }))}
      />
    </div>
  );
}

function BotonTema() {
  const { oscuro, alternarTema } = usarTema();
  return (
    <button
      type="button"
      onClick={alternarTema}
      className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"
      title={oscuro ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
    >
      {oscuro ? <IconoSol size={20} /> : <IconoLuna size={20} />}
    </button>
  );
}

function Enlaces({ pathname, alNavegar }) {
  return (
    <nav className="flex flex-col gap-1">
      {MODULOS.map(({ href, etiqueta, Icono }) => {
        const activo = enlaceActivo(pathname, href);
        return (
          <Link
            key={href}
            href={href}
            onClick={alNavegar}
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
              activo
                ? 'bg-marca-600 text-white'
                : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700'
            }`}
          >
            <Icono size={19} />
            {etiqueta}
          </Link>
        );
      })}
    </nav>
  );
}

export default function Layout({ children }) {
  const pathname = usePathname();
  const [menuAbierto, setMenuAbierto] = useState(false);

  // Cierra el menú móvil cada vez que cambia la ruta.
  useEffect(() => {
    setMenuAbierto(false);
  }, [pathname]);

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900">
      {/* Barra superior (móvil) */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 lg:hidden dark:border-slate-700 dark:bg-slate-800 no-imprimir">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setMenuAbierto((v) => !v)}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700"
            aria-label="Abrir menú"
          >
            {menuAbierto ? <IconoCerrar size={20} /> : <IconoMenu size={20} />}
          </button>
          <span className="font-semibold text-slate-800 dark:text-slate-100">AdminCell Pro</span>
        </div>
        <BotonTema />
      </header>

      {/* Menú desplegable (móvil) */}
      {menuAbierto && (
        <div className="border-b border-slate-200 bg-white px-4 py-3 lg:hidden dark:border-slate-700 dark:bg-slate-800 no-imprimir">
          <SelectorPeriodo />
          <div className="mt-3">
            <Enlaces pathname={pathname} alNavegar={() => setMenuAbierto(false)} />
          </div>
        </div>
      )}

      <div className="lg:flex">
        {/* Barra lateral (escritorio) */}
        <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-white p-4 lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col lg:overflow-y-auto dark:border-slate-700 dark:bg-slate-800 no-imprimir">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-lg font-bold text-marca-700 dark:text-marca-300">AdminCell Pro</span>
            <BotonTema />
          </div>
          <div className="mb-4">
            <SelectorPeriodo />
          </div>
          <Enlaces pathname={pathname} />
          <div className="mt-auto pt-4 text-xs text-slate-400">Datos guardados localmente en su dispositivo.</div>
        </aside>

        {/* Contenido */}
        <main className="contenido-imprimible min-w-0 flex-1 p-4 lg:p-6">
          <div className="mx-auto w-full max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
