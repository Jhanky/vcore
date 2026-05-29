<?php

namespace App\Http\Controllers;

use App\Models\Quotation;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProposalController extends Controller
{
    public function index(Request $request)
    {
        $user = auth()->user();

        $query = Quotation::with('client')
            ->where('status', 'Enviada');

        if (! $user->hasRole(['admin', 'gerente'])) {
            $query->where('user_id', $user->id);
        }

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('code', 'like', "%{$search}%")
                    ->orWhereHas('client', fn ($cq) => $cq->where('name', 'like', "%{$search}%"));
            });
        }

        $proposals = $query->latest()->paginate(10)->withQueryString();

        return Inertia::render('Proposals/Index', [
            'proposals' => $proposals,
            'filters' => $request->only('search'),
        ]);
    }

    public function show(Quotation $quotation)
    {
        $quotation->load(['client', 'statusHistory.user']);

        return Inertia::render('Proposals/Show', [
            'proposal' => $quotation,
        ]);
    }
}
