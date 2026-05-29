<?php

namespace App\Http\Controllers;

use App\Models\Client;
use App\Models\ClientType;
use App\Models\InventoryItem;
use App\Models\Maintenance;
use App\Models\Project;
use App\Models\Quotation;
use App\Models\Ticket;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $user = auth()->user();
        $isComercial = $user->isComercial();
        $isTecnico = $user->isTecnico();

        if ($isTecnico) {
            $today = now()->toDateString();
            $weekEnd = now()->addDays(7)->toDateString();

            $stats = [
                [
                    'label' => 'Mis Mantenimientos',
                    'value' => Maintenance::byTechnician($user->id)->count(),
                    'icon' => 'Wrench',
                    'color' => 'text-amber-500',
                ],
                [
                    'label' => 'Pendientes Hoy',
                    'value' => Maintenance::byTechnician($user->id)
                        ->where('scheduled_date', $today)
                        ->whereIn('status', ['programado', 'en_progreso'])
                        ->count(),
                    'icon' => 'Clock',
                    'color' => 'text-red-500',
                ],
                [
                    'label' => 'Tickets Abiertos',
                    'value' => Ticket::byAssignee($user->id)->open()->count(),
                    'icon' => 'Ticket',
                    'color' => 'text-blue-500',
                ],
                [
                    'label' => 'Proyectos Asignados',
                    'value' => Project::where('technical_leader_id', $user->id)->active()->count(),
                    'icon' => 'Briefcase',
                    'color' => 'text-emerald-500',
                ],
                [
                    'label' => 'Stock Bajo',
                    'value' => InventoryItem::active()->lowStock()->count(),
                    'icon' => 'Package',
                    'color' => 'text-purple-500',
                ],
            ];

            $upcomingMaintenances = Maintenance::byTechnician($user->id)
                ->with(['project', 'technicians'])
                ->scheduledBetween($today, $weekEnd)
                ->whereIn('status', ['programado', 'en_progreso'])
                ->orderBy('scheduled_date')
                ->take(10)
                ->get()
                ->map(fn ($m) => [
                    'id' => $m->id,
                    'code' => $m->code,
                    'title' => $m->title,
                    'type' => $m->type,
                    'priority' => $m->priority,
                    'status' => $m->status,
                    'scheduled_date' => $m->scheduled_date,
                    'project' => $m->project ? "{$m->project->code} - {$m->project->name}" : null,
                ]);

            $openTickets = Ticket::byAssignee($user->id)
                ->open()
                ->with('project')
                ->latest()
                ->take(5)
                ->get()
                ->map(fn ($t) => [
                    'id' => $t->id,
                    'code' => $t->code,
                    'title' => $t->title,
                    'priority' => $t->priority,
                    'category' => $t->category,
                    'status' => $t->status,
                    'project' => $t->project ? "{$t->project->code} - {$t->project->name}" : null,
                ]);

            return Inertia::render('Dashboard', [
                'stats' => $stats,
                'upcomingMaintenances' => $upcomingMaintenances,
                'openTickets' => $openTickets,
            ]);
        }

        if ($isComercial) {
            // Pipeline
            $pipeline = [
                ['name' => 'Borrador', 'count' => Quotation::where('user_id', $user->id)->where('status', 'Borrador')->count()],
                ['name' => 'Enviada', 'count' => Quotation::where('user_id', $user->id)->where('status', 'Enviada')->count()],
                ['name' => 'Aprobada', 'count' => Quotation::where('user_id', $user->id)->where('status', 'Aprobada')->count()],
                ['name' => 'Rechazada', 'count' => Quotation::where('user_id', $user->id)->where('status', 'Rechazada')->count()],
            ];

            // Monthly trend
            $monthlyTrend = collect(range(5, 0))->map(function ($i) use ($user) {
                $date = now()->subMonths($i);
                $baseQuery = Quotation::where('user_id', $user->id)
                    ->whereYear('created_at', $date->year)
                    ->whereMonth('created_at', $date->month);

                return [
                    'month' => $date->translatedFormat('M'),
                    'count' => (clone $baseQuery)->count(),
                    'value' => (float) (clone $baseQuery)->sum('total_value'),
                ];
            })->values()->toArray();

            // Clients by type
            $clientsByType = ClientType::withCount(['clients' => function ($q) use ($user) {
                $q->where('user_id', $user->id);
            }])
                ->having('clients_count', '>', 0)
                ->orderByDesc('clients_count')
                ->get()
                ->map(fn ($ct) => ['type' => $ct->name, 'count' => $ct->clients_count])
                ->toArray();

            // Clients by city (top 10)
            $clientsByCity = Client::where('user_id', $user->id)
                ->select('city', DB::raw('count(*) as count'))
                ->whereNotNull('city')
                ->where('city', '!=', '')
                ->groupBy('city')
                ->orderByDesc('count')
                ->limit(10)
                ->get()
                ->map(fn ($c) => ['city' => $c->city, 'count' => $c->count])
                ->toArray();

            // Conversion rate
            $approvedCount = Quotation::where('user_id', $user->id)->where('status', 'Aprobada')->count();
            $rejectedCount = Quotation::where('user_id', $user->id)->where('status', 'Rechazada')->count();
            $resolvedTotal = $approvedCount + $rejectedCount;
            $conversionRate = $resolvedTotal > 0 ? round(($approvedCount / $resolvedTotal) * 100, 1) : 0;

            // Totals
            $totalQuotedValue = (float) Quotation::where('user_id', $user->id)->sum('total_value');
            $activeProjectsCount = Project::where('user_id', $user->id)->active()->count();
            $monthlyQuotations = Quotation::where('user_id', $user->id)
                ->whereYear('created_at', now()->year)
                ->whereMonth('created_at', now()->month)
                ->count();

            // Stats cards
            $stats = [
                [
                    'label' => 'Mis Clientes',
                    'value' => Client::where('user_id', $user->id)->count(),
                    'icon' => 'Users',
                    'color' => 'text-blue-500',
                ],
                [
                    'label' => 'Cotizaciones del Mes',
                    'value' => $monthlyQuotations,
                    'icon' => 'Calculator',
                    'color' => 'text-emerald-500',
                ],
                [
                    'label' => 'Tasa de Conversión',
                    'value' => $conversionRate.'%',
                    'icon' => 'TrendingUp',
                    'color' => 'text-purple-500',
                ],
                [
                    'label' => 'Valor Cotizado',
                    'value' => $totalQuotedValue,
                    'icon' => 'DollarSign',
                    'color' => 'text-amber-500',
                ],
                [
                    'label' => 'Proyectos en Curso',
                    'value' => $activeProjectsCount,
                    'icon' => 'Briefcase',
                    'color' => 'text-cyan-500',
                ],
            ];

            // Recent activity
            $recentActivity = Quotation::where('user_id', $user->id)
                ->with('client')
                ->latest()
                ->take(5)
                ->get()
                ->map(fn ($q) => [
                    'id' => $q->id,
                    'title' => "Cotización {$q->code}",
                    'description' => "Cliente: {$q->client->name} - Estado: {$q->status}",
                    'time' => $q->created_at->diffForHumans(),
                ]);

            return Inertia::render('Dashboard', [
                'stats' => $stats,
                'recentActivity' => $recentActivity,
                'pipeline' => $pipeline,
                'monthlyTrend' => $monthlyTrend,
                'clientsByType' => $clientsByType,
                'clientsByCity' => $clientsByCity,
                'conversionRate' => $conversionRate,
                'totalQuotedValue' => $totalQuotedValue,
                'activeProjectsCount' => $activeProjectsCount,
            ]);
        }

        // Admin / Gerente
        $stats = [
            [
                'label' => 'Proyectos Activos',
                'value' => Project::count(),
                'icon' => 'Sun',
                'color' => 'text-amber-500',
            ],
            [
                'label' => 'Total Clientes',
                'value' => Client::count(),
                'icon' => 'Users',
                'color' => 'text-blue-500',
            ],
            [
                'label' => 'Cotizaciones Mes',
                'value' => Quotation::whereMonth('created_at', now()->month)->count(),
                'icon' => 'Calculator',
                'color' => 'text-emerald-500',
            ],
            [
                'label' => 'Eficiencia Global',
                'value' => '+24%',
                'icon' => 'TrendingUp',
                'color' => 'text-purple-500',
            ],
        ];

        $recentActivity = Quotation::with('client')
            ->latest()
            ->take(5)
            ->get()
            ->map(fn ($q) => [
                'id' => $q->id,
                'title' => "Nueva Cotización: {$q->code}",
                'description' => "Cliente: {$q->client->name} - Por: {$q->user->name}",
                'time' => $q->created_at->diffForHumans(),
            ]);

        return Inertia::render('Dashboard', [
            'stats' => $stats,
            'recentActivity' => $recentActivity,
        ]);
    }
}
