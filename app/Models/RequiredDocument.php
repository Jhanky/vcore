<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RequiredDocument extends Model
{
    protected $fillable = [
        'flow_type',
        'state',
        'name',
        'description',
        'is_required',
        'display_order',
    ];

    protected $casts = [
        'is_required' => 'boolean',
        'display_order' => 'integer',
    ];

    public function state(): BelongsTo
    {
        return $this->belongsTo(ProjectState::class, 'code', 'state');
    }

    public function scopeRequired($query)
    {
        return $query->where('is_required', true);
    }

    public function scopeForFlow($query, string $flowType)
    {
        return $query->where('flow_type', $flowType);
    }

    public function scopeForState($query, string $state)
    {
        return $query->where('state', $state);
    }

    public function scopeOrdered($query)
    {
        return $query->orderBy('display_order');
    }
}
