<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\Ticket;
use App\Models\TicketAttachment;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class TicketController extends Controller
{
    public function index(Request $request)
    {
        $user = auth()->user();
        $canManage = $user->hasRole(['admin', 'gerente', 'tecnico']);

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
        $ticket->load(['project', 'assignee', 'creator', 'comments.user', 'comments.attachments', 'attachments']);

        return Inertia::render('Tickets/Show', [
            'ticket' => $ticket,
            'canManage' => auth()->user()->hasRole(['admin', 'gerente', 'tecnico']),
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
            'files' => 'nullable|array',
            'files.*' => 'file|mimes:jpg,jpeg,png,gif,webp,mp4,mov,avi,pdf,doc,docx,xls,xlsx|max:20480',
        ]);

        $validated = array_map(fn ($v) => $v === '' ? null : $v, $validated);

        $ticket = Ticket::create([
            'code' => Ticket::generateCode(),
            'project_id' => $validated['project_id'],
            'title' => $validated['title'],
            'description' => $validated['description'],
            'category' => $validated['category'],
            'priority' => $validated['priority'],
            'assigned_to' => $validated['assigned_to'],
            'created_by' => auth()->id(),
        ]);

        $this->storeAttachments($request, $ticket);

        return redirect()->route('tickets.index')
            ->with('success', 'Ticket creado correctamente.');
    }

    private function storeAttachments(Request $request, $attachable): void
    {
        if ($request->hasFile('files')) {
            foreach ($request->file('files') as $file) {
                $filename = $file->getClientOriginalName();
                $path = $file->storeAs(
                    'tickets/' . $attachable->id,
                    time() . '_' . $filename,
                    'public'
                );

                $attachable->attachments()->create([
                    'original_filename' => $filename,
                    'file_path' => $path,
                    'file_size' => $file->getSize(),
                    'mime_type' => $file->getMimeType(),
                    'uploader_id' => auth()->id(),
                ]);
            }
        }
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
            'files' => 'nullable|array',
            'files.*' => 'file|mimes:jpg,jpeg,png,gif,webp,mp4,mov,avi,pdf,doc,docx,xls,xlsx|max:20480',
        ]);

        $comment = $ticket->comments()->create([
            'user_id' => auth()->id(),
            'comment' => $validated['comment'],
        ]);

        $this->storeAttachments($request, $comment);

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

    public function downloadAttachment(TicketAttachment $attachment)
    {
        if (!Storage::disk('public')->exists($attachment->file_path)) {
            return redirect()->back()->with('error', 'El archivo no existe.');
        }

        return Storage::disk('public')->download($attachment->file_path, $attachment->original_filename);
    }

    public function serveAttachment(TicketAttachment $attachment)
    {
        if (!Storage::disk('public')->exists($attachment->file_path)) {
            abort(404);
        }

        return Storage::disk('public')->response($attachment->file_path, null, [
            'Content-Type' => $attachment->mime_type ?? 'application/octet-stream',
            'Content-Disposition' => 'inline; filename="' . $attachment->original_filename . '"',
        ]);
    }
}
