<?php

namespace App\Services;

use App\Models\CostCenter;
use App\Models\Milestone;
use App\Models\MilestoneType;
use App\Models\Project;
use App\Models\ProjectDocument;
use App\Models\ProjectFieldValue;
use App\Models\ProjectEquipment;
use App\Models\ProjectNote;
use App\Models\ProjectState;
use App\Models\ProjectStateField;
use App\Models\ProjectStateHistory;
use App\Models\ProjectTechnicalSpecs;
use App\Models\ProjectUpmeDetail;
use App\Models\Quotation;
use App\Models\RequiredDocument;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class ProjectService
{
    public function list(array $filters = [], int $perPage = 15, ?User $forUser = null): LengthAwarePaginator
    {
        $query = Project::with(['client', 'currentState', 'projectManager', 'technicalLeader', 'creator']);

        if ($forUser && ! $forUser->hasRole(['admin', 'gerente'])) {
            $query->where('user_id', $forUser->id);
        }

        if (! empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('code', 'like', "%{$search}%")
                    ->orWhere('name', 'like', "%{$search}%");
            });
        }

        if (! empty($filters['state_id'])) {
            $query->where('current_state_id', $filters['state_id']);
        }

        if (! empty($filters['client_id'])) {
            $query->where('client_id', $filters['client_id']);
        }

        if (! empty($filters['manager_id'])) {
            $query->where('project_manager_id', $filters['manager_id']);
        }

        if (! empty($filters['priority'])) {
            $query->where('priority', $filters['priority']);
        }

        if (! empty($filters['is_active'])) {
            $query->where('is_active', $filters['is_active'] === 'true');
        }

        if (isset($filters['start_date'])) {
            $query->whereDate('start_date', '>=', $filters['start_date']);
        }

        if (isset($filters['end_date'])) {
            $query->whereDate('estimated_end_date', '<=', $filters['end_date']);
        }

        return $query->orderBy('created_at', 'desc')->paginate($perPage);
    }

    public function getById(int $id): ?Project
    {
        return Project::with([
            'client',
            'quotation',
            'quotation.products',
            'currentState',
            'projectManager',
            'technicalLeader',
            'stateHistory.fromState',
            'stateHistory.toState',
            'stateHistory.changedBy',
            'notes.createdBy',
            'documents.requiredDocument',
            'documents.uploader',
            'technicalSpecs',
            'upmeDetail',
            'costCenter',
            'milestones.milestoneType',
            'milestones.responsible',
            'equipment.supplier',
            'equipment.serials',
        ])->find($id);
    }

    public function createFromQuotation(Quotation $quotation): Project
    {
        if ($quotation->project_id) {
            throw new \InvalidArgumentException('La cotización ya está asignada a un proyecto');
        }

        return DB::transaction(function () use ($quotation) {
            $project = Project::create([
                'code' => Project::generateCode(),
                'client_id' => $quotation->client_id,
                'quotation_id' => $quotation->id,
                'current_state_id' => 1,
                'name' => $quotation->project_name ?? 'Proyecto '.$quotation->code,
                'description' => $quotation->project_name,
                'start_date' => now(),
                'estimated_end_date' => now()->addMonths(3),
                'contracted_value_cop' => $quotation->total_value,
                'priority' => 'media',
            ]);

            $quotation->update(['project_id' => $project->id]);

            ProjectStateHistory::create([
                'project_id' => $project->id,
                'from_state_id' => null,
                'to_state_id' => 1,
                'reason' => 'Creación automática desde cotización aprobada',
                'started_at' => now(),
            ]);

            CostCenter::create([
                'code' => CostCenter::generateCode($project->code),
                'name' => 'Centro de Costos - '.$project->name,
                'project_id' => $project->id,
                'budget_cop' => $quotation->total_value,
                'spent_cop' => 0,
            ]);

            if ($quotation->power_kwp) {
                ProjectTechnicalSpecs::create([
                    'project_id' => $project->id,
                    'panel_count' => $quotation->panel_count,
                ]);
            }

            $quotation->load('products');
            foreach ($quotation->products as $product) {
                ProjectEquipment::create([
                    'project_id' => $project->id,
                    'product_type' => $product->product_type,
                    'product_id' => $product->product_id,
                    'quotation_product_id' => $product->id,
                    'brand' => $product->snapshot_brand,
                    'model' => $product->snapshot_model,
                    'specs' => $product->snapshot_specs,
                    'quantity' => $product->quantity,
                ]);
            }

            ProjectUpmeDetail::create([
                'project_id' => $project->id,
                'generation_capacity_kw' => $quotation->power_kwp * 1000,
                'system_type' => $quotation->system_type,
                'status' => 'pending',
            ]);

            return $project;
        });
    }

    public function create(array $data): Project
    {
        return DB::transaction(function () use ($data) {
            $project = Project::create([
                'code' => Project::generateCode(),
                'client_id' => $data['client_id'],
                'quotation_id' => $data['quotation_id'] ?? null,
                'current_state_id' => $data['current_state_id'] ?? 1,
                'name' => $data['name'],
                'description' => $data['description'] ?? null,
                'installation_address' => $data['installation_address'] ?? null,
                'coordinates' => $data['coordinates'] ?? null,
                'start_date' => $data['start_date'] ?? null,
                'estimated_end_date' => $data['estimated_end_date'] ?? null,
                'contracted_value_cop' => $data['contracted_value_cop'] ?? null,
                'project_manager_id' => $data['project_manager_id'] ?? null,
                'technical_leader_id' => $data['technical_leader_id'] ?? null,
                'priority' => $data['priority'] ?? 'media',
                'notes' => $data['notes'] ?? null,
                'user_id' => $data['user_id'] ?? null,
            ]);

            ProjectStateHistory::create([
                'project_id' => $project->id,
                'from_state_id' => null,
                'to_state_id' => $project->current_state_id,
                'reason' => 'Creación manual del proyecto',
                'started_at' => now(),
            ]);

            CostCenter::create([
                'code' => CostCenter::generateCode($project->code),
                'name' => 'Centro de Costos - '.$project->name,
                'project_id' => $project->id,
                'budget_cop' => $data['contracted_value_cop'] ?? 0,
                'spent_cop' => 0,
            ]);

            ProjectTechnicalSpecs::create(['project_id' => $project->id]);
            ProjectUpmeDetail::create(['project_id' => $project->id]);

            return $project;
        });
    }

    public function update(Project $project, array $data): Project
    {
        $fillable = [];

        foreach (['name', 'description', 'installation_address', 'coordinates', 'start_date', 'estimated_end_date', 'actual_end_date', 'contracted_value_cop', 'total_cost_cop', 'project_manager_id', 'technical_leader_id', 'priority', 'notes'] as $field) {
            if (array_key_exists($field, $data)) {
                $fillable[$field] = $data[$field];
            }
        }

        if (array_key_exists('is_active', $data)) {
            $fillable['is_active'] = $data['is_active'] === true || $data['is_active'] === 'true';
        }

        $project->update($fillable);

        return $project->fresh();
    }

    public function changeStatus(Project $project, int $newStateId, ?string $reason = null, ?string $notes = null, ?int $userId = null, $file = null, array $fieldValues = [], string $temporaryToken = ''): Project
    {
        $newState = ProjectState::findOrFail($newStateId);
        $oldStateId = $project->current_state_id;

        if ($oldStateId === $newStateId) {
            throw new \InvalidArgumentException('El proyecto ya está en ese estado');
        }

        $pendingDocuments = $this->getPendingRequiredDocuments($project, $oldStateId);
        if ($pendingDocuments->isNotEmpty() && $newState->phase !== $project->currentState->phase) {
            throw new \InvalidArgumentException(
                'No se puede cambiar de estado con documentos obligatorios pendientes: '.
                $pendingDocuments->pluck('name')->join(', ')
            );
        }

        return DB::transaction(function () use ($project, $oldStateId, $newStateId, $reason, $notes, $userId, $file, $fieldValues, $temporaryToken) {
            $newState = ProjectState::find($newStateId);
            $stateFieldService = app(StateFieldService::class);

            $filesData = [];
            if ($temporaryToken) {
                $filesData = $stateFieldService->copyEvidencesToHistory($project, $newStateId, $temporaryToken);
            }

            $jsonFieldValues = ! empty($fieldValues) ? json_encode($fieldValues) : null;

            ProjectStateHistory::recordTransition(
                $project,
                $oldStateId,
                $newStateId,
                $reason,
                $notes,
                $userId,
                $file,
                $jsonFieldValues,
                $filesData
            );

            $updateData = ['current_state_id' => $newStateId];

            if ($newState && in_array($newState->code, ['completed', 'cancelled'])) {
                $updateData['actual_end_date'] = now();
            }

            $project->update($updateData);

            if ($project->costCenter) {
                $project->costCenter->update(['spent_cop' => $project->total_cost_cop ?? 0]);
            }

            return $project->fresh();
        });
    }

    public function addNote(Project $project, string $content, ?int $userId = null, $file = null): ProjectNote
    {
        $data = [
            'project_id' => $project->id,
            'content' => $content,
            'created_by' => $userId,
        ];

        if ($file) {
            $data['file_path'] = $file->storeAs(
                "projects/{$project->id}/notes",
                time().'_'.$file->getClientOriginalName()
            );
            $data['original_filename'] = $file->getClientOriginalName();
        }

        return ProjectNote::create($data);
    }

    public function uploadDocument(Project $project, array $data, $file, ?int $userId = null): ProjectDocument
    {
        $filename = $file->getClientOriginalName();
        $path = $file->storeAs(
            "projects/{$project->id}/documents",
            time().'_'.$filename
        );

        return ProjectDocument::create([
            'project_id' => $project->id,
            'required_document_id' => $data['required_document_id'] ?? null,
            'name' => $data['name'] ?? $filename,
            'original_filename' => $filename,
            'file_path' => $path,
            'file_size' => $file->getSize(),
            'mime_type' => $file->getMimeType(),
            'uploader_id' => $userId,
            'description' => $data['description'] ?? null,
        ]);
    }

    public function deleteDocument(ProjectDocument $document): void
    {
        if (Storage::exists($document->file_path)) {
            Storage::delete($document->file_path);
        }
        $document->delete();
    }

    public function getRequirements(Project $project): array
    {
        $currentState = $project->currentState;
        $requiredDocs = RequiredDocument::where('state', $currentState->code)
            ->ordered()
            ->get();

        $uploadedDocs = ProjectDocument::where('project_id', $project->id)
            ->whereNotNull('required_document_id')
            ->get()
            ->groupBy('required_document_id');

        return $requiredDocs->map(function ($req) use ($uploadedDocs) {
            $uploaded = $uploadedDocs->get($req->id, collect())->first();

            return [
                'id' => $req->id,
                'name' => $req->name,
                'description' => $req->description,
                'is_required' => $req->is_required,
                'category' => $req->category,
                'status' => $uploaded ? 'UPLOADED' : 'PENDING',
                'document' => $uploaded,
            ];
        })->toArray();
    }

    public function getPendingRequiredDocuments(Project $project, int $stateId): Collection
    {
        $state = ProjectState::find($stateId);
        $requiredDocs = RequiredDocument::where('state', $state->code)
            ->required()
            ->get();

        $uploadedIds = ProjectDocument::where('project_id', $project->id)
            ->whereIn('required_document_id', $requiredDocs->pluck('id'))
            ->pluck('required_document_id');

        return $requiredDocs->whereNotIn('id', $uploadedIds);
    }

    public function getAvailableStates(Project $project): array
    {
        $currentPhase = $project->currentState->phase;

        return ProjectState::where('phase', $currentPhase)
            ->where('id', '!=', $project->current_state_id)
            ->ordered()
            ->get()
            ->toArray();
    }

    public function getStatistics(?User $forUser = null): array
    {
        $baseQuery = Project::query();

        if ($forUser && ! $forUser->hasRole(['admin', 'gerente'])) {
            $baseQuery->where('user_id', $forUser->id);
        }

        $total = (clone $baseQuery)->count();
        $active = (clone $baseQuery)->active()->count();
        $completed = (clone $baseQuery)->whereHas('currentState', fn ($q) => $q->where('phase', 'completed'))->count();
        $cancelled = (clone $baseQuery)->whereHas('currentState', fn ($q) => $q->where('code', 'cancelled'))->count();

        $byState = ProjectState::withCount(['projects' => function ($q) use ($forUser) {
            if ($forUser && ! $forUser->hasRole(['admin', 'gerente'])) {
                $q->where('user_id', $forUser->id);
            }
        }])
            ->ordered()
            ->get()
            ->map(fn ($state) => [
                'id' => $state->id,
                'name' => $state->name,
                'code' => $state->code,
                'color' => $state->color,
                'count' => $state->projects_count,
            ])
            ->toArray();

        $totalValue = (clone $baseQuery)->whereNotNull('contracted_value_cop')->sum('contracted_value_cop');
        $totalCost = (clone $baseQuery)->whereNotNull('total_cost_cop')->sum('total_cost_cop');

        return [
            'total' => $total,
            'active' => $active,
            'completed' => $completed,
            'cancelled' => $cancelled,
            'by_state' => $byState,
            'total_contracted_value' => $totalValue,
            'total_cost' => $totalCost,
        ];
    }

    public function softDelete(Project $project): void
    {
        DB::transaction(function () use ($project) {
            $project->stateHistory()->delete();
            $project->notes()->delete();
            $project->documents()->delete();
            $project->technicalSpecs()?->delete();
            $project->upmeDetail()?->delete();
            $project->costCenter()?->delete();
            $project->milestones()->delete();

            $project->delete();
        });
    }

    public function createMilestone(Project $project, array $data): Milestone
    {
        return Milestone::create([
            'project_id' => $project->id,
            'milestone_type_id' => $data['milestone_type_id'] ?? null,
            'title' => $data['title'],
            'description' => $data['description'] ?? null,
            'planned_date' => $data['planned_date'] ?? null,
            'status' => 'pending',
            'amount_cop' => $data['amount_cop'] ?? null,
            'requires_verification' => $data['requires_verification'] ?? false,
            'responsible_user_id' => $data['responsible_user_id'] ?? null,
        ]);
    }

    public function updateMilestone(Milestone $milestone, array $data): Milestone
    {
        $milestone->update(array_filter([
            'milestone_type_id' => $data['milestone_type_id'] ?? null,
            'title' => $data['title'] ?? null,
            'description' => $data['description'] ?? null,
            'planned_date' => $data['planned_date'] ?? null,
            'actual_date' => $data['actual_date'] ?? null,
            'status' => $data['status'] ?? null,
            'amount_cop' => $data['amount_cop'] ?? null,
            'requires_verification' => isset($data['requires_verification']) ? ($data['requires_verification'] === true || $data['requires_verification'] === 'true') : null,
            'verified_by' => $data['verified_by'] ?? null,
            'verified_at' => $data['verified_at'] ?? null,
            'responsible_user_id' => $data['responsible_user_id'] ?? null,
            'notes' => $data['notes'] ?? null,
        ], fn ($v) => $v !== null));

        return $milestone->fresh();
    }

    public function completeMilestone(Milestone $milestone, ?int $userId = null): Milestone
    {
        $updateData = [
            'status' => 'completed',
            'actual_date' => now(),
        ];

        if ($milestone->requires_verification) {
            $updateData['verified_by'] = $userId;
            $updateData['verified_at'] = now();
        }

        $milestone->update($updateData);

        return $milestone->fresh();
    }

    public function getHistory(Project $project): Collection
    {
        return ProjectStateHistory::with(['fromState', 'toState', 'changedBy'])
            ->where('project_id', $project->id)
            ->orderBy('started_at', 'desc')
            ->get();
    }

    public function getAllNotes(Project $project): Collection
    {
        return ProjectNote::with('createdBy')
            ->where('project_id', $project->id)
            ->orderBy('created_at', 'desc')
            ->get();
    }

    public function getAllDocuments(Project $project): Collection
    {
        return ProjectDocument::with(['requiredDocument', 'uploader'])
            ->where('project_id', $project->id)
            ->orderBy('created_at', 'desc')
            ->get();
    }

    public function getMilestoneTypes(): Collection
    {
        return MilestoneType::all();
    }

    public function getStates(): Collection
    {
        return ProjectState::ordered()->get();
    }

    public function getFieldValuesForState(Project $project, int $stateId): Collection
    {
        return ProjectFieldValue::where('project_id', $project->id)
            ->whereHas('stateField', function ($query) use ($stateId) {
                $query->where('state_id', $stateId);
            })
            ->with('stateField', 'createdBy')
            ->get();
    }

    public function saveFieldValues(Project $project, array $fieldValues, int $userId): array
    {
        $saved = [];

        foreach ($fieldValues as $fieldId => $value) {
            $fieldValue = ProjectFieldValue::updateOrCreate(
                [
                    'project_id' => $project->id,
                    'state_field_id' => $fieldId,
                ],
                [
                    'text_value' => is_string($value) ? $value : null,
                    'created_by' => $userId,
                ]
            );

            $saved[] = $fieldValue;
        }

        return $saved;
    }

    public function getFieldValuesWithStatus(Project $project, int $stateId): array
    {
        $fields = ProjectStateField::where('state_id', $stateId)
            ->orderBy('display_order')
            ->get();

        $fieldValues = $this->getFieldValuesForState($project, $stateId)->keyBy('state_field_id');

        $documents = ProjectDocument::where('project_id', $project->id)
            ->whereNotNull('state_field_id')
            ->get()
            ->keyBy('state_field_id');

        return $fields->map(function ($field) use ($fieldValues, $documents) {
            $fieldValue = $fieldValues->get($field->id);
            $document = $documents->get($field->id);

            return [
                'id' => $field->id,
                'field_type' => $field->field_type,
                'field_name' => $field->field_name,
                'label' => $field->label,
                'is_required' => $field->is_required,
                'accepted_types' => $field->accepted_types,
                'text_value' => $fieldValue?->text_value,
                'document' => $document ? [
                    'id' => $document->id,
                    'file_path' => $document->file_path,
                    'original_filename' => $document->original_filename,
                ] : null,
                'created_by' => $fieldValue?->createdBy?->name,
                'created_at' => $fieldValue?->created_at,
            ];
        })->toArray();
    }
}
