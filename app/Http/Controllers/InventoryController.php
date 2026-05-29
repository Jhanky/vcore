<?php

namespace App\Http\Controllers;

use App\Models\InventoryItem;
use Illuminate\Http\Request;
use Inertia\Inertia;

class InventoryController extends Controller
{
    public function index(Request $request)
    {
        $user = auth()->user();
        $canManage = $user->hasPermissionTo('manage inventory');

        $query = InventoryItem::query()->with('project');

        if ($request->filled('type')) {
            $query->byType($request->type);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('location_type')) {
            $query->where('location_type', $request->location_type);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('code', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        if ($request->boolean('low_stock')) {
            $query->lowStock();
        }

        $items = $query->orderBy('type')
            ->orderBy('name')
            ->paginate($request->per_page ?? 15)
            ->withQueryString();

        return Inertia::render('Inventory/Index', [
            'items' => $items,
            'filters' => $request->only(['search', 'type', 'status', 'location_type', 'low_stock', 'per_page']),
            'canManage' => $canManage,
        ]);
    }

    public function show(InventoryItem $inventoryItem)
    {
        $inventoryItem->load('project');

        return Inertia::render('Inventory/Show', [
            'item' => $inventoryItem,
            'canManage' => auth()->user()->hasPermissionTo('manage inventory'),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'type' => 'required|in:material,tool',
            'code' => 'nullable|string|max:100',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'unit' => 'required|string|max:50',
            'quantity' => 'required|numeric|min:0',
            'min_stock' => 'nullable|numeric|min:0',
            'status' => 'nullable|in:disponible,en_proyecto,en_mantenimiento,dado_de_baja',
            'last_maintenance' => 'nullable|date',
            'location_type' => 'required|in:warehouse,project',
            'project_id' => 'nullable|exists:projects,id',
            'warehouse_location' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
        ]);

        $validated = array_map(fn ($v) => $v === '' ? null : $v, $validated);

        InventoryItem::create($validated);

        return redirect()->route('inventory.index')
            ->with('success', 'Item creado correctamente.');
    }

    public function update(Request $request, InventoryItem $inventoryItem)
    {
        $validated = $request->validate([
            'type' => 'required|in:material,tool',
            'code' => 'nullable|string|max:100',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'unit' => 'required|string|max:50',
            'quantity' => 'required|numeric|min:0',
            'min_stock' => 'nullable|numeric|min:0',
            'status' => 'nullable|in:disponible,en_proyecto,en_mantenimiento,dado_de_baja',
            'last_maintenance' => 'nullable|date',
            'location_type' => 'required|in:warehouse,project',
            'project_id' => 'nullable|exists:projects,id',
            'warehouse_location' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        $validated = array_map(fn ($v) => $v === '' ? null : $v, $validated);

        $inventoryItem->update($validated);

        return redirect()->route('inventory.index')
            ->with('success', 'Item actualizado correctamente.');
    }

    public function destroy(InventoryItem $inventoryItem)
    {
        $inventoryItem->delete();

        return redirect()->route('inventory.index')
            ->with('success', 'Item eliminado.');
    }

    public function adjustStock(Request $request, InventoryItem $inventoryItem)
    {
        $validated = $request->validate([
            'quantity' => 'required|numeric|min:0',
        ]);

        $inventoryItem->update(['quantity' => $validated['quantity']]);

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

        $inventoryItem->update($validated);

        return redirect()->back()
            ->with('success', 'Ubicación actualizada correctamente.');
    }
}
