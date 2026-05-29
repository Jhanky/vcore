<?php

namespace App\Services;

use App\Models\Quotation;

class ProposalService
{
    private const DEFAULT_PAYMENT_PLAN = [
        ['label' => 'Anticipo — Firma del contrato',                  'pct' => 0.40, 'payer' => 'Cliente'],
        ['label' => 'Inicio de la instalación',                       'pct' => 0.40, 'payer' => 'Cliente'],
        ['label' => 'Entrega del proyecto y puesta en marcha',        'pct' => 0.20, 'payer' => 'Cliente'],
    ];

    /**
     * Build all data needed to render the proposal PDF.
     */
    public function buildProposalData(Quotation $quotation): array
    {
        $quotation->load(['client', 'user', 'products', 'items']);

        // ── Component summary ───────────────────────────────
        $panels = [];
        $inverters = [];
        $batteries = [];
        $panelKwp = 0;
        $invKw = 0;

        foreach ($quotation->products as $p) {
            $power = $p->snapshot_specs['power'] ?? 0;
            if ($p->product_type === 'panel') {
                $panelKwp += ($p->quantity * $power) / 1000;
                $panels[] = $p;
            } elseif ($p->product_type === 'inverter') {
                $invKw += ($p->quantity * $power);
                $inverters[] = $p;
            } elseif ($p->product_type === 'battery') {
                $batteries[] = $p;
            }
        }

        // ── Production estimates ────────────────────────────
        $annualKwh = $panelKwp * SolarConstants::HSP * SolarConstants::DAYS_PER_YEAR * SolarConstants::PERFORMANCE_RATIO;
        $monthlyKwh = $annualKwh / 12;
        $annualSavings = $annualKwh * SolarConstants::TARIFF_COP;

        // ── Financial projection (20 years) ─────────────────
        $totalValue = $quotation->total_value ?: 0;
        $advancePct = self::DEFAULT_PAYMENT_PLAN[0]['pct'];
        $clientInvestment = $totalValue * $advancePct;

        $projection = $this->buildProjection(
            $panelKwp,
            $totalValue,
            $clientInvestment
        );

        // ── Payment plan ────────────────────────────────────
        $paymentPlan = array_map(function ($item) use ($totalValue) {
            return [
                'label' => $item['label'],
                'pct' => $item['pct'],
                'value' => $totalValue * $item['pct'],
                'payer' => $item['payer'],
            ];
        }, self::DEFAULT_PAYMENT_PLAN);

        // ── Components table ────────────────────────────────
        $components = [];
        foreach ($inverters as $inv) {
            $components[] = [
                'item' => "{$inv->snapshot_brand} {$inv->snapshot_model}",
                'quantity' => $inv->quantity,
                'description' => 'Inversores on-grid: convierten energía DC a AC, gestión de inyección a red. Garantía de fábrica.',
            ];
        }

        $totalPanels = 0;
        foreach ($panels as $p) {
            $power = $p->snapshot_specs['power'] ?? '';
            $kwp = ($p->quantity * $power) / 1000;
            $totalPanels += $p->quantity;
            $components[] = [
                'item' => "Paneles solares {$power} W",
                'quantity' => $p->quantity,
                'description' => 'Módulos fotovoltaicos de alta eficiencia (~'.number_format($kwp, 2, ',', '.').' kWp instalados); captan y convierten la energía solar.',
            ];
        }

        foreach ($batteries as $bat) {
            $cap = $bat->snapshot_specs['capacity'] ?? '?';
            $vol = $bat->snapshot_specs['voltage'] ?? '?';
            $components[] = [
                'item' => "Batería {$bat->snapshot_brand} {$cap}Ah {$vol}V",
                'quantity' => $bat->quantity,
                'description' => 'Sistema de almacenamiento de energía de ciclo profundo.',
            ];
        }

        // Add standard items
        $components[] = [
            'item' => 'Estructura de soporte',
            'quantity' => $totalPanels > 0 ? $totalPanels : 1,
            'description' => 'Perfiles y anclajes para fijación segura de módulos sobre cubierta.',
        ];
        $components[] = [
            'item' => 'Sistema de monitoreo',
            'quantity' => 1,
            'description' => 'Plataforma de monitoreo en tiempo real de generación solar y consumo energético.',
        ];
        $components[] = [
            'item' => 'Material eléctrico',
            'quantity' => 1,
            'description' => 'Cableado DC/AC, protecciones, canalización y accesorios de conexión.',
        ];
        $components[] = [
            'item' => 'Mano de obra',
            'quantity' => 1,
            'description' => 'Instalación mecánica y eléctrica, montaje y puesta en marcha del sistema.',
        ];
        $components[] = [
            'item' => 'Legalización ante operador',
            'quantity' => 1,
            'description' => 'Gestión de requisitos y documentación para conexión e interconexión a la red.',
        ];
        $components[] = [
            'item' => 'Medidor bidireccional',
            'quantity' => 1,
            'description' => 'Cambio de medidor convencional a medidor bidireccional para generación neta.',
        ];
        $components[] = [
            'item' => 'RETIE',
            'quantity' => 1,
            'description' => 'Cumplimiento normativo, certificación e inspección eléctrica según RETIE vigente.',
        ];

        // ── Reference code for header ───────────────────────
        $refCode = 'FV-'.number_format($panelKwp, 2).'kWp-'.date('Y', strtotime($quotation->issue_date ?? now()));

        return [
            'quotation' => $quotation,
            'client' => $quotation->client,
            'refCode' => $refCode,
            'panelKwp' => $panelKwp,
            'invKw' => $invKw,
            'annualKwh' => $annualKwh,
            'monthlyKwh' => $monthlyKwh,
            'annualSavings' => $annualSavings,
            'components' => $components,
            'paymentPlan' => $paymentPlan,
            'projection' => $projection,
            'panels' => $panels,
            'inverters' => $inverters,
            'batteries' => $batteries,
            'panelCount' => $quotation->panel_count ?: array_sum(array_column($panels, 'quantity')),
        ];
    }

    /**
     * Build a 20-year projection table.
     */
    private function buildProjection(float $panelKwp, float $totalValue, float $clientInvestment): array
    {
        $rows = [];
        $cumSavings = 0;
        $paybackMonth = null;
        $tariff = SolarConstants::TARIFF_COP;
        $production = $panelKwp * SolarConstants::HSP * SolarConstants::DAYS_PER_YEAR * SolarConstants::PERFORMANCE_RATIO;

        for ($year = 1; $year <= SolarConstants::PROJECTION_YEARS; $year++) {
            // Apply degradation from year 2 onward
            if ($year > 1) {
                $production *= (1 - SolarConstants::PANEL_DEGRADATION);
            }

            // Tariff increases each year
            if ($year > 1) {
                $tariff *= (1 + SolarConstants::TARIFF_ANNUAL_INCREASE);
            }

            $yearSavings = $production * $tariff;
            $cumSavings += $yearSavings;
            $roi = $clientInvestment > 0 ? (($cumSavings - $clientInvestment) / $clientInvestment) * 100 : 0;

            // Detect payback month
            $isPaybackYear = false;
            if ($paybackMonth === null && $cumSavings >= $clientInvestment) {
                // Approximate the month within the year
                $prevCum = $cumSavings - $yearSavings;
                $remaining = $clientInvestment - $prevCum;
                $monthsIn = $remaining > 0 ? ceil(($remaining / $yearSavings) * 12) : 1;
                $paybackMonth = ($year - 1) * 12 + $monthsIn;
                $isPaybackYear = true;
            }

            $rows[] = [
                'year' => $year,
                'production' => round($production),
                'tariff' => round($tariff),
                'savings' => round($yearSavings),
                'cumSavings' => round($cumSavings),
                'roi' => round($roi, 1),
                'isPayback' => $isPaybackYear,
                'isHighlight' => in_array($year, [1, 3, 5, 10, 15, 20]),
            ];
        }

        // Summary indicators
        $paybackYears = $paybackMonth !== null ? round($paybackMonth / 12, 1) : null;
        $savings10 = $rows[9]['cumSavings'] ?? 0;
        $savings20 = $rows[19]['cumSavings'] ?? 0;
        $roi20 = $rows[19]['roi'] ?? 0;

        return [
            'rows' => $rows,
            'paybackMonths' => $paybackMonth,
            'paybackYears' => $paybackYears,
            'savings10' => $savings10,
            'savings20' => $savings20,
            'roi20' => $roi20,
            'clientInvestment' => $clientInvestment,
        ];
    }
}
