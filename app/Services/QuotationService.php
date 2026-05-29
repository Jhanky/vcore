<?php

namespace App\Services;

use App\Models\Quotation;

class QuotationService
{
    /**
     * Recalculate and persist all financial totals for a quotation.
     * Follows the exact steps from the Quotation Calculation Documentation.
     */
    public function calculateTotals(Quotation $quotation): void
    {
        $quotation->load(['products', 'items']);

        // Step 1: Subtotal Base
        $subtotal = 0;

        foreach ($quotation->products as $p) {
            $cost = $p->quantity * $p->unit_price_cop;
            $utilidad = $cost * $p->profit_percentage;
            $subtotal += ($cost + $utilidad);
        }

        foreach ($quotation->items as $i) {
            $cost = $i->quantity * $i->unit_price_cop;
            $utilidad = $cost * $i->profit_percentage;
            $subtotal += ($cost + $utilidad);
        }

        $subtotal = round($subtotal, 2);

        // Step 2: Gestión Comercial
        $cm = round($subtotal * $quotation->commercial_management_percentage, 2);

        // Step 3: Subtotal 2
        $subtotal2 = round($subtotal + $cm, 2);

        // Step 4: Cálculos sobre Subtotal 2
        $admin = round($subtotal2 * $quotation->administration_percentage, 2);
        $cont = round($subtotal2 * $quotation->contingency_percentage, 2);
        $profit = round($subtotal2 * $quotation->profit_percentage, 2);

        // Step 5: IVA sobre Utilidad
        $profitIva = round($profit * $quotation->iva_profit_percentage, 2);

        // Step 6: Subtotal 3
        $subtotal3 = round($subtotal2 + $admin + $cont + $profit + $profitIva, 2);

        // Step 7: Retenciones
        $wh = round($subtotal3 * $quotation->withholding_percentage, 2);

        // Step 8: TOTAL FINAL
        $total = round($subtotal3 + $wh, 2);

        $quotation->update([
            'subtotal' => $subtotal,
            'commercial_management' => $cm,
            'subtotal2' => $subtotal2,
            'administration' => $admin,
            'contingency' => $cont,
            'profit' => $profit,
            'profit_iva' => $profitIva,
            'subtotal3' => $subtotal3,
            'withholdings' => $wh,
            'total_value' => $total,
        ]);
    }

    /**
     * Calculate Subtotal 3 based on existing quotation values.
     * Formula: subtotal3 = subtotal2 + profit + profit_iva + withholdings
     *
     * @param  Quotation  $quotation  La cotizacion con los valores ya calculados
     * @param  bool  $persist  Si es true, actualiza subtotal3 en la base de datos
     * @return float El valor calculado de subtotal3
     */
    public function calculateSubtotal3(Quotation $quotation, bool $persist = false): float
    {
        $subtotal3 = round(
            $quotation->subtotal2
            + $quotation->profit
            + $quotation->profit_iva
            + $quotation->withholdings,
            2
        );

        if ($persist) {
            $quotation->update(['subtotal3' => $subtotal3]);
        }

        return $subtotal3;
    }
}
