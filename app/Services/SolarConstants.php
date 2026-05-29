<?php

namespace App\Services;

/**
 * Constantes centralizadas para cálculos de generación solar en Colombia.
 */
final class SolarConstants
{
    // Factores climáticos
    public const HSP = 4.5;

    public const PERFORMANCE_RATIO = 0.80;

    // Factores temporales
    public const DAYS_PER_MONTH = 30.4;

    public const DAYS_PER_YEAR = 365;

    // Tarifas y financiero
    public const TARIFF_COP = 1000.0;

    public const TARIFF_ANNUAL_INCREASE = 0.08;

    public const PANEL_DEGRADATION = 0.005;

    public const PROJECTION_YEARS = 20;

    // HSP mensual para gráficos (Colombia)
    public const HSP_BY_MONTH = [
        3.8, 4.0, 4.2, 4.3, 4.1, 3.9,
        3.8, 4.0, 4.2, 4.4, 4.1, 3.9,
    ];

    public const MONTH_NAMES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
}
