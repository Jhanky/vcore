<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;

class Ticket extends Model
{
    protected $fillable = [
        'project_id',
        'code',
        'title',
        'description',
        'category',
        'priority',
        'status',
        'assigned_to',
        'created_by',
        'resolved_at',
        'resolution_notes',
    ];

    protected function casts(): array
    {
        return [
            'resolved_at' => 'datetime',
        ];
    }

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function assignee(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function comments(): HasMany
    {
        return $this->hasMany(TicketComment::class)->orderBy('created_at', 'asc');
    }

    public function attachments(): MorphMany
    {
        return $this->morphMany(TicketAttachment::class, 'attachable');
    }

    public static function generateCode(): string
    {
        $year = date('Y');
        $last = static::whereYear('created_at', $year)
            ->orderBy('code', 'desc')
            ->first();

        if ($last && preg_match('/TCK-'.$year.'-(\d+)/', $last->code, $matches)) {
            $next = intval($matches[1]) + 1;
        } else {
            $next = 1;
        }

        return sprintf('TCK-%s-%04d', $year, $next);
    }

    public function scopeByAssignee($query, $userId)
    {
        return $query->where('assigned_to', $userId);
    }

    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    public function scopeOpen($query)
    {
        return $query->whereIn('status', ['abierto', 'en_progreso']);
    }
}
