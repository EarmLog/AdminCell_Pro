/**
 * ============================================================================
 *  CAMPOS DE FORMULARIO
 * ----------------------------------------------------------------------------
 *  Envoltorios con la etiqueta y los estilos comunes para inputs de texto,
 *  números y áreas de texto.
 * ============================================================================
 */

const CLASE_BASE =
  'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 ' +
  'placeholder:text-slate-400 focus:border-marca-500 focus:outline-none focus:ring-1 focus:ring-marca-500 ' +
  'dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100';

function Etiqueta({ htmlFor, texto, requerido }) {
  if (!texto) return null;
  return (
    <label htmlFor={htmlFor} className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">
      {texto}
      {requerido && <span className="ml-0.5 text-red-500">*</span>}
    </label>
  );
}

export function Campo({ id, etiqueta, requerido, ayuda, className = '', ...resto }) {
  return (
    <div className={className}>
      <Etiqueta htmlFor={id} texto={etiqueta} requerido={requerido} />
      <input id={id} className={CLASE_BASE} {...resto} />
      {ayuda && <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{ayuda}</p>}
    </div>
  );
}

export function AreaTexto({ id, etiqueta, requerido, ayuda, className = '', ...resto }) {
  return (
    <div className={className}>
      <Etiqueta htmlFor={id} texto={etiqueta} requerido={requerido} />
      <textarea id={id} rows={3} className={`${CLASE_BASE} resize-y`} {...resto} />
      {ayuda && <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{ayuda}</p>}
    </div>
  );
}
