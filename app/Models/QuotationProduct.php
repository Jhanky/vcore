<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class QuotationProduct extends Model
{
    use HasFactory;

    protected $fillable = [
        'quotation_id',
        'product_type',
        'product_id',
        'snapshot_brand',
        'snapshot_model',
        'snapshot_specs',
        'quantity',
        'unit_price_cop',
        'profit_percentage',
    ];

    protected $casts = [
        'snapshot_specs' => 'array',
        'quantity' => 'integer',
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
