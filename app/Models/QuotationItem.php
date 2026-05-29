<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class QuotationItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'quotation_id',
        'description',
        'category',
        'quantity',
        'unit_measure',
        'unit_price_cop',
        'profit_percentage',
    ];

    protected $casts = [
        'quantity' => 'float',
        'unit_price_cop' => 'float',
        'profit_percentage' => 'float',
    ];

    public function quotation()
    {
        return $this->belongsTo(Quotation::class);
    }

    /**
     * Calculate cost (before profit).
     */
    public function getCostAttribute(): float
    {
        return $this->quantity * $this->unit_price_cop;
    }

    /**
     * Calculate the item's total (cost + profit).
     */
    public function getTotalAttribute(): float
    {
        return $this->cost * (1 + $this->profit_percentage);
    }
}
