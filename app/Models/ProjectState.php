<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ProjectState extends Model
{
    protected $fillable = [
        'name',
        'slug',
        'code',
        'color',
        'icon',
        'phase',
        'display_order',
        'estimated_duration',
        'is_final',
        'requires_approval',
        'description',
        'is_active',
    ];

    protected $casts = [
        'is_final' => 'boolean',
        'requires_approval' => 'boolean',
        'is_active' => 'boolean',
        'display_order' => 'integer',
    ];

    public function projects(): HasMany
    {
        return $this->hasMany(Project::class, 'current_state_id');
    }

    public function requiredDocuments(): HasMany
    {
        return $this->hasMany(RequiredDocument::class, 'state', 'code');
    }

    public function scopeOrdered($query)
    {
        return $query->orderBy('display_order');
    }

    public function scopeByPhase($query, string $phase)
    {
        return $query->where('phase', $phase);
    }

    public function scopeFinals($query)
    {
        return $query->where('is_final', true);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
