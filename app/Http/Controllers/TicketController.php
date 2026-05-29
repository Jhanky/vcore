<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\Ticket;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TicketController extends Controller
{
    public function index(Request $request)
    {
        $user = auth()->user();
        $canManage = $user->hasPermissionTo('manage tickets');

        $query = Ticket::with(['project', 'assignee', 'creator']);

        if ($user->isTecnico()) {
            $query->where(function ($q) use ($user) {
                $q->byAssignee($user->id)
                    ->orWhere('created_by', $user->id);
            });
        }

        if ($request->filled('status')) {
            $query->byStatus($request->status);
        }

        if ($request->filled('priority')) {
            $query->where('priority', $request->priority);
        }

        if ($request->filled('category')) {
            $query->where('category', $request->category);
        }

        if ($request->filled('assigned_to')) {
            $query->where('assigned_to', $request->assigned_to);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('code', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        $tickets = $query->orderBy('created_at', 'desc')
            ->paginate($request->per_page ?? 15)
            ->withQueryString();

        $technicians = User::role('tecnico')->select('id', 'name')->get();
        $projects = Project::select('id', 'code', 'name')->where('is_active', true)->get();

        return Inertia::render('Tickets/Index', [
            'tickets' => $tickets,
            'filters' => $request->only(['search', 'status', 'priority', 'category', 'assigned_to', 'per_page']),
            'canManage' => $canManage,
            'technicians' => $technicians,
            'projects' => $projects,
        ]);
    }

    public function show(Ticket $ticket)
    {
        $ticket->load(['project', 'assignee', 'creator', 'comments.user']);

        return Inertia::render('Tickets/Show', [
            'ticket' => $ticket,
            'canManage' => auth()->user()->hasPermissionTo('manage tickets'),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'project_id' => 'nullable|exists:projects,id',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'category' => 'required|in:electrico,estructural,equipo,comunicacion,otro',
            'priority' => 'required|in:baja,media,alta,critica',
            'assigned_to' => 'nullable|exists:users,id',
        ]);

        $validated = array_map(fn ($v) => $v === '' ? null : $v, $validated);

        Ticket::create([
            'code' => Ticket::generateCode(),
            'project_id' => $validated['project_id'],
            'title' => $validated['title'],
            'description' => $validated['description'],
            'category' => $validated['category'],
            'priority' => $validated['priority'],
            'assigned_to' => $validated['assigned_to'],
            'created_by' => auth()->id(),
        ]);

        return redirect()->route('tickets.index')
            ->with('success', 'Ticket creado correctamente.');
    }

    public function update(Request $request, Ticket $ticket)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'category' => 'required|in:electrico,estructural,equipo,comunicacion,otro',
            'priority' => 'required|in:baja,media,alta,critica',
            'assigned_to' => 'nullable|exists:users,id',
            'status' => 'sometimes|in:abierto,en_progreso,resuelto,cerrado',
        ]);

        $validated = array_map(fn ($v) => $v === '' ? null : $v, $validated);

        $data = $validated;

        if (isset($validated['status']) && $validated['status'] === 'resuelto' && ! $ticket->resolved_at) {
            $data['resolved_at'] = now();
        }

        $ticket->update($data);

        return redirect()->route('tickets.index')
            ->with('success', 'Ticket actualizado correctamente.');
    }

    public function assign(Request $request, Ticket $ticket)
    {
        $validated = $request->validate([
            'assigned_to' => 'required|exists:users,id',
        ]);

        $ticket->update([
            'assigned_to' => $validated['assigned_to'],
            'status' => 'en_progreso',
        ]);

        return redirect()->back()->with('success', 'Ticket asignado correctamente.');
    }

    public function addComment(Request $request, Ticket $ticket)
    {
        $validated = $request->validate([
            'comment' => 'required|string',
        ]);

        $ticket->comments()->create([
            'user_id' => auth()->id(),
            'comment' => $validated['comment'],
        ]);

        return redirect()->back()->with('success', 'Comentario agregado.');
    }

    public function resolve(Request $request, Ticket $ticket)
    {
        $validated = $request->validate([
            'resolution_notes' => 'nullable|string',
        ]);

        $ticket->update([
            'status' => 'resuelto',
            'resolved_at' => now(),
            'resolution_notes' => $validated['resolution_notes'],
        ]);

        return redirect()->back()->with('success', 'Ticket resuelto.');
    }

    public function close(Ticket $ticket)
    {
        $ticket->update(['status' => 'cerrado']);

        return redirect()->back()->with('success', 'Ticket cerrado.');
    }
}
