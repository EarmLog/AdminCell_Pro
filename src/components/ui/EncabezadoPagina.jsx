/**
 * ============================================================================
 *  ENCABEZADO DE PÁGINA
 * ----------------------------------------------------------------------------
 *  Título, descripción y acciones (botones) comunes a todos los módulos.
 * ============================================================================
 */

export default function EncabezadoPagina({ titulo, descripcion, acciones }) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between no-imprimir">
      <div>
        <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">{titulo}</h1>
        {descripcion && <p className="text-sm text-slate-500 dark:text-slate-400">{descripcion}</p>}
      </div>
      {acciones && <div className="flex flex-wrap items-center gap-2">{acciones}</div>}
    </div>
  );
}
