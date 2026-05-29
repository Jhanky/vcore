<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProjectTechnicalSpecs extends Model
{
    protected $fillable = [
        'project_id',
        'panel_brand',
        'panel_model',
        'panel_count',
        'panel_power_w',
        'inverter_brand',
        'inverter_model',
        'inverter_count',
        'inverter_power_kw',
        'battery_brand',
        'battery_model',
        'battery_count',
        'battery_capacity_kwh',
        'structure_type',
        'installation_type',
        'electrical_diagram',
        'notes',
    ];

    protected $casts = [
        'panel_count' => 'integer',
        'panel_power_w' => 'decimal:2',
        'inverter_count' => 'integer',
        'inverter_power_kw' => 'decimal:2',
        'battery_count' => 'integer',
        'battery_capacity_kwh' => 'decimal:2',
    ];

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }
}
