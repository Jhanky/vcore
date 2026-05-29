<?php

namespace App\Http\Controllers;

use App\Models\Battery;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class BatteryController extends Controller
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
            'batteries' => Battery::orderBy('brand')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $this->authorizeSupplyManagement();
        $validated = $request->validate([
            'brand' => 'required|string|max:255',
            'model' => 'required|string|max:255',
            'capacity' => 'required|numeric|min:0',
            'voltage' => 'required|numeric|min:0',
            'type' => 'required|string|max:255',
            'price' => 'required|numeric|min:0',
            'datasheet' => 'nullable|file|mimes:pdf|max:10240',
            'is_active' => 'boolean',
        ]);

        if ($request->hasFile('datasheet')) {
            $validated['technical_sheet_url'] = $request->file('datasheet')->store('supplies/batteries', 'public');
        }

        Battery::create($validated);

        session()->put('success', 'Batería creada exitosamente.');

        return redirect()->route('supplies.index', ['tab' => 'batteries']);
    }

    public function update(Request $request, Battery $battery)
    {
        $this->authorizeSupplyManagement();
        $validated = $request->validate([
            'brand' => 'required|string|max:255',
            'model' => 'required|string|max:255',
            'capacity' => 'required|numeric|min:0',
            'voltage' => 'required|numeric|min:0',
            'type' => 'required|string|max:255',
            'price' => 'required|numeric|min:0',
            'datasheet' => 'nullable|file|mimes:pdf|max:10240',
            'is_active' => 'boolean',
        ]);

        if ($request->hasFile('datasheet')) {
            if ($battery->technical_sheet_url) {
                Storage::disk('public')->delete($battery->technical_sheet_url);
            }
            $validated['technical_sheet_url'] = $request->file('datasheet')->store('supplies/batteries', 'public');
        }

        $battery->update($validated);

        session()->put('success', 'Batería actualizada exitosamente.');

        return redirect()->route('supplies.index', ['tab' => 'batteries']);
    }

    public function destroy(Battery $battery)
    {
        $this->authorizeSupplyManagement();
        if ($battery->technical_sheet_url) {
            Storage::disk('public')->delete($battery->technical_sheet_url);
        }
        $battery->delete();

        session()->put('success', 'Batería eliminada exitosamente.');

        return redirect()->route('supplies.index', ['tab' => 'batteries']);
    }
}
