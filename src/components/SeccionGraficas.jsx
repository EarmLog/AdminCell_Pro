'use client';

/**
 * ============================================================================
 *  SECCIÓN DE GRÁFICAS (SVG, sin librerías externas)
 * ----------------------------------------------------------------------------
 *  Recibe un arreglo de grupos con { etiqueta, personas, asistencias, porcentaje }
 *  y dibuja:
 *    - Barras agrupadas de Personas vs. Asistencias.
 *    - Barras del % de asistencia con color de semáforo.
 *  Todas son imprimibles (se conservan al imprimir).
 * ============================================================================
 */
import { nivelPorcentaje } from '@/components/SemaforoPorcentaje';

const AZUL = '#3b82f6';
const TEAL = '#14b8a6';
const VERDE = '#22c55e';
const AMBAR = '#f59e0b';
const ROJO = '#ef4444';

function colorPorcentaje(valor) {
  const { nivel } = nivelPorcentaje(valor);
  if (nivel === 'bajo') return ROJO;
  if (nivel === 'medio') return AMBAR;
  return VERDE;
}

function GraficaBarras({ datos, titulo }) {
  const maximo = Math.max(1, ...datos.map((d) => Math.max(d.personas, d.asistencias)));
  const alto = 180;
  const anchoGrupo = 64;

  return (
    <figure className="evitar-corte">
      <figcaption className="mb-2 text-sm font-medium text-slate-600 dark:text-slate-300">{titulo}</figcaption>
      <div className="overflow-x-auto">
        <svg width={Math.max(datos.length * anchoGrupo, 240)} height={alto + 40} role="img" aria-label={titulo}>
          {datos.map((d, i) => {
            const x = i * anchoGrupo + 12;
            const altoPersonas = (d.personas / maximo) * alto;
            const altoAsistencias = (d.asistencias / maximo) * alto;
            return (
              <g key={d.etiqueta + i}>
                <rect x={x} y={alto - altoPersonas} width={18} height={altoPersonas} fill={AZUL} rx={3} />
                <rect
                  x={x + 20}
                  y={alto - altoAsistencias}
                  width={18}
                  height={altoAsistencias}
                  fill={TEAL}
                  rx={3}
                />
                <text x={x + 18} y={alto + 16} textAnchor="middle" className="fill-slate-500" fontSize="10">
                  {String(d.etiqueta).slice(0, 9)}
                </text>
              </g>
            );
          })}
          <line x1={0} y1={alto} x2={Math.max(datos.length * anchoGrupo, 240)} y1={alto} y2={alto} stroke="#cbd5e1" />
        </svg>
      </div>
      <div className="mt-2 flex gap-4 text-xs text-slate-500 dark:text-slate-400">
        <span className="flex items-center gap-1">
          <span className="inline-block h-2.5 w-3 rounded-sm" style={{ background: AZUL }} /> Personas
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-2.5 w-3 rounded-sm" style={{ background: TEAL }} /> Asistencias
        </span>
      </div>
    </figure>
  );
}

function GraficaPorcentajes({ datos, titulo }) {
  const alto = 180;
  const anchoGrupo = 56;

  return (
    <figure className="evitar-corte">
      <figcaption className="mb-2 text-sm font-medium text-slate-600 dark:text-slate-300">{titulo}</figcaption>
      <div className="overflow-x-auto">
        <svg width={Math.max(datos.length * anchoGrupo, 240)} height={alto + 40} role="img" aria-label={titulo}>
          <line x1={0} y1={alto * 0.3} x2="100%" y2={alto * 0.3} stroke="#e2e8f0" strokeDasharray="4 4" />
          {datos.map((d, i) => {
            const x = i * anchoGrupo + 12;
            const valor = Math.min(Math.max(d.porcentaje || 0, 0), 1);
            const altoBarra = valor * alto;
            return (
              <g key={d.etiqueta + i}>
                <rect
                  x={x}
                  y={alto - altoBarra}
                  width={28}
                  height={altoBarra}
                  fill={colorPorcentaje(d.porcentaje)}
                  rx={3}
                />
                <text x={x + 14} y={alto - altoBarra - 5} textAnchor="middle" fontSize="11" fill="#64748b">
                  {Math.round(valor * 100)}%
                </text>
                <text x={x + 14} y={alto + 18} textAnchor="middle" fontSize="11" fill="#64748b">
                  {d.etiqueta}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </figure>
  );
}

export default function SeccionGraficas({ datos = [], etiquetaBarras = 'Comparación', etiquetaPorcentajes = '% de asistencia' }) {
  if (!datos.length) return null;
  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <GraficaBarras datos={datos} titulo={etiquetaBarras} />
      <GraficaPorcentajes datos={datos} titulo={etiquetaPorcentajes} />
    </div>
  );
}
