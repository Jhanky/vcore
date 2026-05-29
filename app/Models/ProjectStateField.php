<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProjectStateField extends Model
{
    protected $fillable = [
        'state_id',
        'field_type',
        'field_name',
        'label',
        'is_required',
        'display_order',
        'accepted_types',
        'max_size_kb',
    ];

    protected $casts = [
        'is_required' => 'boolean',
        'display_order' => 'integer',
        'max_size_kb' => 'integer',
    ];

    public function state(): BelongsTo
    {
        return $this->belongsTo(ProjectState::class, 'state_id');
    }
}
