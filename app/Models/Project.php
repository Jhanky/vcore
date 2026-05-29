<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

class Project extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'code',
        'client_id',
        'quotation_id',
        'current_state_id',
        'name',
        'description',
        'installation_address',
        'coordinates',
        'start_date',
        'estimated_end_date',
        'actual_end_date',
        'contracted_value_cop',
        'total_cost_cop',
        'project_manager_id',
        'technical_leader_id',
        'priority',
        'notes',
        'is_active',
        'user_id',
    ];

    protected $casts = [
        'start_date' => 'date',
        'estimated_end_date' => 'date',
        'actual_end_date' => 'date',
        'contracted_value_cop' => 'decimal:2',
        'total_cost_cop' => 'decimal:2',
        'is_active' => 'boolean',
    ];

    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }

    public function quotation(): BelongsTo
    {
        return $this->belongsTo(Quotation::class);
    }

    public function currentState(): BelongsTo
    {
        return $this->belongsTo(ProjectState::class, 'current_state_id');
    }

    public function projectManager(): BelongsTo
    {
        return $this->belongsTo(User::class, 'project_manager_id');
    }

    public function technicalLeader(): BelongsTo
    {
        return $this->belongsTo(User::class, 'technical_leader_id');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function stateHistory(): HasMany
    {
        return $this->hasMany(ProjectStateHistory::class)->orderBy('started_at', 'desc');
    }

    public function notes(): HasMany
    {
        return $this->hasMany(ProjectNote::class)->orderBy('created_at', 'desc');
    }

    public function documents(): HasMany
    {
        return $this->hasMany(ProjectDocument::class)->orderBy('created_at', 'desc');
    }

    public function technicalSpecs(): HasOne
    {
        return $this->hasOne(ProjectTechnicalSpecs::class);
    }

    public function upmeDetail(): HasOne
    {
        return $this->hasOne(ProjectUpmeDetail::class);
    }

    public function costCenter(): HasOne
    {
        return $this->hasOne(CostCenter::class);
    }

    public function milestones(): HasMany
    {
        return $this->hasMany(Milestone::class)->orderBy('planned_date');
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeByState($query, $stateId)
    {
        return $query->where('current_state_id', $stateId);
    }

    public function scopeByClient($query, $clientId)
    {
        return $query->where('client_id', $clientId);
    }

    public function scopeByManager($query, $managerId)
    {
        return $query->where('project_manager_id', $managerId);
    }

    public function getProgressAttribute(): int
    {
        $phaseOrder = [
            'commercial' => 1,
            'legal' => 2,
            'technical' => 3,
            'financial' => 4,
            'completed' => 5,
        ];

        $currentPhase = $this->currentState?->phase ?? 'commercial';

        return isset($phaseOrder[$currentPhase]) ? ($phaseOrder[$currentPhase] / 5) * 100 : 0;
    }

    public static function generateCode(): string
    {
        $year = date('Y');
        $lastProject = static::withTrashed()
            ->whereYear('created_at', $year)
            ->orderBy('code', 'desc')
            ->first();

        if ($lastProject && preg_match('/PRO-'.$year.'-(\d+)/', $lastProject->code, $matches)) {
            $nextNumber = intval($matches[1]) + 1;
        } else {
            $nextNumber = 1;
        }

        return sprintf('PRO-%s-%04d', $year, $nextNumber);
    }
}
