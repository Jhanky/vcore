<?php

namespace App\Http\Controllers;

use App\Models\Project;
use Illuminate\Http\Request;
use Inertia\Inertia;

class EvidencesController extends Controller
{
    public function index(Request $request)
    {
        $user = auth()->user();

        $query = Project::with(['currentState', 'client', 'documents']);

        if ($user->isTecnico()) {
            $query->where('technical_leader_id', $user->id);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('code', 'like', "%{$search}%")
                    ->orWhere('name', 'like', "%{$search}%");
            });
        }

        $projects = $query->orderBy('created_at', 'desc')
            ->paginate($request->per_page ?? 15)
            ->withQueryString();

        return Inertia::render('evidences/EvidencesPage', [
            'projects' => $projects,
            'filters' => $request->only(['search', 'per_page']),
        ]);
    }
}
