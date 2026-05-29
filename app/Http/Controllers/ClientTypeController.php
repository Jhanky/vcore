<?php

namespace App\Http\Controllers;

use App\Models\ClientType;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ClientTypeController extends Controller
{
    private function authorizeManagement(): void
    {
        if (! auth()->user()->isAdminOrGerente()) {
            abort(403, 'No tienes permiso para gestionar tipos de cliente.');
        }
    }

    public function index(Request $request)
    {
        $perPage = $request->integer('per_page', 10);
        $search = $request->string('search', '');

        $query = ClientType::orderBy('name');

        if ($search->isNotEmpty()) {
            $query->where('name', 'like', "%{$search}%")
                ->orWhere('code', 'like', "%{$search}%");
        }

        if ($perPage === -1) {
            $clientTypes = $query->paginate($query->count());
        } else {
            $clientTypes = $query->paginate($perPage);
        }

        return Inertia::render('client-types/Index', [
            'clientTypes' => $clientTypes,
        ]);
    }

    public function store(Request $request)
    {
        $this->authorizeManagement();
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:10|unique:client_types,code',
            'active' => 'boolean',
        ]);

        ClientType::create($validated);

        session()->put('success', 'Tipo de cliente creado exitosamente.');

        return redirect()->route('client-types.index');
    }

    public function update(Request $request, ClientType $clientType)
    {
        $this->authorizeManagement();
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:10|unique:client_types,code,'.$clientType->id,
            'active' => 'boolean',
        ]);

        $clientType->update($validated);

        session()->put('success', 'Tipo de cliente actualizado exitosamente.');

        return redirect()->route('client-types.index');
    }

    public function destroy(ClientType $clientType)
    {
        $this->authorizeManagement();
        $clientType->delete();

        session()->put('success', 'Tipo de cliente eliminado exitosamente.');

        return redirect()->route('client-types.index');
    }
}
