<?php

namespace App\Http\Controllers;

use App\Models\Client;
use App\Models\ClientType;
use App\Services\ConnectionPointService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ClientController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Client::query()->with('clientTypes');

        $user = auth()->user();
        if (! $user->hasRole(['admin', 'gerente'])) {
            $query->where('user_id', $user->id);
        }

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        if ($request->filled('client_type')) {
            $query->whereHas('clientTypes', function ($q) use ($request) {
                $q->where('client_types.id', $request->input('client_type'));
            });
        }

        if ($request->filled('consumption_min') || $request->filled('consumption_max')) {
            $min = $request->input('consumption_min', 0);
            $max = $request->input('consumption_max', 999999);
            $query->whereBetween('energy_consumption_kwh', [$min, $max]);
        }

        $perPage = $request->input('per_page', 10);
        if ($perPage == -1) {
            $perPage = Client::count();
        }

        $clients = $query->orderBy('id', 'desc')
            ->paginate($perPage)
            ->withQueryString();

        $clientTypes = ClientType::active()->orderBy('name')->get();

        // Estadísticas de clientes (filtradas por rol)
        $statsQuery = Client::query();
        if (! $user->isAdminOrGerente()) {
            $statsQuery->where('user_id', $user->id);
        }

        $totalClients = (clone $statsQuery)->count();
        $totalConsumption = (clone $statsQuery)->sum('energy_consumption_kwh') ?? 0;
        $avgConsumption = $totalClients > 0 ? round((clone $statsQuery)->avg('energy_consumption_kwh') ?? 0) : 0;
        $totalMonthlyBill = (clone $statsQuery)->sum('monthly_bill_amount') ?? 0;

        $clientsByType = (clone $statsQuery)->with('clientTypes')
            ->get()
            ->groupBy(fn ($c) => $c->clientTypes->first()?->name ?? 'Sin tipo')
            ->map(fn ($group) => $group->count());

        $statistics = [
            'total' => $totalClients,
            'total_consumption' => (int) $totalConsumption,
            'avg_consumption' => $avgConsumption,
            'total_monthly_bill' => round($totalMonthlyBill),
            'by_type' => $clientsByType,
        ];

        return inertia('Clients/Index', [
            'clients' => $clients,
            'filters' => $request->only(['search', 'client_type', 'consumption_min', 'consumption_max']),
            'clientTypes' => $clientTypes,
            'statistics' => $statistics,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $clientTypes = ClientType::active()->orderBy('name')->get();

        return inertia('Clients/Form', [
            'clientTypes' => $clientTypes,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:clients,email|max:255',
            'phone' => 'required|string|max:255',
            'nic' => 'nullable|string|max:50',
            'address' => 'nullable|string|max:255',
            'city' => 'required|string|max:255',
            'state' => 'required|string|max:255',
            'energy_consumption_kwh' => 'required|integer',
            'monthly_bill_amount' => 'required|numeric',
            'energy_tariff' => 'required|numeric',
            'available_area_m2' => 'nullable|integer',
            'contacts' => 'nullable|array',
            'contacts.*.name' => 'required_with:contacts|string|max:255',
            'contacts.*.position' => 'nullable|string|max:255',
            'contacts.*.email' => 'nullable|email|max:255',
            'contacts.*.phone' => 'nullable|string|max:255',
            'contacts.*.is_primary' => 'boolean',
            'contacts.*.is_decision_maker' => 'boolean',
            'client_types' => 'required|array',
            'client_types.*' => 'exists:client_types,id',
        ]);

        $client = Client::create(array_merge($validated, ['user_id' => Auth::id()]));

        // El observer se encarga de syncar el connection point
        if ($request->has('contacts')) {
            foreach ($request->contacts as $contactData) {
                $client->contacts()->create($contactData);
            }
        }

        if ($request->has('client_types')) {
            $client->clientTypes()->sync($request->client_types);
        }

        session()->put('success', 'Cliente creado exitosamente.');

        return inertia('Clients/Form', [
            'createdClient' => $client->only(['id', 'name']),
        ]);
    }

    /**
     * Display the specified resource.
     */
    public function show(Client $client)
    {
        $user = auth()->user();
        if (! $user->isAdminOrGerente() && $client->user_id !== $user->id) {
            abort(403, 'No tienes permiso para ver este cliente.');
        }

        $client->load(['contacts', 'interactions' => function ($query) {
            $query->orderBy('interaction_date', 'desc');
        }, 'clientTypes', 'connectionPoint', 'quotations']);

        return inertia('Clients/Show', [
            'client' => $client,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Client $client)
    {
        $client->load('contacts', 'clientTypes');
        $clientTypes = ClientType::active()->orderBy('name')->get();

        return inertia('Clients/Form', [
            'client' => $client,
            'clientTypes' => $clientTypes,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Client $client, ConnectionPointService $connectionPointService)
    {
        $user = auth()->user();
        if (! $user->isAdminOrGerente() && $client->user_id !== $user->id) {
            abort(403, 'No tienes permiso para editar este cliente.');
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'nullable|email|max:255|unique:clients,email,'.$client->id,
            'phone' => 'nullable|string|max:255',
            'nic' => 'nullable|string|max:50',
            'address' => 'nullable|string|max:255',
            'city' => 'nullable|string|max:255',
            'state' => 'nullable|string|max:255',
            'energy_consumption_kwh' => 'nullable|integer',
            'monthly_bill_amount' => 'nullable|numeric',
            'energy_tariff' => 'nullable|numeric',
            'available_area_m2' => 'nullable|integer',
            'contacts' => 'nullable|array',
            'contacts.*.id' => 'nullable|exists:client_contacts,id',
            'contacts.*.name' => 'required|string|max:255',
            'contacts.*.position' => 'nullable|string|max:255',
            'contacts.*.email' => 'nullable|email|max:255',
            'contacts.*.phone' => 'nullable|string|max:255',
            'contacts.*.is_primary' => 'boolean',
            'contacts.*.is_decision_maker' => 'boolean',
            'client_types' => 'nullable|array',
            'client_types.*' => 'exists:client_types,id',
        ]);

        $client->update($validated);

        // Sync connection point solo si el NIC cambió
        $currentNic = $client->nic;
        $newNic = $validated['nic'] ?? null;

        if ($newNic !== $currentNic) {
            $this->syncConnectionPoint($client, $newNic, $connectionPointService);
        }

        if ($request->has('contacts')) {
            $contactIds = [];
            foreach ($request->contacts as $contactData) {
                if (isset($contactData['id'])) {
                    $contact = $client->contacts()->find($contactData['id']);
                    if ($contact) {
                        $contact->update($contactData);
                        $contactIds[] = $contact->id;
                    }
                } else {
                    $newContact = $client->contacts()->create($contactData);
                    $contactIds[] = $newContact->id;
                }
            }
            $client->contacts()->whereNotIn('id', $contactIds)->delete();
        } else {
            $client->contacts()->delete();
        }

        if ($request->has('client_types')) {
            $client->clientTypes()->sync($request->client_types);
        }

        session()->put('success', 'Cliente actualizado exitosamente.');

        return redirect()->route('clients.show', $client);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Client $client)
    {
        $user = auth()->user();
        if (! $user->isAdminOrGerente() && $client->user_id !== $user->id) {
            abort(403, 'No tienes permiso para eliminar este cliente.');
        }

        $client->delete();

        session()->put('success', 'Cliente eliminado exitosamente.');

        return redirect()->route('clients.index');
    }

    public function destroyMultiple(Request $request)
    {
        $user = auth()->user();
        $ids = $request->input('ids', []);

        if (! $user->isAdminOrGerente()) {
            $ids = Client::whereIn('id', $ids)->where('user_id', $user->id)->pluck('id')->toArray();
        }

        Client::whereIn('id', $ids)->delete();

        session()->put('success', count($ids).' cliente(s) eliminado(s) exitosamente.');

        return redirect()->route('clients.index');
    }

    private function syncConnectionPoint(Client $client, ?string $nic, ConnectionPointService $connectionPointService): void
    {
        if (empty($nic)) {
            // Si no hay NIC, eliminar connection point existente si hay
            $client->connectionPoint()?->delete();

            return;
        }

        $data = $connectionPointService->search($nic);

        if ($data !== null) {
            // Crear o actualizar connection point
            $client->connectionPoint()->updateOrCreate(
                ['client_id' => $client->id],
                $data
            );
        } else {
            // No se encontró en ninguno, limpiar el NIC del cliente
            $client->update(['nic' => null]);
            $client->connectionPoint()?->delete();
        }
    }
}
