/**
 * ============================================================================
 *  ICONOS
 * ----------------------------------------------------------------------------
 *  Conjunto de íconos SVG en línea (sin dependencias externas). Todos heredan
 *  el color con `currentColor` y aceptan `className`/`size`.
 * ============================================================================
 */

function Icono({ children, size = 20, className = '', ...resto }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...resto}
    >
      {children}
    </svg>
  );
}

export const IconoInicio = (p) => (
  <Icono {...p}>
    <path d="M3 10.5 12 3l9 7.5" />
    <path d="M5 9.5V21h14V9.5" />
  </Icono>
);

export const IconoSectores = (p) => (
  <Icono {...p}>
    <rect x="3" y="3" width="7" height="7" rx="1.5" />
    <rect x="14" y="3" width="7" height="7" rx="1.5" />
    <rect x="3" y="14" width="7" height="7" rx="1.5" />
    <rect x="14" y="14" width="7" height="7" rx="1.5" />
  </Icono>
);

export const IconoPeriodo = (p) => (
  <Icono {...p}>
    <rect x="3" y="4.5" width="18" height="16" rx="2" />
    <path d="M3 9h18M8 3v3M16 3v3" />
  </Icono>
);

export const IconoReporte = (p) => (
  <Icono {...p}>
    <path d="M6 3h9l4 4v14H6z" />
    <path d="M15 3v4h4" />
    <path d="M9 13h6M9 17h6" />
  </Icono>
);

export const IconoLider = (p) => (
  <Icono {...p}>
    <circle cx="12" cy="8" r="3.5" />
    <path d="M5 20c0-3.5 3-6 7-6s7 2.5 7 6" />
  </Icono>
);

export const IconoAnalisis = (p) => (
  <Icono {...p}>
    <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
  </Icono>
);

export const IconoAjustes = (p) => (
  <Icono {...p}>
    <circle cx="12" cy="12" r="3" />
    <path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1" />
  </Icono>
);

export const IconoRegistro = (p) => (
  <Icono {...p}>
    <path d="M6 3h9l4 4v14H6z" />
    <path d="M15 3v4h4" />
    <path d="M9 12h6M9 16h4" />
    <path d="M9 8h2" />
  </Icono>
);

export const IconoPause = (p) => (
  <Icono {...p}>
    <rect x="6" y="5" width="4" height="14" rx="1" />
    <rect x="14" y="5" width="4" height="14" rx="1" />
  </Icono>
);

export const IconoPlay = (p) => (
  <Icono {...p}>
    <path d="M7 5l12 7-12 7z" />
  </Icono>
);

export const IconoSol = (p) => (
  <Icono {...p}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M19.1 4.9l-1.4 1.4M6.3 17.7l-1.4 1.4" />
  </Icono>
);

export const IconoLuna = (p) => (
  <Icono {...p}>
    <path d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5z" />
  </Icono>
);

export const IconoMas = (p) => (
  <Icono {...p}>
    <path d="M12 5v14M5 12h14" />
  </Icono>
);

export const IconoEditar = (p) => (
  <Icono {...p}>
    <path d="M4 20h4l10-10-4-4L4 16z" />
    <path d="M13.5 6.5l4 4" />
  </Icono>
);

export const IconoEliminar = (p) => (
  <Icono {...p}>
    <path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" />
  </Icono>
);

export const IconoImprimir = (p) => (
  <Icono {...p}>
    <path d="M6 9V3h12v6" />
    <rect x="3" y="9" width="18" height="8" rx="2" />
    <path d="M6 14h12v7H6z" />
  </Icono>
);

export const IconoCerrar = (p) => (
  <Icono {...p}>
    <path d="M6 6l12 12M18 6L6 18" />
  </Icono>
);

export const IconoBuscar = (p) => (
  <Icono {...p}>
    <circle cx="11" cy="11" r="6.5" />
    <path d="M20 20l-3.5-3.5" />
  </Icono>
);

export const IconoDescargar = (p) => (
  <Icono {...p}>
    <path d="M12 3v12M7 10l5 5 5-5M5 21h14" />
  </Icono>
);

export const IconoSubir = (p) => (
  <Icono {...p}>
    <path d="M12 21V9M7 14l5-5 5 5M5 3h14" />
  </Icono>
);

export const IconoAuto = (p) => (
  <Icono {...p}>
    <path d="M12 3v3M12 18v3M3 12h3M18 12h3" />
    <path d="M13.5 6.5l4 4-9 9-4-4z" />
  </Icono>
);

export const IconoMenu = (p) => (
  <Icono {...p}>
    <path d="M4 6h16M4 12h16M4 18h16" />
  </Icono>
);

export const IconoGuardar = (p) => (
  <Icono {...p}>
    <path d="M5 3h11l3 3v15H5z" />
    <path d="M8 3v6h7V3M8 21v-6h8v6" />
  </Icono>
);

export const IconoCheck = (p) => (
  <Icono {...p}>
    <path d="M5 13l4 4L19 7" />
  </Icono>
);

export const IconoAlerta = (p) => (
  <Icono {...p}>
    <path d="M12 3l9 16H3z" />
    <path d="M12 9v5M12 17h.01" />
  </Icono>
);
