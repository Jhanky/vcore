<?php

namespace App\Http\Controllers;

use App\Models\Battery;
use App\Models\Client;
use App\Models\Inverter;
use App\Models\Panel;
use App\Models\Quotation;
use App\Models\QuotationItem;
use App\Models\QuotationProduct;
use App\Models\QuotationStatusHistory;
use App\Services\ProjectService;
use App\Services\ProposalService;
use App\Services\QuotationService;
use App\Services\QuotationSuggestionService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Laravel\Ai\Ai;
use Spatie\Browsershot\Browsershot;

class QuotationController extends Controller
{
    private function authorizeQuotationAccess(Quotation $quotation): void
    {
        $user = auth()->user();
        if (! $user->isAdminOrGerente() && $quotation->user_id !== $user->id) {
            abort(403, 'No tienes permiso para acceder a esta cotización.');
        }
    }

    /**
     * Display a listing of quotations.
     */
    public function index(Request $request)
    {
        $query = Quotation::with(['client', 'user'])
            ->orderBy('created_at', 'desc');

        $user = auth()->user();
        if (! $user->hasRole(['admin', 'gerente'])) {
            $query->where('user_id', $user->id);
        }

        if ($search = $request->get('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('code', 'like', "%{$search}%")
                    ->orWhere('project_name', 'like', "%{$search}%")
                    ->orWhereHas('client', fn ($cq) => $cq->where('name', 'like', "%{$search}%"));
            });
        }

        if ($status = $request->get('status')) {
            $query->where('status', $status);
        }

        $perPage = $request->input('per_page', 10);
        if ($perPage == -1) {
            $perPage = Quotation::count();
        }

        $quotations = $query->paginate($perPage)->withQueryString();

        // Estadísticas de cotizaciones (filtradas por rol)
        $statsQuery = Quotation::query();
        if (! $user->isAdminOrGerente()) {
            $statsQuery->where('user_id', $user->id);
        }

        $statistics = [
            'total' => (clone $statsQuery)->count(),
            'accepted' => (clone $statsQuery)->where('status', 'Aprobada')->count(),
            'total_value' => (clone $statsQuery)->sum('total_value'),
            'total_kwp' => (clone $statsQuery)->sum('power_kwp'),
        ];

        return Inertia::render('Quotations/Index', [
            'quotations' => $quotations,
            'statistics' => $statistics,
            'filters' => $request->only(['search', 'status']),
        ]);
    }

    public function create()
    {
        $user = auth()->user();
        $clientQuery = Client::select('id', 'name', 'email', 'energy_consumption_kwh');
        if (! $user->isAdminOrGerente()) {
            $clientQuery->where('user_id', $user->id);
        }

        return Inertia::render('Quotations/Form', [
            'clients' => $clientQuery->get(),
            'panels' => Panel::select('id', 'brand', 'model', 'power', 'price')->get(),
            'inverters' => Inverter::select('id', 'brand', 'model', 'power', 'price', 'system_type', 'grid_type')->get(),
            'batteries' => Battery::select('id', 'brand', 'model', 'capacity', 'voltage', 'price')->get(),
            'system_types' => Inverter::distinct()->pluck('system_type'),
        ]);
    }

    /**
     * Store a newly created quotation.
     */
    public function store(Request $request, QuotationService $quotationService)
    {
        $request->validate([
            'client_id' => 'required|exists:clients,id',
            'project_name' => 'required|string|max:255',
            'power_kwp' => 'required|numeric|min:0.1',
            'system_type' => 'required|string',
            'network_type' => 'required|string',
            'products' => 'required|array|min:1',
            'products.*.product_type' => 'required|in:panel,inverter,battery',
            'products.*.product_id' => 'required|integer',
            'products.*.quantity' => 'required|integer|min:1',
            'products.*.unit_price_cop' => 'required|numeric|min:0',
            'products.*.profit_percentage' => 'required|numeric|min:0',
            'items' => 'nullable|array',
            'items.*.description' => 'required|string',
            'items.*.category' => 'required|string',
            'items.*.quantity' => 'required|numeric|min:0',
            'items.*.unit_measure' => 'required|string',
            'items.*.unit_price_cop' => 'required|numeric|min:0',
            'items.*.profit_percentage' => 'required|numeric|min:0',
        ]);

        DB::beginTransaction();
        try {
            $data = $request->except(['products', 'items']);
            $data['code'] = $this->generateCode();
            $data['user_id'] = Auth::id();
            $data['status'] = 'Borrador';
            $data['issue_date'] = now()->toDateString();
            $data['expiration_date'] = now()->addDays(15)->toDateString();

            $quotation = Quotation::create($data);

            // Create products
            foreach ($request->products as $p) {
                $product = $this->resolveProduct($p['product_type'], $p['product_id']);
                QuotationProduct::create([
                    'quotation_id' => $quotation->id,
                    'product_type' => $p['product_type'],
                    'product_id' => $p['product_id'],
                    'snapshot_brand' => $product?->brand,
                    'snapshot_model' => $product?->model,
                    'snapshot_specs' => $this->getSpecs($product, $p['product_type']),
                    'quantity' => $p['quantity'],
                    'unit_price_cop' => $p['unit_price_cop'],
                    'profit_percentage' => $p['profit_percentage'],
                ]);
            }

            // Create complementary items
            foreach ($request->items ?? [] as $item) {
                QuotationItem::create([
                    'quotation_id' => $quotation->id,
                    'description' => $item['description'],
                    'category' => $item['category'],
                    'quantity' => $item['quantity'],
                    'unit_measure' => $item['unit_measure'],
                    'unit_price_cop' => $item['unit_price_cop'],
                    'profit_percentage' => $item['profit_percentage'],
                ]);
            }

            $quotationService->calculateTotals($quotation);

            DB::commit();

            session()->put('success', "Cotización {$quotation->code} creada exitosamente.");

            return redirect()->route('quotations.show', $quotation->id);
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Display the specified quotation.
     */
    public function show(Quotation $quotation)
    {
        $this->authorizeQuotationAccess($quotation);
        $quotation->load(['client', 'user', 'products', 'items', 'statusHistory.user']);

        return Inertia::render('Quotations/Show', [
            'quotation' => $quotation,
            'allowedStatuses' => $quotation->allowedNextStatuses(),
            'isStatusLocked' => $quotation->isStatusLocked(),
            'statusTransitions' => QuotationStatusHistory::TRANSITIONS,
            'catalogPanels' => Panel::select('id', 'brand', 'model', 'power', 'price')->get(),
            'catalogInverters' => Inverter::select('id', 'brand', 'model', 'power', 'price', 'system_type', 'grid_type')->get(),
            'catalogBatteries' => Battery::select('id', 'brand', 'model', 'capacity', 'voltage', 'price')->get(),
        ]);
    }

    /**
     * Show the form for editing.
     */
    public function edit(Quotation $quotation)
    {
        $this->authorizeQuotationAccess($quotation);
        $user = auth()->user();
        $quotation->load(['products', 'items']);

        $clientQuery = Client::select('id', 'name', 'email', 'energy_consumption_kwh');
        if (! $user->isAdminOrGerente()) {
            $clientQuery->where('user_id', $user->id);
        }

        return Inertia::render('Quotations/Form', [
            'quotation' => $quotation,
            'clients' => $clientQuery->get(),
            'panels' => Panel::select('id', 'brand', 'model', 'power', 'price')->get(),
            'inverters' => Inverter::select('id', 'brand', 'model', 'power', 'price', 'system_type', 'grid_type')->get(),
            'batteries' => Battery::select('id', 'brand', 'model', 'capacity', 'voltage', 'price')->get(),
            'system_types' => Inverter::distinct()->pluck('system_type'),
        ]);
    }

    /**
     * Update the specified quotation (inline editor from Show view).
     */
    public function update(Request $request, Quotation $quotation, QuotationService $quotationService)
    {
        $this->authorizeQuotationAccess($quotation);
        $request->validate([
            'project_name' => 'required|string|max:255',
            'power_kwp' => 'required|numeric|min:0.1',
            'system_type' => 'required|string',
            'network_type' => 'required|string',
            'commercial_management_percentage' => 'nullable|numeric|min:0',
            'administration_percentage' => 'nullable|numeric|min:0',
            'contingency_percentage' => 'nullable|numeric|min:0',
            'profit_percentage' => 'nullable|numeric|min:0',
            'iva_profit_percentage' => 'nullable|numeric|min:0',
            'withholding_percentage' => 'nullable|numeric|min:0',
            'products' => 'nullable|array',
            'products.*.id' => 'required|integer|exists:quotation_products,id',
            'products.*.quantity' => 'required|integer|min:1',
            'products.*.unit_price_cop' => 'required|numeric|min:0',
            'products.*.profit_percentage' => 'required|numeric|min:0',
            'items' => 'nullable|array',
            'items.*.id' => 'required|integer|exists:quotation_items,id',
            'items.*.description' => 'required|string',
            'items.*.quantity' => 'required|numeric|min:0',
            'items.*.unit_measure' => 'required|string',
            'items.*.unit_price_cop' => 'required|numeric|min:0',
            'items.*.profit_percentage' => 'required|numeric|min:0',
        ]);

        DB::beginTransaction();
        try {
            $quotation->update($request->only([
                'project_name', 'power_kwp', 'system_type', 'network_type', 'requires_financing',
                'commercial_management_percentage', 'administration_percentage',
                'contingency_percentage', 'profit_percentage',
                'iva_profit_percentage', 'withholding_percentage',
            ]));

            // Update existing QuotationProduct rows by their own ID
            foreach ($request->products ?? [] as $p) {
                QuotationProduct::where('id', $p['id'])
                    ->where('quotation_id', $quotation->id)
                    ->update([
                        'quantity' => $p['quantity'],
                        'unit_price_cop' => $p['unit_price_cop'],
                        'profit_percentage' => $p['profit_percentage'],
                    ]);
            }

            // Update existing QuotationItem rows by their own ID
            foreach ($request->items ?? [] as $item) {
                QuotationItem::where('id', $item['id'])
                    ->where('quotation_id', $quotation->id)
                    ->update([
                        'description' => $item['description'],
                        'quantity' => $item['quantity'],
                        'unit_measure' => $item['unit_measure'],
                        'unit_price_cop' => $item['unit_price_cop'],
                        'profit_percentage' => $item['profit_percentage'],
                    ]);
            }

            $quotationService->calculateTotals($quotation);

            DB::commit();

            session()->put('success', 'Cotización actualizada correctamente.');

            return back();
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Update quotation status with transition validation and history.
     */
    public function updateStatus(Request $request, Quotation $quotation)
    {
        $this->authorizeQuotationAccess($quotation);
        $request->validate([
            'status' => 'required|in:Borrador,Enviada,Aprobada,Rechazada,Vencida',
            'notes' => 'nullable|string|max:500',
        ]);

        $from = $quotation->status;
        $to = $request->status;

        // Same status — nothing to do
        if ($from === $to) {
            session()->put('info', 'La cotización ya tiene ese estado.');

            return back();
        }

        // Terminal state — locked
        if (QuotationStatusHistory::isLocked($from)) {
            session()->put('error', "La cotización está en estado '{$from}' y no puede ser modificada.");

            return back()->withErrors([
                'status' => "La cotización está en estado '{$from}' y no puede ser modificada.",
            ]);
        }

        // Invalid transition
        if (! QuotationStatusHistory::canTransition($from, $to)) {
            $allowed = implode(', ', QuotationStatusHistory::allowedFrom($from));
            $errorMsg = "No se puede pasar de '{$from}' a '{$to}'. Transiciones válidas: {$allowed}.";
            session()->put('error', $errorMsg);

            return back()->withErrors([
                'status' => $errorMsg,
            ]);
        }

        $quotation->update(['status' => $to]);

        QuotationStatusHistory::create([
            'quotation_id' => $quotation->id,
            'user_id' => Auth::id(),
            'from_status' => $from,
            'to_status' => $to,
            'notes' => $request->notes,
        ]);

        if ($to === 'Aprobada' && ! $quotation->project_id) {
            $projectService = app(ProjectService::class);
            $project = $projectService->createFromQuotation($quotation);
            session()->put('success', "Estado actualizado de '{$from}' a '{$to}'. Proyecto {$project->code} creado automáticamente.");

            return back();
        }

        session()->put('success', "Estado actualizado de '{$from}' a '{$to}'.");

        return back();
    }

    /**
     * Generate and download the photovoltaic proposal PDF.
     */
    public function generatePdf(Quotation $quotation, ProposalService $proposalService)
    {
        $this->authorizeQuotationAccess($quotation);
        $data = $proposalService->buildProposalData($quotation);
        $html = view('pdf.proposal', $data)->render();

        $pdfContent = Browsershot::html($html)
            ->setNodeBinary('node')
            ->setNpmBinary('npm')
            ->format('Letter')
            ->margins(0, 0, 0, 0)
            ->showBackground()
            ->waitUntilNetworkIdle()
            ->pdf();

        $filename = 'PROPUESTA_FV_'.number_format($data['panelKwp'], 2, '_', '').'kWp_'.str_replace(' ', '_', strtoupper($quotation->project_name)).'.pdf';

        return response($pdfContent)
            ->header('Content-Type', 'application/pdf')
            ->header('Content-Disposition', 'attachment; filename="'.$filename.'"');
    }

    /**
     * Remove the specified quotation.
     */
    public function destroy(Quotation $quotation)
    {
        $this->authorizeQuotationAccess($quotation);
        $quotation->products()->delete();
        $quotation->items()->delete();
        $quotation->delete();

        session()->put('success', 'Cotización eliminada.');

        return redirect()->route('quotations.index');
    }

    // -------------------------------------------------------
    // Private helpers
    // -------------------------------------------------------

    private function generateCode(): string
    {
        $year = date('Y');
        $last = Quotation::withTrashed()
            ->whereYear('created_at', $year)
            ->where('code', 'like', "COT-{$year}-%")
            ->orderBy('code', 'desc')
            ->first();

        $seq = 1;
        if ($last && preg_match("/COT-{$year}-(\d+)/", $last->code, $m)) {
            $seq = (int) $m[1] + 1;
        }

        return 'COT-'.$year.'-'.str_pad($seq, 4, '0', STR_PAD_LEFT);
    }

    private function resolveProduct(string $type, int $id)
    {
        return match ($type) {
            'panel' => Panel::find($id),
            'inverter' => Inverter::find($id),
            'battery' => Battery::find($id),
            default => null,
        };
    }

    private function getSpecs($product, string $type): ?array
    {
        if (! $product) {
            return null;
        }

        return match ($type) {
            'panel' => ['power' => $product->power],
            'inverter' => ['power' => $product->power, 'system_type' => $product->system_type, 'grid_type' => $product->grid_type],
            'battery' => ['capacity' => $product->capacity, 'voltage' => $product->voltage],
            default => null,
        };
    }

    /**
     * Analiza los suministros seleccionados mediante IA.
     */
    public function analyzeSupplies(Request $request)
    {
        $request->validate([
            'system_type' => 'required|string',
            'power_kwp' => 'required|numeric',
            'panels' => 'required|array',
            'inverters' => 'required|array',
            'batteries' => 'nullable|array',
            'client_consumption' => 'nullable|numeric',
            'client_location' => 'nullable|string',
            'monthly_bill' => 'nullable|numeric',
        ]);

        $data = [
            'system_type' => $request->system_type,
            'power_kwp' => $request->power_kwp,
            'panels' => $request->panels,
            'inverters' => $request->inverters,
            'batteries' => $request->batteries ?? [],
            'client_consumption' => $request->client_consumption ?? 0,
            'client_location' => $request->client_location ?? 'Colombia',
            'monthly_bill' => $request->monthly_bill ?? 0,
        ];

        $suggestionService = new QuotationSuggestionService;
        $result = $suggestionService->analyzeSystem($data);

        return response()->json($result);
    }

    /**
     * Sugiere un sistema óptimo basado en datos del cliente (sin productos seleccionados).
     */
    public function suggestSystem(Request $request)
    {
        $request->validate([
            'client_id' => 'required_without_all:energy_consumption_kwh,monthly_bill_amount',
            'energy_consumption_kwh' => 'nullable|numeric',
            'monthly_bill_amount' => 'nullable|numeric',
            'requires_financing' => 'nullable|boolean',
            'network_type' => 'nullable|string',
            'city' => 'nullable|string',
            'state' => 'nullable|string',
        ]);

        $client = null;
        if ($request->client_id) {
            $client = Client::find($request->client_id);
        }

        $clientData = [
            'energy_consumption_kwh' => $request->energy_consumption_kwh ?? $client?->energy_consumption_kwh ?? 0,
            'monthly_bill_amount' => $request->monthly_bill_amount ?? $client?->monthly_bill_amount ?? 0,
            'requires_financing' => $request->requires_financing ?? false,
            'network_type' => $request->network_type ?? ($client?->connection_point ? 'trifasico_220' : 'monofasico'),
            'city' => $request->city ?? $client?->city ?? 'Colombia',
            'state' => $request->state ?? $client?->state ?? '',
        ];

        $suggestionService = new QuotationSuggestionService;
        $result = $suggestionService->suggestOptimalSystem($clientData);

        return response()->json($result);
    }

    /**
     * Generate offline analysis without AI
     */
    private function generateOfflineAnalysis(string $systemType, float $powerKwp, float $totalPanelKw, float $totalInvKw, float $ratio, float $annualProduction, float $monthlyProduction, int $clientConsumption, ?float $coverage): string
    {
        $analysis = "## 📊 Análisis del Sistema Solar\n\n";

        $analysis .= "### ⚡ Características Principales\n";
        $analysis .= "- **Tipo de sistema:** $systemType\n";
        $analysis .= "- **Potencia objetivo:** {$powerKwp} kWp\n";
        $analysis .= '- **Paneles instalados:** '.number_format($totalPanelKw, 2)." kWp\n";
        $analysis .= '- **Capacidad inversor:** '.number_format($totalInvKw, 1)." kW\n";
        $analysis .= '- **Ratio DC/AC:** '.number_format($ratio, 2)."\n\n";

        $analysis .= "### 🌞 Producción Estimada\n";
        $analysis .= '- **Anual:** '.number_format($annualProduction, 0)." kWh/año\n";
        $analysis .= '- **Mensual promedio:** '.number_format($monthlyProduction, 0)." kWh/mes\n";
        $analysis .= '- **Promedio diario:** '.number_format($annualProduction / 365, 0)." kWh/día\n\n";

        if ($clientConsumption > 0) {
            $analysis .= "### 📈 Cobertura de Consumo\n";
            $analysis .= "- **Consumo mensual:** {$clientConsumption} kWh/mes\n";
            $analysis .= '- **Cobertura:** '.number_format($coverage, 1)."%\n";
            if ($coverage >= 100) {
                $analysis .= "- **✓ El sistema cubre el 100% o más del consumo**\n";
            } else {
                $analysis .= "- **⚠️ Cobertura parcial: considera aumentar paneles**\n";
            }
            $analysis .= "\n";
        }

        $analysis .= "### 🔍 Evaluación del Dimensionamiento\n";

        if ($ratio >= 1.0 && $ratio <= 1.3) {
            $analysis .= "**✅ Óptimo:** El ratio DC/AC está en el rango ideal (1.0 - 1.3).\n";
            $analysis .= "El inversor está bien dimensionado para la cantidad de paneles.\n\n";
        } elseif ($ratio < 1.0) {
            $analysis .= "**⚠️ Subdimensionado:** El ratio DC/AC es menor a 1.0.\n";
            $analysis .= "El inversor podría no aprovechar todo el potencial de los paneles. Considera reducir paneles o aumentar capacidad del inversor.\n\n";
        } else {
            $analysis .= "**⚠️ Sobredimensionado:** El ratio DC/AC supera 1.3.\n";
            $analysis .= "Existe riesgo de limitación de potencia por el inversor. Considera reducir paneles o aumentar capacidad del inversor.\n\n";
        }

        $analysis .= "### 💡 Recomendaciones\n";

        if ($ratio > 1.5) {
            $analysis .= "- ⚠️ **Reducir paneles** o usar inversor de mayor potencia\n";
        }
        if ($ratio < 0.8) {
            $analysis .= "- ⚠️ **Considerar más paneles** o inversor de menor potencia\n";
        }
        if ($coverage && $coverage < 80) {
            $analysis .= "- ⚠️ **Cobertura baja:** Agregar más paneles para mayor autonomía\n";
        }
        if ($coverage && $coverage > 150) {
            $analysis .= "- ℹ️ **Exceso de producción:** Considereiniciar en horas no solares (baterías)\n";
        }

        if ($systemType === 'Off-grid' || $systemType === 'Híbrido') {
            $analysis .= "- ℹ️ **Sistema con baterías:** Verificar capacidad de almacenamiento\n";
        }

        if (empty($analysis) || strlen($analysis) < 200) {
            $analysis .= "- ✅ **Sistema bien configurado** para el perfil del cliente\n";
        }

        return $analysis;
    }

    /**
     * Build prompt for AI analysis
     */
    private function buildAiPrompt(string $systemType, float $powerKwp, array $panels, array $inverters, array $batteries, int $clientConsumption, float $totalPanelKw, float $totalInvKw, float $ratio, float $annualProduction, float $monthlyProduction): string
    {
        $promptText = "Eres un ingeniero solar certificado con más de 15 años de experiencia diseñando sistemas fotovoltaicos en Colombia. Asesina a un vendedor de equipos solares.\n\n";

        $promptText .= "## Datos del Proyecto\n";
        $promptText .= "- **Tipo de sistema:** $systemType\n";
        $promptText .= "- **Potencia objetivo:** $powerKwp kWp\n";
        $promptText .= '- **Consumo mensual del cliente:** '.($clientConsumption > 0 ? "{$clientConsumption} kWh/mes" : 'No especificado')."\n\n";

        $promptText .= "## Componentes Seleccionados\n**Paneles:**\n";
        foreach ($panels as $p) {
            $qty = $p['qty'] ?? 0;
            $power = $p['power'] ?? 0;
            $brand = $p['brand'] ?? 'N/A';
            $model = $p['model'] ?? '';
            if ($qty > 0) {
                $promptText .= "- {$qty}x {$brand} {$model} ({$power}W)\n";
            }
        }

        $promptText .= "\n**Inversores:**\n";
        foreach ($inverters as $inv) {
            $qty = $inv['qty'] ?? 0;
            $power = $inv['power'] ?? 0;
            $brand = $inv['brand'] ?? 'N/A';
            $model = $inv['model'] ?? '';
            if ($qty > 0) {
                $promptText .= "- {$qty}x {$brand} {$model} ({$power}kW)\n";
            }
        }

        if (count($batteries) > 0) {
            $promptText .= "\n**Baterías:**\n";
            foreach ($batteries as $bat) {
                $qty = $bat['qty'] ?? 0;
                $capacity = $bat['capacity'] ?? 0;
                $voltage = $bat['voltage'] ?? 0;
                if ($qty > 0) {
                    $promptText .= "- {$qty}x Batería {$capacity}Ah {$voltage}V\n";
                }
            }
        }

        $promptText .= "\n## Métricas Calculadas\n";
        $promptText .= '- Potencia instalada: '.number_format($totalPanelKw, 2)." kWp\n";
        $promptText .= '- Capacidad inversor: '.number_format($totalInvKw, 1)." kW\n";
        $promptText .= '- Ratio DC/AC: '.number_format($ratio, 2)."\n";
        $promptText .= '- Producción anual: '.number_format($annualProduction, 0)." kWh/año\n";
        $promptText .= '- Producción mensual: '.number_format($monthlyProduction, 0)." kWh/mes\n\n";

        $promptText .= "## Tu Tarea\nResponde en español incluyendo:\n1. Evaluación del dimensionamiento\n2. Cobertura de consumo si aplica\n3. Recomendaciones prácticas\n4. Notas técnicas\n\nSé conciso con emojis.";

        return $promptText;
    }
}
