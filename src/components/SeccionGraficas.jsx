'use client';

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

function descargarSVG(svgId, nombre) {
  const svg = document.getElementById(svgId);
  if (!svg) return;
  const data = new XMLSerializer().serializeToString(svg);
  const blob = new Blob([data], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = nombre + '.svg';
  a.click();
  URL.revokeObjectURL(url);
}

function GraficaBarras({ datos, titulo, id }) {
  const maximo = Math.max(1, ...datos.map((d) => Math.max(d.personas, d.asistencias)));
  const alto = 180;
  const anchoGrupo = 64;
  const anchoTotal = Math.max(datos.length * anchoGrupo, 240);
  return (
    <figure className="evitar-corte">
      <div className="mb-2 flex items-center justify-between">
        <figcaption className="text-sm font-medium text-slate-600 dark:text-slate-300">{titulo}</figcaption>
        <div className="flex gap-1 no-imprimir">
          <button type="button" className="rounded px-2 py-1 text-xs border" onClick={() => descargarSVG(id, 'barras')}>PNG/SVG</button>
          <button type="button" className="rounded px-2 py-1 text-xs border" onClick={() => window.print()}>Imprimir</button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <svg id={id} width={anchoTotal} height={alto + 40} role="img" aria-label={titulo}>
          {datos.map((d, i) => {
            const x = i * anchoGrupo + 12;
            const altoPersonas = (d.personas / maximo) * alto;
            const altoAsistencias = (d.asistencias / maximo) * alto;
            return (
              <g key={d.etiqueta + i}>
                <rect x={x} y={alto - altoPersonas} width={18} height={altoPersonas} fill={AZUL} rx={3} />
                <rect x={x + 20} y={alto - altoAsistencias} width={18} height={altoAsistencias} fill={TEAL} rx={3} />
                <text x={x + 18} y={alto + 16} textAnchor="middle" fontSize="10">{String(d.etiqueta).slice(0, 9)}</text>
              </g>
            );
          })}
          <line x1={0} y1={alto} x2={anchoTotal} y2={alto} stroke="#cbd5e1" />
        </svg>
      </div>
    </figure>
  );
}

function GraficaPorcentajes({ datos, titulo, id }) {
  const alto = 180;
  const anchoGrupo = 56;
  const anchoTotal = Math.max(datos.length * anchoGrupo, 240);
  return (
    <figure className="evitar-corte">
      <div className="mb-2 flex items-center justify-between">
        <figcaption className="text-sm font-medium text-slate-600 dark:text-slate-300">{titulo}</figcaption>
        <div className="flex gap-1 no-imprimir">
          <button type="button" className="rounded px-2 py-1 text-xs border" onClick={() => descargarSVG(id, 'porcentajes')}>PNG/SVG</button>
          <button type="button" className="rounded px-2 py-1 text-xs border" onClick={() => window.print()}>Imprimir</button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <svg id={id} width={anchoTotal} height={alto + 40} role="img" aria-label={titulo}>
          <line x1={0} y1={alto * 0.3} x2="100%" y2={alto * 0.3} stroke="#e2e8f0" strokeDasharray="4 4" />
          {datos.map((d, i) => {
            const x = i * anchoGrupo + 12;
            const valor = Math.min(Math.max(d.porcentaje || 0, 0), 1);
            const altoBarra = valor * alto;
            return (
              <g key={d.etiqueta + i}>
                <rect x={x} y={alto - altoBarra} width={28} height={altoBarra} fill={colorPorcentaje(d.porcentaje)} rx={3} />
                <text x={x + 14} y={alto - altoBarra - 5} textAnchor="middle" fontSize="11" fill="#64748b">{Math.round(valor * 100)}%</text>
                <text x={x + 14} y={alto + 18} textAnchor="middle" fontSize="11" fill="#64748b">{d.etiqueta}</text>
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
      <GraficaBarras datos={datos} titulo={etiquetaBarras} id="graf-barras" />
      <GraficaPorcentajes datos={datos} titulo={etiquetaPorcentajes} id="graf-porc" />
    </div>
  );
}
