<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Milestone extends Model
{
    protected $fillable = [
        'project_id',
        'milestone_type_id',
        'title',
        'description',
        'planned_date',
        'actual_date',
        'status',
        'amount_cop',
        'requires_verification',
        'verified_by',
        'verified_at',
        'responsible_user_id',
        'notes',
    ];

    protected $casts = [
        'planned_date' => 'date',
        'actual_date' => 'date',
        'verified_at' => 'datetime',
        'amount_cop' => 'decimal:2',
        'requires_verification' => 'boolean',
    ];

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function milestoneType(): BelongsTo
    {
        return $this->belongsTo(MilestoneType::class);
    }

    public function verifiedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'verified_by');
    }

    public function responsible(): BelongsTo
    {
        return $this->belongsTo(User::class, 'responsible_user_id');
    }

    public function isOverdue(): bool
    {
        return $this->planned_date && $this->status === 'pending';
    }

    public function markAsCompleted(?int $userId = null): void
    {
        $this->update([
            'status' => 'completed',
            'actual_date' => now(),
            'verified_by' => $userId,
            'verified_at' => $this->requires_verification ? null : now(),
        ]);
    }
}
