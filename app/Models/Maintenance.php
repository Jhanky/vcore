<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Maintenance extends Model
{
    protected $fillable = [
        'project_id',
        'code',
        'title',
        'description',
        'type',
        'priority',
        'status',
        'scheduled_date',
        'completed_date',
        'estimated_hours',
        'completion_notes',
        'created_by',
    ];

    protected function casts(): array
    {
        return [
            'scheduled_date' => 'date',
            'completed_date' => 'date',
            'estimated_hours' => 'decimal:2',
        ];
    }

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function technicians(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'maintenance_user')
            ->withPivot('role')
            ->withTimestamps();
    }

    public static function generateCode(): string
    {
        $year = date('Y');
        $last = static::whereYear('created_at', $year)
            ->orderBy('code', 'desc')
            ->first();

        if ($last && preg_match('/MTO-'.$year.'-(\d+)/', $last->code, $matches)) {
            $next = intval($matches[1]) + 1;
        } else {
            $next = 1;
        }

        return sprintf('MTO-%s-%04d', $year, $next);
    }

    public function scopeByTechnician($query, $userId)
    {
        return $query->whereHas('technicians', fn ($q) => $q->where('user_id', $userId));
    }

    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    public function scopeScheduledBetween($query, $from, $to)
    {
        return $query->whereBetween('scheduled_date', [$from, $to]);
    }
}
