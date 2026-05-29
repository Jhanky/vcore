// Constantes centralizadas para cálculos de generación solar (Colombia)

export const SOLAR = {
  HSP: 4.5,
  PR: 0.80,
  DAYS_PER_MONTH: 30.4,
  DAYS_PER_YEAR: 365,
} as const;

export const DEFAULT_TARIFF = 1000;

// HSP mensual para gráficos (Colombia - regiones Caribe/Andina)
// Basado en datos NASA Solar Insolation
export const HSP_BY_MONTH: readonly number[] = [3.8, 4.0, 4.2, 4.3, 4.1, 3.9, 3.8, 4.0, 4.2, 4.4, 4.1, 3.9] as const;

export const MONTH_NAMES: readonly string[] = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'] as const;