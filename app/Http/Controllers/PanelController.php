<?php

namespace App\Http\Controllers;

use App\Models\Panel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class PanelController extends Controller
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
            'panels' => Panel::orderBy('brand')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $this->authorizeSupplyManagement();
        $validated = $request->validate([
            'brand' => 'required|string|max:255',
            'model' => 'required|string|max:255',
            'power' => 'required|numeric|min:0',
            'price' => 'required|numeric|min:0',
            'datasheet' => 'nullable|file|mimes:pdf|max:10240',
            'is_active' => 'boolean',
        ]);

        if ($request->hasFile('datasheet')) {
            $validated['technical_sheet_url'] = $request->file('datasheet')->store('supplies/panels', 'public');
        }

        Panel::create($validated);

        session()->put('success', 'Panel creado exitosamente.');

        return redirect()->route('supplies.index', ['tab' => 'panels']);
    }

    public function update(Request $request, Panel $panel)
    {
        $this->authorizeSupplyManagement();
        $validated = $request->validate([
            'brand' => 'required|string|max:255',
            'model' => 'required|string|max:255',
            'power' => 'required|numeric|min:0',
            'price' => 'required|numeric|min:0',
            'datasheet' => 'nullable|file|mimes:pdf|max:10240',
            'is_active' => 'boolean',
        ]);

        if ($request->hasFile('datasheet')) {
            if ($panel->technical_sheet_url) {
                Storage::disk('public')->delete($panel->technical_sheet_url);
            }
            $validated['technical_sheet_url'] = $request->file('datasheet')->store('supplies/panels', 'public');
        }

        $panel->update($validated);

        session()->put('success', 'Panel actualizado exitosamente.');

        return redirect()->route('supplies.index', ['tab' => 'panels']);
    }

    public function destroy(Panel $panel)
    {
        $this->authorizeSupplyManagement();
        if ($panel->technical_sheet_url) {
            Storage::disk('public')->delete($panel->technical_sheet_url);
        }
        $panel->delete();

        session()->put('success', 'Panel eliminado exitosamente.');

        return redirect()->route('supplies.index', ['tab' => 'panels']);
    }
}
