<?php

namespace App\Http\Controllers;

use App\Models\Client;
use Illuminate\Http\Request;

class ClientInteractionController extends Controller
{
    public function store(Request $request, Client $client)
    {
        $user = auth()->user();
        if (! $user->isAdminOrGerente() && $client->user_id !== $user->id) {
            abort(403, 'No tienes permiso para registrar interacciones en este cliente.');
        }

        $validated = $request->validate([
            'type' => 'required|in:Llamada,Correo,Visita,Nota',
            'notes' => 'nullable|string',
            'interaction_date' => 'required|date',
        ]);

        $client->interactions()->create($validated);

        session()->put('success', 'Interacción registrada exitosamente.');

        return back();
    }
}
