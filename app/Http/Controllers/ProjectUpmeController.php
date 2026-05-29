<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\ProjectUpmeDetail;
use Illuminate\Http\Request;

class ProjectUpmeController extends Controller
{
    private function authorize(): void
    {
        if (! auth()->user()->isAdminOrGerente()) {
            abort(403, 'No tienes permiso para gestionar datos UPME.');
        }
    }

    public function show(Project $project)
    {
        $this->authorize();
        $upmeDetail = $project->upmeDetail;

        if (! $upmeDetail) {
            $upmeDetail = ProjectUpmeDetail::create([
                'project_id' => $project->id,
                'status' => 'pending',
            ]);
        }

        return response()->json(['upme' => $upmeDetail]);
    }

    public function update(Request $request, Project $project)
    {
        $this->authorize();
        $validated = $request->validate([
            'upme_registration_number' => 'nullable|string|max:100',
            'registration_date' => 'nullable|date',
            'generation_capacity_kw' => 'nullable|numeric|min:0',
            'system_type' => 'nullable|string|max:100',
            'connection_type' => 'nullable|string|max:100',
            'grid_integration_date' => 'nullable|date',
            'status' => 'nullable|in:pending,in_review,approved,rejected',
            'documentation' => 'nullable|array',
            'notes' => 'nullable|string',
        ]);

        $upmeDetail = $project->upmeDetail;

        if (! $upmeDetail) {
            $upmeDetail = ProjectUpmeDetail::create([
                'project_id' => $project->id,
                ...$validated,
            ]);
        } else {
            $upmeDetail->update($validated);
        }

        session()->put('success', 'Datos UPME actualizados correctamente.');

        return back();
    }
}
