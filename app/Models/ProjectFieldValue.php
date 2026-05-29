<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProjectFieldValue extends Model
{
    protected $fillable = [
        'project_id',
        'state_field_id',
        'text_value',
        'created_by',
    ];

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function stateField(): BelongsTo
    {
        return $this->belongsTo(ProjectStateField::class, 'state_field_id');
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
