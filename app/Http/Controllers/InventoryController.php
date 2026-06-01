<?php

namespace App\Http\Controllers;

use App\Models\InventoryItem;
use App\Models\Project;
use App\Services\InventoryService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class InventoryController extends Controller
{
    public function __construct(
        private InventoryService $inventoryService
    ) {}

    public function index(Request $request)
    {
        $user = auth()->user();
        $canManage = $user->hasRole(['admin', 'gerente', 'tecnico']);

        $items = $this->inventoryService->list(
            $request->only(['search', 'type', 'status', 'location_type', 'low_stock']),
            $request->per_page ?? 15
        );

        $projects = Project::select('id', 'code', 'name')
            ->orderBy('code')
            ->get();

        return Inertia::render('Inventory/Index', [
            'items' => $items,
            'filters' => $request->only(['search', 'type', 'status', 'location_type', 'low_stock', 'per_page']),
            'canManage' => $canManage,
            'projects' => $projects,
        ]);
    }

    public function show(InventoryItem $inventoryItem)
    {
        $inventoryItem->load(['project', 'movements' => function ($q) {
            $q->with('user')->latest()->limit(50);
        }]);

        return Inertia::render('Inventory/Show', [
            'item' => $inventoryItem,
            'canManage' => auth()->user()->hasRole(['admin', 'gerente', 'tecnico']),
        ]);
    }

    public function store(Request $request)
    {
        $type = $request->input('type', 'material');

        $rules = [
            'type' => 'required|in:material,tool',
            'code' => 'nullable|string|max:100',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'brand' => 'nullable|string|max:255',
            'unit' => 'required|string|max:50',
            'quantity' => 'required|numeric|min:0',
            'min_stock' => 'nullable|numeric|min:0',
            'purchase_cost' => 'nullable|numeric|min:0',
            'last_maintenance' => 'nullable|date',
            'location_type' => 'required|in:warehouse,project',
            'project_id' => 'nullable|exists:projects,id',
            'warehouse_location' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
        ];

        if ($type === 'tool') {
            $rules['model'] = 'nullable|string|max:255';
            $rules['serial_number'] = 'nullable|string|max:255';
            $rules['maintenance_interval_days'] = 'nullable|integer|min:1';
            $rules['status'] = 'nullable|in:disponible,en_proyecto,en_mantenimiento,dado_de_baja';
        } else {
            $rules['supplier'] = 'nullable|string|max:255';
            $rules['category'] = 'nullable|in:cable,panel,inversor,bateria,estructura,proteccion,conector,tuberia,otro';
            $rules['status'] = 'nullable|in:disponible,en_proyecto,agotado,descontinuado';
        }

        $validated = $request->validate($rules);

        $this->inventoryService->create($validated, $request->user());

        return redirect()->route('inventory.index')
            ->with('success', 'Item creado correctamente.');
    }

    public function update(Request $request, InventoryItem $inventoryItem)
    {
        $type = $request->input('type', $inventoryItem->type);

        $rules = [
            'type' => 'required|in:material,tool',
            'code' => 'nullable|string|max:100',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'brand' => 'nullable|string|max:255',
            'unit' => 'required|string|max:50',
            'quantity' => 'required|numeric|min:0',
            'min_stock' => 'nullable|numeric|min:0',
            'purchase_cost' => 'nullable|numeric|min:0',
            'last_maintenance' => 'nullable|date',
            'location_type' => 'required|in:warehouse,project',
            'project_id' => 'nullable|exists:projects,id',
            'warehouse_location' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
            'is_active' => 'boolean',
        ];

        if ($type === 'tool') {
            $rules['model'] = 'nullable|string|max:255';
            $rules['serial_number'] = 'nullable|string|max:255';
            $rules['maintenance_interval_days'] = 'nullable|integer|min:1';
            $rules['status'] = 'nullable|in:disponible,en_proyecto,en_mantenimiento,dado_de_baja';
        } else {
            $rules['supplier'] = 'nullable|string|max:255';
            $rules['category'] = 'nullable|in:cable,panel,inversor,bateria,estructura,proteccion,conector,tuberia,otro';
            $rules['status'] = 'nullable|in:disponible,en_proyecto,agotado,descontinuado';
        }

        $validated = $request->validate($rules);

        $this->inventoryService->update($inventoryItem, $validated);

        return redirect()->route('inventory.index')
            ->with('success', 'Item actualizado correctamente.');
    }

    public function destroy(InventoryItem $inventoryItem)
    {
        $this->inventoryService->delete($inventoryItem);

        return redirect()->route('inventory.index')
            ->with('success', 'Item eliminado.');
    }

    public function adjustStock(Request $request, InventoryItem $inventoryItem)
    {
        $validated = $request->validate([
            'quantity' => 'required|numeric|min:0',
            'notes' => 'nullable|string|max:500',
        ]);

        $this->inventoryService->adjustStock(
            $inventoryItem,
            $validated['quantity'],
            $request->user(),
            $validated['notes'] ?? null
        );

        return redirect()->back()
            ->with('success', 'Stock actualizado correctamente.');
    }

    public function changeLocation(Request $request, InventoryItem $inventoryItem)
    {
        $validated = $request->validate([
            'location_type' => 'required|in:warehouse,project',
            'project_id' => 'nullable|exists:projects,id',
            'warehouse_location' => 'nullable|string|max:255',
        ]);

        $data = array_map(fn ($v) => $v === '' ? null : $v, $validated);
        $inventoryItem->update($data);

        return redirect()->back()
            ->with('success', 'Ubicación actualizada correctamente.');
    }

    public function movements(InventoryItem $inventoryItem)
    {
        $movements = $inventoryItem->movements()
            ->with('user')
            ->latest()
            ->paginate(20);

        return Inertia::render('Inventory/Movements', [
            'item' => $inventoryItem->load('project'),
            'movements' => $movements,
            'canManage' => auth()->user()->hasRole(['admin', 'gerente', 'tecnico']),
        ]);
    }
}
