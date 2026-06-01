<?php

namespace App\Services;

use Carbon\Carbon;

class ColombianHolidayService
{
    public function addBusinessDays(Carbon $date, int $businessDays): Carbon
    {
        $result = $date->copy();
        $added = 0;

        while ($added < $businessDays) {
            $result->addDay();
            if ($this->isBusinessDay($result)) {
                $added++;
            }
        }

        return $result;
    }

    public function isBusinessDay(Carbon $date): bool
    {
        if ($date->isWeekend()) {
            return false;
        }

        return !$this->isHoliday($date);
    }

    public function isHoliday(Carbon $date): bool
    {
        $holidays = $this->getHolidays($date->year);

        return in_array($date->format('Y-m-d'), $holidays, true);
    }

    public function getHolidays(int $year): array
    {
        $easter = $this->calculateEaster($year);

        $fixed = [
            "$year-01-01",
            "$year-05-01",
            "$year-07-20",
            "$year-08-07",
            "$year-12-08",
            "$year-12-25",
        ];

        $movableEmiliani = [
            '01-06' => 'Reyes Magos',
            '03-19' => 'San José',
            '06-29' => 'San Pedro y San Pablo',
            '08-15' => 'Asunción',
            '10-12' => 'Día de la Raza',
            '11-01' => 'Todos los Santos',
            '11-11' => 'Independencia de Cartagena',
        ];

        $emilianiHolidays = [];
        foreach ($movableEmiliani as $date => $name) {
            $emilianiHolidays[] = $this->emilianiToMonday($year, $date);
        }

        $easterBased = [
            $easter->copy()->subDays(7)->format('Y-m-d'),     // Domingo de Ramos
            $easter->copy()->subDays(3)->format('Y-m-d'),     // Jueves Santo
            $easter->copy()->subDays(2)->format('Y-m-d'),     // Viernes Santo
            $this->emilianiToDate($easter->copy()->addDays(43)), // Ascensión
            $this->emilianiToDate($easter->copy()->addDays(63)), // Corpus Christi
            $this->emilianiToDate($easter->copy()->addDays(71)), // Sagrado Corazón
        ];

        return array_merge($fixed, $emilianiHolidays, $easterBased);
    }

    private function calculateEaster(int $year): Carbon
    {
        $a = $year % 19;
        $b = intdiv($year, 100);
        $c = $year % 100;
        $d = intdiv($b, 4);
        $e = $b % 4;
        $f = intdiv($b + 8, 25);
        $g = intdiv($b - $f + 1, 3);
        $h = (19 * $a + $b - $d - $g + 15) % 30;
        $i = intdiv($c, 4);
        $k = $c % 4;
        $l = (32 + 2 * $e + 2 * $i - $h - $k) % 7;
        $m = intdiv($a + 11 * $h + 22 * $l, 451);
        $month = intdiv($h + $l - 7 * $m + 114, 31);
        $day = (($h + $l - 7 * $m + 114) % 31) + 1;

        return Carbon::createFromDate($year, $month, $day);
    }

    private function emilianiToMonday(int $year, string $date): string
    {
        $carbonDate = Carbon::createFromFormat('Y-m-d', "$year-$date");
        if ($carbonDate->dayOfWeek !== Carbon::MONDAY) {
            $carbonDate->next(Carbon::MONDAY);
        }

        return $carbonDate->format('Y-m-d');
    }

    private function emilianiToDate(Carbon $date): string
    {
        if ($date->dayOfWeek !== Carbon::MONDAY) {
            $date->next(Carbon::MONDAY);
        }

        return $date->format('Y-m-d');
    }
}
