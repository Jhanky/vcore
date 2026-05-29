<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CostCenter extends Model
{
    protected $fillable = [
        'code',
        'name',
        'description',
        'project_id',
        'budget_cop',
        'spent_cop',
        'is_active',
    ];

    protected $casts = [
        'budget_cop' => 'decimal:2',
        'spent_cop' => 'decimal:2',
        'is_active' => 'boolean',
    ];

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public static function generateCode(string $projectCode): string
    {
        return 'CC-PRO-'.$projectCode;
    }
}
