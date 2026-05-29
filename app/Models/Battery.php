<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class Battery extends Model
{
    protected $fillable = [
        'brand',
        'model',
        'capacity',
        'voltage',
        'type',
        'price',
        'technical_sheet_url',
        'is_active',
    ];

    protected $casts = [
        'capacity' => 'decimal:2',
        'voltage' => 'decimal:2',
        'price' => 'decimal:2',
        'is_active' => 'boolean',
    ];

    protected $appends = ['datasheet_url'];

    public function getDatasheetUrlAttribute()
    {
        return $this->technical_sheet_url ? Storage::url($this->technical_sheet_url) : null;
    }
}
