<?php

namespace App\Services;

final class SolarProductionCalculator
{
    public static function daily(float $powerKwp, ?float $hsp = null, ?float $pr = null): float
    {
        $hsp = $hsp ?? SolarConstants::HSP;
        $pr = $pr ?? SolarConstants::PERFORMANCE_RATIO;

        return $powerKwp * $hsp * $pr;
    }

    public static function monthly(float $powerKwp, ?float $hsp = null, ?float $pr = null): float
    {
        return self::daily($powerKwp, $hsp, $pr) * SolarConstants::DAYS_PER_MONTH;
    }

    public static function yearly(float $powerKwp, ?float $hsp = null, ?float $pr = null): float
    {
        return self::daily($powerKwp, $hsp, $pr) * SolarConstants::DAYS_PER_YEAR;
    }

    public static function monthlyBreakdown(float $powerKwp, ?float $pr = null): array
    {
        $pr = $pr ?? SolarConstants::PERFORMANCE_RATIO;
        $result = [];

        foreach (SolarConstants::HSP_BY_MONTH as $idx => $hsp) {
            $result[] = [
                'name' => SolarConstants::MONTH_NAMES[$idx],
                'hsp' => $hsp,
                'kwh' => (int) round($powerKwp * $hsp * SolarConstants::DAYS_PER_MONTH * $pr),
            ];
        }

        return $result;
    }
}
