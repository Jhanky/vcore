<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProjectUpmeDetail extends Model
{
    protected $fillable = [
        'project_id',
        'upme_registration_number',
        'registration_date',
        'generation_capacity_kw',
        'system_type',
        'connection_type',
        'grid_integration_date',
        'status',
        'documentation',
        'notes',
    ];

    protected $casts = [
        'registration_date' => 'date',
        'grid_integration_date' => 'date',
        'generation_capacity_kw' => 'decimal:3',
        'documentation' => 'array',
    ];

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }
}
