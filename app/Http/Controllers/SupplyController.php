<?php

namespace App\Http\Controllers;

use App\Models\Battery;
use App\Models\Inverter;
use App\Models\Panel;
use Illuminate\Http\Request;

class SupplyController extends Controller
{
    public function index(Request $request)
    {
        $perPage = $request->input('per_page', 10);
        $search = $request->input('search', '');

        $panelsQuery = Panel::query();
        $invertersQuery = Inverter::query();
        $batteriesQuery = Battery::query();

        if ($search) {
            $panelsQuery->where(function ($q) use ($search) {
                $q->where('brand', 'like', "%{$search}%")
                    ->orWhere('model', 'like', "%{$search}%");
            });
            $invertersQuery->where(function ($q) use ($search) {
                $q->where('brand', 'like', "%{$search}%")
                    ->orWhere('model', 'like', "%{$search}%");
            });
            $batteriesQuery->where(function ($q) use ($search) {
                $q->where('brand', 'like', "%{$search}%")
                    ->orWhere('model', 'like', "%{$search}%");
            });
        }

        if ($request->has('system_type')) {
            $invertersQuery->where('system_type', $request->input('system_type'));
        }
        if ($request->has('grid_type')) {
            $invertersQuery->where('grid_type', $request->input('grid_type'));
        }
        if ($request->has('type')) {
            $batteriesQuery->where('type', $request->input('type'));
        }

        if ($perPage == -1) {
            $perPage = max($panelsQuery->count(), $invertersQuery->count(), $batteriesQuery->count());
        }

        $panels = $panelsQuery->orderBy('brand')->paginate($perPage)->withQueryString();
        $inverters = $invertersQuery->orderBy('brand')->paginate($perPage)->withQueryString();
        $batteries = $batteriesQuery->orderBy('brand')->paginate($perPage)->withQueryString();

        return inertia('Supplies/Index', [
            'panels' => $panels,
            'inverters' => $inverters,
            'batteries' => $batteries,
        ]);
    }
}
