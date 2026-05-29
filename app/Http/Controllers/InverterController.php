<?php

namespace App\Http\Controllers;

use App\Models\Inverter;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class InverterController extends Controller
{
    private function authorizeSupplyManagement(): void
    {
        if (! auth()->user()->isAdminOrGerente()) {
            abort(403, 'No tienes permiso para gestionar suministros.');
        }
    }

    public function index()
    {
        return Inertia::render('Supplies/Index', [
            'inverters' => Inverter::orderBy('brand')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $this->authorizeSupplyManagement();
        $validated = $request->validate([
            'brand' => 'required|string|max:255',
            'model' => 'required|string|max:255',
            'power' => 'required|numeric|min:0',
            'system_type' => 'required|string|max:255',
            'grid_type' => 'required|string|max:255',
            'price' => 'required|numeric|min:0',
            'datasheet' => 'nullable|file|mimes:pdf|max:10240',
            'is_active' => 'boolean',
        ]);

        if ($request->hasFile('datasheet')) {
            $validated['technical_sheet_url'] = $request->file('datasheet')->store('supplies/inverters', 'public');
        }

        Inverter::create($validated);

        session()->put('success', 'Inversor creado exitosamente.');

        return redirect()->route('supplies.index', ['tab' => 'inverters']);
    }

    public function update(Request $request, Inverter $inverter)
    {
        $this->authorizeSupplyManagement();
        $validated = $request->validate([
            'brand' => 'required|string|max:255',
            'model' => 'required|string|max:255',
            'power' => 'required|numeric|min:0',
            'system_type' => 'required|string|max:255',
            'grid_type' => 'required|string|max:255',
            'price' => 'required|numeric|min:0',
            'datasheet' => 'nullable|file|mimes:pdf|max:10240',
            'is_active' => 'boolean',
        ]);

        if ($request->hasFile('datasheet')) {
            if ($inverter->technical_sheet_url) {
                Storage::disk('public')->delete($inverter->technical_sheet_url);
            }
            $validated['technical_sheet_url'] = $request->file('datasheet')->store('supplies/inverters', 'public');
        }

        $inverter->update($validated);

        session()->put('success', 'Inversor actualizado exitosamente.');

        return redirect()->route('supplies.index', ['tab' => 'inverters']);
    }

    public function destroy(Inverter $inverter)
    {
        $this->authorizeSupplyManagement();
        if ($inverter->technical_sheet_url) {
            Storage::disk('public')->delete($inverter->technical_sheet_url);
        }
        $inverter->delete();

        session()->put('success', 'Inversor eliminado exitosamente.');

        return redirect()->route('supplies.index', ['tab' => 'inverters']);
    }
}
