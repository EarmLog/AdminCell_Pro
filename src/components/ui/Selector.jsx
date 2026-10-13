/**
 * ============================================================================
 *  SELECTOR (lista desplegable)
 * ----------------------------------------------------------------------------
 *  Recibe `opciones` como arreglo de { valor, etiqueta } o de strings.
 * ============================================================================
 */

const CLASE_BASE =
  'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 ' +
  'focus:border-marca-500 focus:outline-none focus:ring-1 focus:ring-marca-500 ' +
  'dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100';

export default function Selector({ id, etiqueta, requerido, opciones = [], placeholder, className = '', ...resto }) {
  return (
    <div className={className}>
      {etiqueta && (
        <label htmlFor={id} className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">
          {etiqueta}
          {requerido && <span className="ml-0.5 text-red-500">*</span>}
        </label>
      )}
      <select id={id} className={CLASE_BASE} {...resto}>
        {placeholder && <option value="">{placeholder}</option>}
        {opciones.map((opcion) => {
          const valor = typeof opcion === 'object' ? opcion.valor : opcion;
          const texto = typeof opcion === 'object' ? opcion.etiqueta : opcion;
          return (
            <option key={valor} value={valor}>
              {texto}
            </option>
          );
        })}
      </select>
    </div>
  );
}
