<?php

namespace App\Services;

use App\Models\Project;
use App\Models\ProjectStateField;
use App\Models\TransitionEvidence;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class StateFieldService
{
    public function getFieldsForState(int $stateId): Collection
    {
        return ProjectStateField::where('state_id', $stateId)
            ->orderBy('display_order')
            ->get();
    }

    public function getFieldsWithEvidence(int $stateId, Project $project, string $token): Collection
    {
        $fields = $this->getFieldsForState($stateId);

        $evidences = TransitionEvidence::where('project_id', $project->id)
            ->where('temporary_token', $token)
            ->get()
            ->keyBy('state_field_id');

        return $fields->map(function ($field) use ($evidences) {
            $evidence = $evidences->get($field->id);

            return [
                'id' => $field->id,
                'field_type' => $field->field_type,
                'field_name' => $field->field_name,
                'label' => $field->label,
                'is_required' => $field->is_required,
                'accepted_types' => $field->accepted_types,
                'max_size_kb' => $field->max_size_kb,
                'evidence' => $evidence ? [
                    'id' => $evidence->id,
                    'file_path' => $evidence->file_path,
                    'original_filename' => $evidence->original_filename,
                ] : null,
            ];
        });
    }

    public function uploadEvidence(Project $project, int $stateFieldId, $file, string $token): TransitionEvidence
    {
        $field = ProjectStateField::findOrFail($stateFieldId);

        $filename = $file->getClientOriginalName();
        $path = $file->storeAs(
            "projects/{$project->id}/evidences",
            time().'_'.$filename
        );

        return TransitionEvidence::updateOrCreate(
            [
                'project_id' => $project->id,
                'state_field_id' => $stateFieldId,
                'temporary_token' => $token,
            ],
            [
                'file_path' => $path,
                'original_filename' => $filename,
            ]
        );
    }

    public function deleteEvidence(TransitionEvidence $evidence): void
    {
        Storage::delete($evidence->file_path);
        $evidence->delete();
    }

    public function getEvidencesByToken(Project $project, string $token): Collection
    {
        return TransitionEvidence::where('project_id', $project->id)
            ->where('temporary_token', $token)
            ->get();
    }

    public function copyEvidencesToHistory(Project $project, int $toStateId, string $token): array
    {
        $evidences = $this->getEvidencesByToken($project, $token);

        $files = [];
        foreach ($evidences as $evidence) {
            $files[] = [
                'state_field_id' => $evidence->state_field_id,
                'field_name' => $evidence->stateField->field_name,
                'file_path' => $evidence->file_path,
                'original_filename' => $evidence->original_filename,
            ];
        }

        return $files;
    }

    public function generateToken(): string
    {
        return Str::uuid()->toString();
    }

    public function validateRequiredFields(int $stateId, array $fieldValues, $evidences): array
    {
        $fields = $this->getFieldsForState($stateId);
        $errors = [];

        if ($evidences instanceof Collection) {
            $evidences = $evidences->keyBy('state_field_id')->toArray();
        }

        foreach ($fields as $field) {
            if (! $field->is_required) {
                continue;
            }

            if ($field->field_type === 'text') {
                $value = $fieldValues[$field->field_name] ?? null;
                if (empty($value)) {
                    $errors[] = "El campo '{$field->label}' es requerido";
                }
            } elseif ($field->field_type === 'file') {
                if (! isset($evidences[$field->id])) {
                    $errors[] = "El archivo '{$field->label}' es requerido";
                }
            }
        }

        return $errors;
    }
}
