import { SOLAR, DEFAULT_TARIFF, HSP_BY_MONTH, MONTH_NAMES } from './solarConstants';

export function dailyProduction(kwp: number): number {
  return kwp * SOLAR.HSP * SOLAR.PR;
}

export function monthlyProduction(kwp: number): number {
  return dailyProduction(kwp) * SOLAR.DAYS_PER_MONTH;
}

export function yearlyProduction(kwp: number): number {
  return dailyProduction(kwp) * SOLAR.DAYS_PER_YEAR;
}

export interface MonthlyBreakdownItem {
  name: string;
  hsp: number;
  kwh: number;
}

export function monthlyBreakdown(kwp: number): MonthlyBreakdownItem[] {
  return HSP_BY_MONTH.map((hsp, idx) => ({
    name: MONTH_NAMES[idx],
    hsp,
    kwh: Math.round(kwp * hsp * SOLAR.DAYS_PER_MONTH * SOLAR.PR),
  }));
}

export function yearlyFromBreakdown(breakdown: MonthlyBreakdownItem[]): number {
  return breakdown.reduce((sum, m) => sum + m.kwh, 0);
}