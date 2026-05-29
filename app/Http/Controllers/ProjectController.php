<?php

namespace App\Http\Controllers;

use App\Models\Client;
use App\Models\Milestone;
use App\Models\Project;
use App\Models\ProjectDocument;
use App\Models\ProjectState;
use App\Models\ProjectStateField;
use App\Models\TransitionEvidence;
use App\Models\User;
use App\Services\ProjectService;
use App\Services\StateFieldService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class ProjectController extends Controller
{
    public function __construct(
        private ProjectService $projectService,
        private StateFieldService $stateFieldService
    ) {}

    private function authorizeProjectView(Project $project): void
    {
        $user = auth()->user();
        if (! $user->isAdminOrGerente() && $project->user_id !== $user->id) {
            abort(403, 'No tienes permiso para ver este proyecto.');
        }
    }

    private function authorizeProjectModification(Project $project): void
    {
        $user = auth()->user();
        if (! $user->isAdminOrGerente()) {
            abort(403, 'No tienes permiso para modificar este proyecto.');
        }
    }

    public function index(Request $request)
    {
        $filters = $request->only(['search', 'state_id', 'client_id', 'manager_id', 'priority', 'is_active', 'start_date', 'end_date']);
        $perPage = $request->input('per_page', 15);

        $projects = $this->projectService->list($filters, $perPage, auth()->user());
        $states = $this->projectService->getStates();
        $statistics = $this->projectService->getStatistics(auth()->user());

        return Inertia::render('projects/ProjectsPage', [
            'projects' => $projects,
            'states' => $states,
            'statistics' => $statistics,
            'filters' => $filters,
        ]);
    }

    public function create()
    {
        $clients = Client::select('id', 'name', 'email')->get();
        $users = User::select('id', 'name')->get();
        $states = $this->projectService->getStates();

        return Inertia::render('projects/ProjectModal', [
            'clients' => $clients,
            'users' => $users,
            'states' => $states,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'client_id' => 'required|exists:clients,id',
            'quotation_id' => 'nullable|exists:quotations,id',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'installation_address' => 'nullable|string|max:500',
            'coordinates' => 'nullable|string|max:100',
            'start_date' => 'nullable|date',
            'estimated_end_date' => 'nullable|date|after_or_equal:start_date',
            'contracted_value_cop' => 'nullable|numeric|min:0',
            'project_manager_id' => 'nullable|exists:users,id',
            'technical_leader_id' => 'nullable|exists:users,id',
            'priority' => 'nullable|in:baja,media,alta',
        ]);

        $validated['user_id'] = Auth::id();
        $project = $this->projectService->create($validated);

        session()->put('success', "Proyecto {$project->code} creado exitosamente.");

        return redirect()->route('projects.show', $project->id);
    }

    public function show(Project $project)
    {
        $this->authorizeProjectView($project);
        $project = $this->projectService->getById($project->id);

        if (! $project) {
            abort(404, 'Proyecto no encontrado');
        }

        $availableStates = $this->projectService->getAvailableStates($project);
        $requirements = $this->projectService->getRequirements($project);
        $milestoneTypes = $this->projectService->getMilestoneTypes();

        return Inertia::render('projects/ProjectDetailsPage', [
            'project' => $project,
            'availableStates' => $availableStates,
            'requirements' => $requirements,
            'milestoneTypes' => $milestoneTypes,
        ]);
    }

    public function edit(Project $project)
    {
        $this->authorizeProjectModification($project);
        $project = $this->projectService->getById($project->id);
        $clients = Client::select('id', 'name', 'email')->get();
        $users = User::select('id', 'name')->get();
        $states = $this->projectService->getStates();

        return Inertia::render('projects/ProjectModal', [
            'project' => $project,
            'clients' => $clients,
            'users' => $users,
            'states' => $states,
            'isEditing' => true,
        ]);
    }

    public function update(Request $request, Project $project)
    {
        $this->authorizeProjectModification($project);
        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'installation_address' => 'nullable|string|max:500',
            'coordinates' => 'nullable|string|max:100',
            'start_date' => 'nullable|date',
            'estimated_end_date' => 'nullable|date',
            'actual_end_date' => 'nullable|date',
            'contracted_value_cop' => 'nullable|numeric|min:0',
            'total_cost_cop' => 'nullable|numeric|min:0',
            'project_manager_id' => 'nullable|exists:users,id',
            'technical_leader_id' => 'nullable|exists:users,id',
            'priority' => 'nullable|in:baja,media,alta',
            'notes' => 'nullable|string',
            'is_active' => 'nullable|boolean',
        ]);

        $updatedProject = $this->projectService->update($project, $validated);

        session()->put('success', 'Proyecto actualizado correctamente.');

        return back();
    }

    public function destroy(Project $project)
    {
        $this->authorizeProjectModification($project);
        $this->projectService->softDelete($project);

        session()->put('success', 'Proyecto eliminado.');

        return redirect()->route('projects.index');
    }

    public function changeStatus(Request $request, Project $project)
    {
        $this->authorizeProjectModification($project);
        $validated = $request->validate([
            'status_id' => 'required|exists:project_states,id',
            'reason' => 'nullable|string|max:500',
            'notes' => 'nullable|string',
            'file' => 'nullable|file|max:10240|mimes:pdf,jpg,jpeg,png,gif,webp,doc,docx,xls,xlsx',
            'field_values' => 'nullable|array',
            'temporary_token' => 'nullable|string',
        ]);

        $newStateId = $validated['status_id'];
        $fieldValues = $validated['field_values'] ?? [];
        $temporaryToken = $validated['temporary_token'] ?? '';

        if ($temporaryToken) {
            $evidencesCollection = $this->stateFieldService->getEvidencesByToken($project, $temporaryToken);
            $evidencesKeyed = $evidencesCollection->keyBy('state_field_id');

            $errors = $this->stateFieldService->validateRequiredFields(
                $newStateId,
                $fieldValues,
                $evidencesKeyed
            );

            if (! empty($errors)) {
                return back()->withErrors(['fields' => $errors]);
            }
        }

        try {
            $this->projectService->changeStatus(
                $project,
                $newStateId,
                $validated['reason'] ?? null,
                $validated['notes'] ?? null,
                Auth::id(),
                $request->hasFile('file') ? $request->file('file') : null,
                $fieldValues,
                $temporaryToken
            );

            session()->put('success', 'Estado actualizado correctamente.');

            return back();
        } catch (\InvalidArgumentException $e) {
            session()->put('error', $e->getMessage());

            return back()->withErrors(['status' => $e->getMessage()]);
        }
    }

    public function addNote(Request $request, Project $project)
    {
        $this->authorizeProjectView($project);
        $validated = $request->validate([
            'content' => 'required|string|max:2000',
            'file' => 'nullable|file|max:10240|mimes:pdf,jpg,jpeg,png,gif,webp,doc,docx,xls,xlsx',
        ]);

        $this->projectService->addNote(
            $project,
            $validated['content'],
            Auth::id(),
            $request->hasFile('file') ? $request->file('file') : null
        );

        session()->put('success', 'Nota agregada correctamente.');

        return back();
    }

    public function uploadDocument(Request $request, Project $project)
    {
        $this->authorizeProjectModification($project);
        $validated = $request->validate([
            'required_document_id' => 'nullable|exists:required_documents,id',
            'name' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'file' => 'required|file|max:10240|mimes:pdf,jpg,jpeg,png,gif,webp,doc,docx,xls,xlsx',
        ]);

        $file = $request->file('file');
        $document = $this->projectService->uploadDocument($project, $validated, $file, Auth::id());

        session()->put('success', 'Documento subido correctamente.');

        return back();
    }

    public function downloadDocument(Project $project, ProjectDocument $document)
    {
        if ($document->project_id !== $project->id) {
            abort(403, 'Documento no pertenece a este proyecto');
        }

        if (! Storage::exists($document->file_path)) {
            abort(404, 'Archivo no encontrado');
        }

        return Storage::download($document->file_path, $document->original_filename);
    }

    public function deleteDocument(Project $project, ProjectDocument $document)
    {
        $this->authorizeProjectModification($project);
        if ($document->project_id !== $project->id) {
            abort(403, 'Documento no pertenece a este proyecto');
        }

        $this->projectService->deleteDocument($document);

        session()->put('success', 'Documento eliminado.');

        return back();
    }

    public function downloadNote(Project $project, ProjectNote $note)
    {
        if ($note->project_id !== $project->id) {
            abort(403, 'Nota no pertenece a este proyecto');
        }

        if (! $note->file_path || ! Storage::exists($note->file_path)) {
            abort(404, 'Archivo no encontrado');
        }

        return Storage::download($note->file_path, $note->original_filename);
    }

    public function downloadTransition(Project $project, ProjectStateHistory $history)
    {
        if ($history->project_id !== $project->id) {
            abort(403, 'Transición no pertenece a este proyecto');
        }

        if (! $history->file_path || ! Storage::exists($history->file_path)) {
            abort(404, 'Archivo no encontrado');
        }

        return Storage::download($history->file_path, $history->original_filename);
    }

    public function history(Project $project)
    {
        $history = $this->projectService->getHistory($project);
        $notes = $this->projectService->getAllNotes($project);

        return response()->json([
            'history' => $history,
            'notes' => $notes,
        ]);
    }

    public function documents(Project $project)
    {
        $documents = $this->projectService->getAllDocuments($project);

        return response()->json(['documents' => $documents]);
    }

    public function requirements(Project $project)
    {
        $requirements = $this->projectService->getRequirements($project);

        return response()->json(['requirements' => $requirements]);
    }

    public function states()
    {
        $states = $this->projectService->getStates();

        return response()->json(['states' => $states]);
    }

    public function statistics()
    {
        $statistics = $this->projectService->getStatistics(auth()->user());

        return response()->json(['statistics' => $statistics]);
    }

    public function milestones(Project $project)
    {
        $milestones = $project->milestones()->with(['milestoneType', 'responsible'])->get();

        return response()->json(['milestones' => $milestones]);
    }

    public function storeMilestone(Request $request, Project $project)
    {
        $this->authorizeProjectModification($project);
        $validated = $request->validate([
            'milestone_type_id' => 'nullable|exists:milestone_types,id',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'planned_date' => 'nullable|date',
            'amount_cop' => 'nullable|numeric|min:0',
            'requires_verification' => 'nullable|boolean',
            'responsible_user_id' => 'nullable|exists:users,id',
        ]);

        $milestone = $this->projectService->createMilestone($project, $validated);

        session()->put('success', 'Hito creado correctamente.');

        return back();
    }

    public function updateMilestone(Request $request, Project $project, Milestone $milestone)
    {
        $this->authorizeProjectModification($project);
        if ($milestone->project_id !== $project->id) {
            abort(403, 'Hito no pertenece a este proyecto');
        }

        $validated = $request->validate([
            'milestone_type_id' => 'nullable|exists:milestone_types,id',
            'title' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'planned_date' => 'nullable|date',
            'actual_date' => 'nullable|date',
            'status' => 'nullable|in:pending,in_progress,completed,delayed,cancelled',
            'amount_cop' => 'nullable|numeric|min:0',
            'requires_verification' => 'nullable|boolean',
            'verified_by' => 'nullable|exists:users,id',
            'verified_at' => 'nullable|date',
            'responsible_user_id' => 'nullable|exists:users,id',
            'notes' => 'nullable|string',
        ]);

        $this->projectService->updateMilestone($milestone, $validated);

        session()->put('success', 'Hito actualizado correctamente.');

        return back();
    }

    public function completeMilestone(Request $request, Project $project, Milestone $milestone)
    {
        $this->authorizeProjectModification($project);
        if ($milestone->project_id !== $project->id) {
            abort(403, 'Hito no pertenece a este proyecto');
        }

        $this->projectService->completeMilestone($milestone, Auth::id());

        session()->put('success', 'Hito completado.');

        return back();
    }

    public function getStateFields(Project $project, ProjectState $state)
    {
        $fields = $this->stateFieldService->getFieldsForState($state->id);

        return response()->json(['fields' => $fields]);
    }

    public function uploadTransitionEvidence(Request $request, Project $project)
    {
        $this->authorizeProjectModification($project);
        $validated = $request->validate([
            'state_field_id' => 'required|exists:project_state_fields,id',
            'file' => 'required|file|max:10240|mimes:pdf,jpg,jpeg,png,gif,webp,doc,docx,xls,xlsx',
            'temporary_token' => 'required|string',
        ]);

        $evidence = $this->stateFieldService->uploadEvidence(
            $project,
            $validated['state_field_id'],
            $request->file('file'),
            $validated['temporary_token']
        );

        return response()->json(['evidence' => $evidence]);
    }

    public function deleteTransitionEvidence(Project $project, TransitionEvidence $evidence)
    {
        $this->authorizeProjectModification($project);
        if ($evidence->project_id !== $project->id) {
            abort(403, 'Evidencia no pertenece a este proyecto');
        }

        $this->stateFieldService->deleteEvidence($evidence);

        return response()->json(['success' => true]);
    }

    public function getTransitionEvidences(Project $project)
    {
        $token = request('token');
        $evidences = $this->stateFieldService->getEvidencesByToken($project, $token);

        return response()->json(['evidences' => $evidences]);
    }

    public function getFieldValues(Project $project)
    {
        $stateId = $project->current_state_id;
        $fields = $this->projectService->getFieldValuesWithStatus($project, $stateId);

        return response()->json(['fields' => $fields]);
    }

    public function saveFieldValues(Request $request, Project $project)
    {
        $this->authorizeProjectModification($project);
        $validated = $request->validate([
            'field_values' => 'required|array',
            'field_values.*' => 'nullable|string',
        ]);

        $this->projectService->saveFieldValues(
            $project,
            $validated['field_values'],
            Auth::id()
        );

        session()->put('success', 'Datos guardados correctamente.');

        return back();
    }

    public function uploadFieldDocument(Request $request, Project $project)
    {
        $this->authorizeProjectModification($project);
        $validated = $request->validate([
            'state_field_id' => 'required|exists:project_state_fields,id',
            'file' => 'required|file|max:10240|mimes:pdf,jpg,jpeg,png,gif,webp,doc,docx,xls,xlsx',
        ]);

        try {
            $file = $request->file('file');
            $filename = $file->getClientOriginalName();
            $path = $file->storeAs(
                "projects/{$project->id}/field-documents",
                time().'_'.$filename
            );

            $doc = ProjectDocument::updateOrCreate(
                [
                    'project_id' => $project->id,
                    'state_field_id' => $validated['state_field_id'],
                ],
                [
                    'name' => $filename,
                    'original_filename' => $filename,
                    'file_path' => $path,
                    'file_size' => $file->getSize(),
                    'mime_type' => $file->getMimeType(),
                    'uploader_id' => Auth::id(),
                ]
            );

            return response()->json(['success' => true, 'document' => $doc]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function getDocumentsTab(Project $project)
    {
        $stateId = $project->current_state_id;

        $fields = ProjectStateField::where('state_id', $stateId)
            ->orderBy('display_order')
            ->get();

        $fieldValues = $this->projectService->getFieldValuesForState($project, $stateId)
            ->keyBy('state_field_id');

        $documents = ProjectDocument::where('project_id', $project->id)
            ->whereNotNull('state_field_id')
            ->with('uploader')
            ->get()
            ->keyBy('state_field_id');

        $documentsList = $fields->map(function ($field) use ($fieldValues, $documents) {
            $fieldValue = $fieldValues->get($field->id);
            $document = $documents->get($field->id);

            return [
                'id' => $field->id,
                'field_name' => $field->field_name,
                'label' => $field->label,
                'field_type' => $field->field_type,
                'is_required' => $field->is_required,
                'text_value' => $fieldValue?->text_value,
                'text_updated_by' => $fieldValue?->createdBy?->name,
                'text_updated_at' => $fieldValue?->created_at,
                'document' => $document ? [
                    'id' => $document->id,
                    'original_filename' => $document->original_filename,
                    'uploader_name' => $document->uploader?->name,
                    'uploaded_at' => $document->created_at,
                ] : null,
            ];
        })->toArray();

        return response()->json(['documents' => $documentsList]);
    }
}
