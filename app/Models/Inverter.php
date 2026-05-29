<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class Inverter extends Model
{
    protected $fillable = [
        'brand',
        'model',
        'power',
        'system_type',
        'grid_type',
        'price',
        'technical_sheet_url',
        'is_active',
    ];

    protected $casts = [
        'power' => 'decimal:2',
        'price' => 'decimal:2',
        'is_active' => 'boolean',
    ];

    protected $appends = ['datasheet_url'];

    public function getDatasheetUrlAttribute()
    {
        return $this->technical_sheet_url ? Storage::url($this->technical_sheet_url) : null;
    }
}
