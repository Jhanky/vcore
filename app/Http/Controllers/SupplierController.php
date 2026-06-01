<?php

namespace App\Http\Controllers;

use App\Models\Supplier;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SupplierController extends Controller
{
    public function index(Request $request)
    {
        $perPage = $request->input('per_page', 15);

        $suppliers = Supplier::orderBy('name')
            ->when($request->search, function ($q, $search) {
                $q->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('nit', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%")
                      ->orWhere('contact_name', 'like', "%{$search}%")
                      ->orWhere('phone', 'like', "%{$search}%");
                });
            })
            ->paginate($perPage)
            ->withQueryString();

        return Inertia::render('Suppliers/Index', [
            'suppliers' => $suppliers,
            'filters' => $request->only('search', 'per_page'),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'nit' => 'nullable|string|max:50',
            'contact_name' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:50',
            'email' => 'nullable|email|max:255',
            'address' => 'nullable|string|max:500',
            'notes' => 'nullable|string',
            'is_active' => 'nullable|boolean',
        ]);

        $supplier = Supplier::create($validated);

        if ($request->wantsJson()) {
            return response()->json(['supplier' => $supplier]);
        }

        session()->put('success', 'Proveedor creado correctamente.');

        return back();
    }

    public function update(Request $request, Supplier $supplier)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'nit' => 'nullable|string|max:50',
            'contact_name' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:50',
            'email' => 'nullable|email|max:255',
            'address' => 'nullable|string|max:500',
            'notes' => 'nullable|string',
            'is_active' => 'nullable|boolean',
        ]);

        $supplier->update($validated);

        session()->put('success', 'Proveedor actualizado correctamente.');

        return back();
    }

    public function destroy(Supplier $supplier)
    {
        $supplier->delete();

        session()->put('success', 'Proveedor eliminado.');

        return back();
    }

    public function list()
    {
        return response()->json([
            'suppliers' => Supplier::where('is_active', true)->orderBy('name')->get(['id', 'name', 'nit']),
        ]);
    }
}
