<?php

namespace App\Http\Controllers;

use App\Models\AireSeguimiento;
use App\Models\Project;
use App\Services\AireSeguimientoService;
use App\Services\ConnectionPointService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class AireSeguimientoController extends Controller
{
    public function __construct(
        private readonly AireSeguimientoService $aireService,
        private readonly ConnectionPointService $connectionPointService,
    ) {}

    public function index(Request $request)
    {
        $query = AireSeguimiento::with(['project', 'client'])
            ->whereHas('project', fn($q) => $q->whereNull('deleted_at'));

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('nic', 'like', "%{$search}%")
                  ->orWhere('numero_radicado', 'like', "%{$search}%")
                  ->orWhereHas('project', fn($p) => $p->where('name', 'like', "%{$search}%"))
                  ->orWhereHas('client', fn($c) => $c->where('name', 'like', "%{$search}%"));
            });
        }

        if ($request->filled('current_stage')) {
            $query->where('current_stage', $request->current_stage);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('color')) {
            $query->where('color_resultado_preliminar', $request->color);
        }

        $perPage = $request->input('per_page', 15);
        $items = $query->orderBy('created_at', 'desc')->paginate($perPage);
        $items->withQueryString();

        $stages = [
            'borrador' => 'Borrador',
            'consulta_disponibilidad' => 'Consulta Disponibilidad',
            'radicacion' => 'Radicación',
            'revision_completitud' => 'Revisión Completitud',
            'verificacion_tecnica' => 'Verificación Técnica',
            'aprobacion_contrato' => 'Aprobación y Contrato',
            'visita_energizacion' => 'Visita y Energización',
            'medidor_bidireccional' => 'Medidor Bidireccional',
            'completado' => 'Completado',
            'negado' => 'Negado',
        ];

        $statistics = [
            'total' => AireSeguimiento::count(),
            'activos' => AireSeguimiento::where('status', 'activo')->count(),
            'completados' => AireSeguimiento::where('status', 'completado')->count(),
            'verdes' => AireSeguimiento::where('color_resultado_preliminar', 'verde')->count(),
            'rojos' => AireSeguimiento::where('color_resultado_preliminar', 'rojo')->count(),
        ];

        return Inertia::render('AireSeguimiento/Index', [
            'items' => $items,
            'filters' => $request->only(['search', 'current_stage', 'status', 'color', 'per_page']),
            'statistics' => $statistics,
            'stages' => $stages,
        ]);
    }

    public function create()
    {
        $projects = Project::with(['client.connectionPoint'])
            ->whereNull('deleted_at')
            ->orderBy('name')
            ->get()
            ->map(fn($p) => [
                'id' => $p->id,
                'name' => $p->name,
                'code' => $p->code,
                'client' => $p->client ? ['id' => $p->client->id, 'name' => $p->client->name, 'nic' => $p->client->nic] : null,
                'has_connection_point' => $p->client?->connectionPoint !== null,
            ]);

        return Inertia::render('AireSeguimiento/Create', [
            'projects' => $projects,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'project_id' => 'required|exists:projects,id',
            'potencia_proyecto_kw' => 'required|numeric|min:0.1|max:5000',
            'nic' => 'nullable|string|max:50',
        ]);

        $project = Project::with('client.connectionPoint')->findOrFail($validated['project_id']);

        if (AireSeguimiento::where('project_id', $project->id)->exists()) {
            return back()->withErrors(['project_id' => 'Este proyecto ya tiene un seguimiento Air-e.']);
        }

        $seguimiento = $this->aireService->createFromProject(
            $project,
            (float) $validated['potencia_proyecto_kw']
        );

        $this->aireService->registrarLog(
            $seguimiento,
            'created',
            'Seguimiento Air-e creado',
            Auth::id()
        );

        return to_route('aire-seguimiento.show', $seguimiento->id);
    }

    public function show(AireSeguimiento $seguimiento)
    {
        $seguimiento->load(['project.client', 'documentos', 'logs.user', 'creator']);

        $fechasCalculadas = $this->aireService->calcularFechasLimite($seguimiento);
        $transitions = $this->aireService->allowedTransitions($seguimiento->current_stage);
        $puedeDuplicar = $this->aireService->puedeDuplicarExpediente($seguimiento);

        $stages = [
            'borrador' => ['label' => 'Borrador', 'order' => 0],
            'consulta_disponibilidad' => ['label' => 'Consulta de Disponibilidad', 'order' => 1],
            'radicacion' => ['label' => 'Radicación', 'order' => 2],
            'revision_completitud' => ['label' => 'Revisión de Completitud', 'order' => 3],
            'verificacion_tecnica' => ['label' => 'Verificación Técnica', 'order' => 4],
            'aprobacion_contrato' => ['label' => 'Aprobación y Contrato', 'order' => 5],
            'visita_energizacion' => ['label' => 'Visita Técnica y Energización', 'order' => 6],
            'medidor_bidireccional' => ['label' => 'Medidor Bidireccional', 'order' => 7],
            'completado' => ['label' => 'Completado', 'order' => 8],
            'negado' => ['label' => 'Negado', 'order' => 9],
        ];

        return Inertia::render('AireSeguimiento/Show', [
            'seguimiento' => $seguimiento,
            'fechasCalculadas' => $fechasCalculadas,
            'allowedTransitions' => $transitions,
            'puedeDuplicar' => $puedeDuplicar,
            'stages' => $stages,
        ]);
    }

    public function update(Request $request, AireSeguimiento $seguimiento)
    {
        $validated = $request->validate([
            'potencia_proyecto_kw' => 'nullable|numeric|min:0.1|max:5000',
            'nic' => 'nullable|string|max:50',
            'circuito' => 'nullable|string|max:100',
            'subestacion' => 'nullable|string|max:100',
            'direccion_predio' => 'nullable|string',
            'observaciones_radicacion' => 'nullable|string',
            'numero_radicado' => 'nullable|string|max:100',
            'color_resultado_oficial' => 'nullable|in:verde,amarillo,naranja,rojo',
            'porcentaje_resultado_oficial' => 'nullable|numeric|min:0|max:100',
            'requiere_estudio_conexion' => 'nullable|boolean',
            'fecha_consulta_disponibilidad' => 'nullable|date',
            'fecha_radicacion' => 'nullable|date',
            'fecha_inicio_revision_completitud' => 'nullable|date',
            'estado_completitud' => 'nullable|in:en_revision,subsanacion_requerida,aprobada,negada',
            'fecha_notificacion_subsanacion' => 'nullable|date',
            'observaciones_completitud' => 'nullable|string',
            'fecha_entrega_subsanacion' => 'nullable|date',
            'fecha_inicio_verificacion_tecnica' => 'nullable|date',
            'estado_verificacion' => 'nullable|in:en_revision,subsanacion_requerida,aprobada,negada',
            'motivo_negacion' => 'nullable|string',
            'fecha_notificacion_or_tecnica' => 'nullable|date',
            'observaciones_tecnicas' => 'nullable|string',
            'fecha_entrega_subsanacion_tecnica' => 'nullable|date',
            'fecha_aprobacion' => 'nullable|date',
            'prorroga_solicitada' => 'nullable|boolean',
            'fecha_vencimiento_prorrogada' => 'nullable|date',
            'numero_contrato_conexion' => 'nullable|string|max:100',
            'fecha_firma_contrato' => 'nullable|date',
            'fecha_solicitud_visita' => 'nullable|date',
            'fecha_visita_programada' => 'nullable|date',
            'resultado_visita_1' => 'nullable|in:aprobada,ajustes_requeridos,no_realizada',
            'observaciones_visita_1' => 'nullable|string',
            'fecha_visita_2' => 'nullable|date',
            'resultado_visita_2' => 'nullable|in:aprobada,ajustes_requeridos',
            'costo_visitas_adicionales' => 'nullable|numeric|min:0',
            'fecha_energizacion' => 'nullable|date',
            'requiere_medidor_bidireccional' => 'nullable|boolean',
            'fecha_solicitud_cambio_medidor' => 'nullable|date',
            'fecha_instalacion_medidor' => 'nullable|date',
            'numero_medidor_nuevo' => 'nullable|string|max:100',
            'tipo_medidor' => 'nullable|string|max:100',
            'fecha_inicio_facturacion_neta' => 'nullable|date',
            'comercializador_excedentes' => 'nullable|string|max:200',
            'numero_contrato_excedentes' => 'nullable|string|max:100',
        ]);

        $seguimiento->update($validated);

        return back()->with('success', 'Seguimiento actualizado correctamente.');
    }

    public function updateStage(Request $request, AireSeguimiento $seguimiento)
    {
        $validated = $request->validate([
            'target_stage' => 'required|string',
        ]);

        $success = $this->aireService->transitionTo(
            $seguimiento,
            $validated['target_stage'],
            Auth::id()
        );

        if (!$success) {
            return back()->withErrors(['target_stage' => 'Transición no permitida desde el estado actual.']);
        }

        return back()->with('success', 'Etapa actualizada correctamente.');
    }

    public function uploadDocument(Request $request, AireSeguimiento $seguimiento)
    {
        $validated = $request->validate([
            'stage' => 'required|in:consulta_disponibilidad,radicacion,subsanacion_completitud,subsanacion_tecnica,aprobacion_contrato,visita_energizacion,medidor_bidireccional',
            'tipo_documento' => 'required|string|max:100',
            'file' => 'required|file|mimes:pdf,doc,docx,xls,xlsx,jpg,jpeg,png|max:20480',
        ]);

        $file = $request->file('file');
        $path = $file->store("aire-seguimiento/{$seguimiento->id}", 'public');

        $seguimiento->documentos()->create([
            'stage' => $validated['stage'],
            'tipo_documento' => $validated['tipo_documento'],
            'file_path' => $path,
            'original_filename' => $file->getClientOriginalName(),
            'file_size' => $file->getSize(),
            'mime_type' => $file->getMimeType(),
            'user_id' => Auth::id(),
        ]);

        $this->aireService->registrarLog(
            $seguimiento,
            'document_uploaded',
            "Documento '{$validated['tipo_documento']}' cargado para etapa {$validated['stage']}",
            Auth::id()
        );

        return back()->with('success', 'Documento cargado correctamente.');
    }

    public function checkNic(Request $request)
    {
        $validated = $request->validate([
            'nic' => 'required|string|max:50',
        ]);

        $result = $this->connectionPointService->search($validated['nic']);

        if ($result === null) {
            return back()->withErrors(['nic' => 'No se encontraron datos para el NIC ingresado. Verifique la matrícula en la factura de Air-e.']);
        }

        return back()->with([
            'proxy_data' => $result,
            'success' => 'Datos del transformador obtenidos correctamente.',
        ]);
    }

    public function duplicate(AireSeguimiento $seguimiento)
    {
        if (!$this->aireService->puedeDuplicarExpediente($seguimiento)) {
            return back()->withErrors(['error' => 'Solo se pueden duplicar expedientes en estado negado.']);
        }

        $nuevo = $this->aireService->duplicarExpediente($seguimiento, Auth::id());

        return to_route('aire-seguimiento.show', $nuevo->id)
            ->with('success', 'Expediente duplicado correctamente.');
    }

    public function destroy(AireSeguimiento $seguimiento)
    {
        $seguimiento->delete();

        return to_route('aire-seguimiento.index')
            ->with('success', 'Seguimiento eliminado correctamente.');
    }
}
