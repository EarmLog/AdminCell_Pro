/**
 * ============================================================================
 *  TARJETA
 * ----------------------------------------------------------------------------
 *  Contenedor con borde y sombra suave; admite un título/acción de cabecera.
 * ============================================================================
 */

export default function Tarjeta({ titulo, accion, children, className = '', ...resto }) {
  return (
    <section
      className={`rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800 ${className}`}
      {...resto}
    >
      {(titulo || accion) && (
        <header className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-3 dark:border-slate-700">
          {titulo && <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100">{titulo}</h2>}
          {accion && <div className="no-imprimir">{accion}</div>}
        </header>
      )}
      <div className="p-4">{children}</div>
    </section>
  );
}
