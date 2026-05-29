<?php

namespace App\Http\Controllers;

use App\Models\Maintenance;
use App\Models\Project;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MaintenanceController extends Controller
{
    public function index(Request $request)
    {
        $user = auth()->user();
        $canManage = $user->hasPermissionTo('manage maintenances');

        $query = Maintenance::with(['project', 'technicians', 'creator']);

        if ($user->isTecnico()) {
            $query->byTechnician($user->id);
        }

        if ($request->filled('status')) {
            $query->byStatus($request->status);
        }

        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        if ($request->filled('priority')) {
            $query->where('priority', $request->priority);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('code', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        $maintenances = $query->orderBy('scheduled_date', 'desc')
            ->paginate($request->per_page ?? 15)
            ->withQueryString();

        $technicians = User::role('tecnico')->select('id', 'name')->get();

        $projects = [];
        if ($canManage) {
            $projects = Project::select('id', 'code', 'name')->where('is_active', true)->get();
        }

        return Inertia::render('Maintenance/Index', [
            'maintenances' => $maintenances,
            'filters' => $request->only(['search', 'status', 'type', 'priority', 'per_page']),
            'canManage' => $canManage,
            'technicians' => $technicians,
            'projects' => $projects,
        ]);
    }

    public function show(Maintenance $maintenance)
    {
        $maintenance->load(['project', 'technicians', 'creator']);
        $canManage = auth()->user()->hasPermissionTo('manage maintenances');
        $isAssigned = $maintenance->technicians->contains(auth()->id());

        return Inertia::render('Maintenance/Show', [
            'maintenance' => $maintenance,
            'canManage' => $canManage,
            'isAssigned' => $isAssigned,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'project_id' => 'nullable|exists:projects,id',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'type' => 'required|in:preventivo,correctivo',
            'priority' => 'required|in:baja,media,alta,critica',
            'scheduled_date' => 'required|date',
            'estimated_hours' => 'nullable|numeric|min:0',
            'technicians' => 'required|array|min:1',
            'technicians.*.id' => 'required|exists:users,id',
            'technicians.*.role' => 'required|in:lider,apoyo',
        ]);

        $validated = array_map(fn ($v) => $v === '' ? null : $v, $validated);

        $maintenance = Maintenance::create([
            'code' => Maintenance::generateCode(),
            'project_id' => $validated['project_id'],
            'title' => $validated['title'],
            'description' => $validated['description'],
            'type' => $validated['type'],
            'priority' => $validated['priority'],
            'scheduled_date' => $validated['scheduled_date'],
            'estimated_hours' => $validated['estimated_hours'],
            'created_by' => auth()->id(),
        ]);

        foreach ($validated['technicians'] as $tech) {
            $maintenance->technicians()->attach($tech['id'], ['role' => $tech['role']]);
        }

        return redirect()->route('maintenances.index')
            ->with('success', 'Mantenimiento creado correctamente.');
    }

    public function update(Request $request, Maintenance $maintenance)
    {
        $validated = $request->validate([
            'project_id' => 'nullable|exists:projects,id',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'type' => 'required|in:preventivo,correctivo',
            'priority' => 'required|in:baja,media,alta,critica',
            'scheduled_date' => 'required|date',
            'estimated_hours' => 'nullable|numeric|min:0',
            'technicians' => 'sometimes|array|min:1',
            'technicians.*.id' => 'required_with:technicians|exists:users,id',
            'technicians.*.role' => 'required_with:technicians|in:lider,apoyo',
        ]);

        $validated = array_map(fn ($v) => $v === '' ? null : $v, $validated);

        $maintenance->update([
            'project_id' => $validated['project_id'],
            'title' => $validated['title'],
            'description' => $validated['description'],
            'type' => $validated['type'],
            'priority' => $validated['priority'],
            'scheduled_date' => $validated['scheduled_date'],
            'estimated_hours' => $validated['estimated_hours'],
        ]);

        if (isset($validated['technicians'])) {
            $maintenance->technicians()->sync(
                collect($validated['technicians'])->mapWithKeys(
                    fn ($t) => [$t['id'] => ['role' => $t['role']]]
                )
            );
        }

        return redirect()->route('maintenances.index')
            ->with('success', 'Mantenimiento actualizado correctamente.');
    }

    public function startMaintenance(Maintenance $maintenance)
    {
        $maintenance->update(['status' => 'en_progreso']);

        return redirect()->back()->with('success', 'Mantenimiento iniciado.');
    }

    public function completeMaintenance(Request $request, Maintenance $maintenance)
    {
        $validated = $request->validate([
            'completion_notes' => 'nullable|string',
        ]);

        $maintenance->update([
            'status' => 'completado',
            'completed_date' => now(),
            'completion_notes' => $validated['completion_notes'],
        ]);

        return redirect()->back()->with('success', 'Mantenimiento completado.');
    }

    public function cancelMaintenance(Request $request, Maintenance $maintenance)
    {
        $validated = $request->validate([
            'completion_notes' => 'nullable|string',
        ]);

        $maintenance->update([
            'status' => 'cancelado',
            'completion_notes' => $validated['completion_notes'] ?? $maintenance->completion_notes,
        ]);

        return redirect()->back()->with('success', 'Mantenimiento cancelado.');
    }
}
