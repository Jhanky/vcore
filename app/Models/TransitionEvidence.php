<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TransitionEvidence extends Model
{
    protected $fillable = [
        'project_id',
        'state_field_id',
        'file_path',
        'original_filename',
        'temporary_token',
    ];

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function stateField(): BelongsTo
    {
        return $this->belongsTo(ProjectStateField::class, 'state_field_id');
    }
}
