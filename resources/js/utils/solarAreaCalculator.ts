// Base de datos de dimensiones de paneles solares (mm)
// Fuente: dimensiones estándar de fabricantes comunes en Colombia

export const PANEL_DIMS: Record<number, { largo: number; ancho: number }> = {
  400:  { largo: 1722, ancho: 1134 },
  430:  { largo: 1762, ancho: 1134 },
  450:  { largo: 1903, ancho: 1134 },
  480:  { largo: 1965, ancho: 1134 },
  500:  { largo: 2094, ancho: 1038 },
  530:  { largo: 2172, ancho: 1096 },
  550:  { largo: 2256, ancho: 1133 },
  580:  { largo: 2278, ancho: 1134 },
  600:  { largo: 2278, ancho: 1134 },
  620:  { largo: 2384, ancho: 1134 },
  650:  { largo: 2384, ancho: 1303 },
  660:  { largo: 2384, ancho: 1303 },
  700:  { largo: 2465, ancho: 1340 },
  720:  { largo: 2465, ancho: 1340 },
};

export function getPanelDims(powerW: number): { largo: number; ancho: number } {
  const exact = PANEL_DIMS[powerW];
  if (exact) return exact;

  const powers = Object.keys(PANEL_DIMS).map(Number).sort((a, b) => a - b);
  const closest = powers.reduce((prev, curr) =>
    (curr <= powerW ? curr : prev)
  );
  return PANEL_DIMS[closest] || { largo: 2278, ancho: 1134 };
}

export interface LayoutResult {
  filas: number;
  cols: number;
  areaNeta: number;
  areaTotal: number;
  largoTotal: number;
  anchoTotal: number;
  potenciaKw: number;
  factorOcupacion: number;
}

function calcularLayoutOptimo(
  cantidad: number,
  panelLargo: number,
  panelAncho: number,
  gapPanel: number,
  gapFila: number,
  margen: number
): { filas: number; cols: number } {
  let mejorLayout = { filas: 1, cols: cantidad };
  let mejorRatio = Infinity;

  for (let filas = 1; filas <= cantidad; filas++) {
    const cols = Math.ceil(cantidad / filas);
    const largoTotal = panelLargo * cols + gapPanel * (cols - 1) + margen * 2;
    const anchoTotal = panelAncho * filas + gapFila * (filas - 1) + margen * 2;
    const ratio = Math.max(largoTotal, anchoTotal) / Math.min(largoTotal, anchoTotal);

    if (ratio < mejorRatio) {
      mejorRatio = ratio;
      mejorLayout = { filas, cols };
    }
  }
  return mejorLayout;
}

export function calcularAreaInstalacion(
  cantidad: number,
  panelPowerW: number,
  orientacion: 'portrait' | 'landscape',
  gapPanel: number = 20,
  gapFila: number = 800,
  margen: number = 500
): LayoutResult {
  const { largo, ancho } = getPanelDims(panelPowerW);
  const pLargo = orientacion === 'portrait' ? largo : ancho;
  const pAncho = orientacion === 'portrait' ? ancho : largo;

  const { filas, cols } = calcularLayoutOptimo(cantidad, pLargo, pAncho, gapPanel, gapFila, margen);

  const largoTotal = (pLargo * cols + gapPanel * (cols - 1) + margen * 2) / 1000;
  const anchoTotal = (pAncho * filas + gapFila * (filas - 1) + margen * 2) / 1000;

  const areaNeta = (largo / 1000) * (ancho / 1000) * cantidad;
  const areaTotal = largoTotal * anchoTotal;
  const factor = (areaNeta / areaTotal) * 100;
  const potenciaKw = (panelPowerW * cantidad) / 1000;

  return {
    filas,
    cols,
    areaNeta: Math.round(areaNeta * 100) / 100,
    areaTotal: Math.round(areaTotal * 100) / 100,
    largoTotal: Math.round(largoTotal * 100) / 100,
    anchoTotal: Math.round(anchoTotal * 100) / 100,
    potenciaKw: Math.round(potenciaKw * 100) / 100,
    factorOcupacion: Math.round(factor * 10) / 10,
  };
}