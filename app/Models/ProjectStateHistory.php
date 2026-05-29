<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\DB;

class ProjectStateHistory extends Model
{
    protected $table = 'project_state_history';

    protected $fillable = [
        'project_id',
        'from_state_id',
        'to_state_id',
        'reason',
        'notes',
        'changed_by',
        'started_at',
        'ended_at',
        'duration_days',
        'file_path',
        'original_filename',
        'field_values',
        'files_data',
    ];

    protected $casts = [
        'started_at' => 'datetime',
        'ended_at' => 'datetime',
        'duration_days' => 'integer',
        'field_values' => 'array',
        'files_data' => 'array',
    ];

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function fromState(): BelongsTo
    {
        return $this->belongsTo(ProjectState::class, 'from_state_id');
    }

    public function toState(): BelongsTo
    {
        return $this->belongsTo(ProjectState::class, 'to_state_id');
    }

    public function changedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'changed_by');
    }

    public static function recordTransition(
        Project $project,
        ?int $fromStateId,
        int $toStateId,
        ?string $reason = null,
        ?string $notes = null,
        ?int $userId = null,
        $file = null,
        ?string $fieldValues = null,
        array $filesData = []
    ): self {
        static::where('project_id', $project->id)
            ->whereNull('ended_at')
            ->update([
                'ended_at' => now(),
                'duration_days' => DB::raw('DATEDIFF(NOW(), started_at)'),
            ]);

        $data = [
            'project_id' => $project->id,
            'from_state_id' => $fromStateId,
            'to_state_id' => $toStateId,
            'reason' => $reason,
            'notes' => $notes,
            'changed_by' => $userId,
            'started_at' => now(),
            'field_values' => $fieldValues,
            'files_data' => ! empty($filesData) ? json_encode($filesData) : null,
        ];

        if ($file) {
            $data['file_path'] = $file->storeAs(
                "projects/{$project->id}/transitions",
                time().'_'.$file->getClientOriginalName()
            );
            $data['original_filename'] = $file->getClientOriginalName();
        }

        return static::create($data);
    }
}
