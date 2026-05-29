<?php

namespace App\Mcp;

use App\Models\Client;
use App\Models\User;
use Illuminate\Support\Facades\Validator;

class McpServer
{
    private ?User $authenticatedUser = null;

    private ?string $envToken = null;

    public function setTokenFromEnv(string $token): void
    {
        $this->envToken = $token;
    }

    public function isAuthenticated(): bool
    {
        return $this->authenticatedUser !== null;
    }

    public function handleRequest(array $request): array
    {
        $method = $request['method'] ?? '';
        $params = $request['params'] ?? [];
        $id = $request['id'] ?? null;

        if ($method !== 'initialize' && ! $this->isAuthenticated()) {
            return [
                'error' => [
                    'code' => -32001,
                    'message' => 'Unauthorized: MCP token required',
                ],
                'id' => $id,
            ];
        }

        return match ($method) {
            'initialize' => $this->initialize($params),
            'tools/list' => $this->listTools(),
            'tools/call' => $this->callTool($params),
            'ping' => ['result' => true, 'id' => $id],
            default => [
                'error' => [
                    'code' => -32601,
                    'message' => "Method not found: {$method}",
                ],
                'id' => $id,
            ],
        };
    }

    private function initialize(array $params): array
    {
        $token = $this->envToken ?? $params['auth']['token'] ?? null;

        if ($token) {
            $tokenHash = hash('sha256', $token);
            $user = User::where('mcp_token', $tokenHash)
                ->whereNotNull('mcp_token_created_at')
                ->first();

            if ($user) {
                $this->authenticatedUser = $user;
            }
        }

        return [
            'result' => [
                'protocolVersion' => '2024-11-05',
                'capabilities' => [
                    'tools' => true,
                ],
                'serverInfo' => [
                    'name' => 'Vcore MCP Server',
                    'version' => '1.0.0',
                ],
            ],
            'id' => null,
        ];
    }

    private function listTools(): array
    {
        $allowedTools = $this->getAllowedTools();

        $allTools = [
            [
                'name' => 'list_clients',
                'description' => 'Lista los clientes con filtros opcionales',
                'inputSchema' => [
                    'type' => 'object',
                    'properties' => [
                        'search' => ['type' => 'string', 'description' => 'Búsqueda por nombre o email'],
                        'status' => ['type' => 'string', 'enum' => ['Lead', 'Cotizando', 'Cliente', 'Perdido'], 'description' => 'Filtrar por estado'],
                        'scoring' => ['type' => 'integer', 'description' => 'Filtrar por puntuación mínima (1-10)'],
                        'per_page' => ['type' => 'integer', 'description' => 'Cantidad de resultados por página', 'default' => 10],
                    ],
                ],
            ],
            [
                'name' => 'get_client',
                'description' => 'Obtiene los detalles de un cliente por ID',
                'inputSchema' => [
                    'type' => 'object',
                    'properties' => [
                        'id' => ['type' => 'integer', 'description' => 'ID del cliente'],
                    ],
                    'required' => ['id'],
                ],
            ],
            [
                'name' => 'create_client',
                'description' => 'Crea un nuevo cliente',
                'inputSchema' => [
                    'type' => 'object',
                    'properties' => [
                        'name' => ['type' => 'string', 'description' => 'Nombre del cliente'],
                        'email' => ['type' => 'string', 'format' => 'email'],
                        'phone' => ['type' => 'string'],
                        'address' => ['type' => 'string'],
                        'city' => ['type' => 'string'],
                        'state' => ['type' => 'string'],
                        'energy_consumption_kwh' => ['type' => 'integer', 'description' => 'Consumo energético mensual en kWh'],
                        'monthly_bill_amount' => ['type' => 'number', 'description' => 'Factura mensual promedio en COP'],
                        'energy_tariff' => ['type' => 'number', 'description' => 'Tarifa energética en COP/kWh'],
                        'available_area_m2' => ['type' => 'integer', 'description' => 'Área disponible en m²'],
                        'scoring' => ['type' => 'integer', 'minimum' => 1, 'maximum' => 10],
                        'status' => ['type' => 'string', 'enum' => ['Lead', 'Cotizando', 'Cliente', 'Perdido']],
                    ],
                    'required' => ['name'],
                ],
            ],
            [
                'name' => 'update_client',
                'description' => 'Actualiza un cliente existente',
                'inputSchema' => [
                    'type' => 'object',
                    'properties' => [
                        'id' => ['type' => 'integer', 'description' => 'ID del cliente'],
                        'name' => ['type' => 'string'],
                        'email' => ['type' => 'string', 'format' => 'email'],
                        'phone' => ['type' => 'string'],
                        'address' => ['type' => 'string'],
                        'city' => ['type' => 'string'],
                        'state' => ['type' => 'string'],
                        'energy_consumption_kwh' => ['type' => 'integer'],
                        'monthly_bill_amount' => ['type' => 'number'],
                        'energy_tariff' => ['type' => 'number'],
                        'available_area_m2' => ['type' => 'integer'],
                        'scoring' => ['type' => 'integer', 'minimum' => 1, 'maximum' => 10],
                        'status' => ['type' => 'string', 'enum' => ['Lead', 'Cotizando', 'Cliente', 'Perdido']],
                    ],
                    'required' => ['id'],
                ],
            ],
            [
                'name' => 'delete_client',
                'description' => 'Elimina un cliente por ID',
                'inputSchema' => [
                    'type' => 'object',
                    'properties' => [
                        'id' => ['type' => 'integer', 'description' => 'ID del cliente'],
                    ],
                    'required' => ['id'],
                ],
            ],
        ];

        $tools = array_filter($allTools, fn ($tool) => in_array($tool['name'], $allowedTools));

        return [
            'result' => ['tools' => array_values($tools)],
            'id' => null,
        ];
    }

    private function checkToolPermission(string $toolName): bool
    {
        if (! $this->authenticatedUser) {
            return false;
        }

        if ($this->authenticatedUser->hasRole('admin')) {
            return true;
        }

        foreach ($this->authenticatedUser->roles as $role) {
            if ($role->hasMcpToolPermission($toolName)) {
                return true;
            }
        }

        return false;
    }

    private function getAllowedTools(): array
    {
        if (! $this->authenticatedUser) {
            return [];
        }

        if ($this->authenticatedUser->hasRole('admin')) {
            return ['list_clients', 'get_client', 'create_client', 'update_client', 'delete_client'];
        }

        $allowed = [];
        foreach ($this->authenticatedUser->roles as $role) {
            $allowed = array_merge($allowed, $role->getMcpToolNames());
        }

        return array_unique($allowed);
    }

    private function callTool(array $params): array
    {
        $name = $params['name'] ?? '';
        $args = $params['arguments'] ?? [];

        if (! $this->checkToolPermission($name)) {
            return [
                'error' => [
                    'code' => -32003,
                    'message' => "Forbidden: No tienes permiso para usar la herramienta {$name}",
                ],
            ];
        }

        return match ($name) {
            'list_clients' => $this->listClients($args),
            'get_client' => $this->getClient($args),
            'create_client' => $this->createClient($args),
            'update_client' => $this->updateClient($args),
            'delete_client' => $this->deleteClient($args),
            default => ['error' => ['code' => -32602, 'message' => "Unknown tool: {$name}"]],
        };
    }

    private function listClients(array $args): array
    {
        $query = Client::query();

        if (! empty($args['search'])) {
            $search = $args['search'];
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        if (! empty($args['status'])) {
            $query->where('status', $args['status']);
        }

        if (! empty($args['scoring'])) {
            $query->where('scoring', '>=', $args['scoring']);
        }

        $perPage = $args['per_page'] ?? 10;
        $clients = $query->orderBy('id', 'desc')->paginate($perPage);

        return [
            'content' => [
                [
                    'type' => 'text',
                    'text' => json_encode([
                        'data' => $clients->items(),
                        'pagination' => [
                            'current_page' => $clients->currentPage(),
                            'last_page' => $clients->lastPage(),
                            'per_page' => $clients->perPage(),
                            'total' => $clients->total(),
                        ],
                    ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE),
                ],
            ],
        ];
    }

    private function getClient(array $args): array
    {
        $client = Client::with(['contacts', 'interactions'])->find($args['id']);

        if (! $client) {
            return ['content' => [['type' => 'text', 'text' => 'Cliente no encontrado']]];
        }

        return [
            'content' => [
                [
                    'type' => 'text',
                    'text' => json_encode($client->toArray(), JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE),
                ],
            ],
        ];
    }

    private function createClient(array $args): array
    {
        $validator = Validator::make($args, [
            'name' => 'required|string|max:255',
            'email' => 'nullable|email|unique:clients,email|max:255',
            'phone' => 'nullable|string|max:255',
            'address' => 'nullable|string|max:255',
            'city' => 'nullable|string|max:255',
            'state' => 'nullable|string|max:255',
            'energy_consumption_kwh' => 'nullable|integer',
            'monthly_bill_amount' => 'nullable|numeric',
            'energy_tariff' => 'nullable|numeric',
            'available_area_m2' => 'nullable|integer',
            'scoring' => 'nullable|integer|min:1|max:10',
            'status' => 'nullable|in:Lead,Cotizando,Cliente,Perdido',
        ]);

        if ($validator->fails()) {
            return ['content' => [['type' => 'text', 'text' => 'Error de validación: '.$validator->errors()->first()]]];
        }

        try {
            $client = Client::create($args);

            return [
                'content' => [
                    [
                        'type' => 'text',
                        'text' => json_encode(['success' => true, 'client' => $client->toArray()], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE),
                    ],
                ],
            ];
        } catch (\Exception $e) {
            return ['content' => [['type' => 'text', 'text' => 'Error al crear cliente: '.$e->getMessage()]]];
        }
    }

    private function updateClient(array $args): array
    {
        $id = $args['id'];
        unset($args['id']);

        $client = Client::find($id);
        if (! $client) {
            return ['content' => [['type' => 'text', 'text' => 'Cliente no encontrado']]];
        }

        $validator = Validator::make($args, [
            'name' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255|unique:clients,email,'.$id,
            'phone' => 'nullable|string|max:255',
            'address' => 'nullable|string|max:255',
            'city' => 'nullable|string|max:255',
            'state' => 'nullable|string|max:255',
            'energy_consumption_kwh' => 'nullable|integer',
            'monthly_bill_amount' => 'nullable|numeric',
            'energy_tariff' => 'nullable|numeric',
            'available_area_m2' => 'nullable|integer',
            'scoring' => 'nullable|integer|min:1|max:10',
            'status' => 'nullable|in:Lead,Cotizando,Cliente,Perdido',
        ]);

        if ($validator->fails()) {
            return ['content' => [['type' => 'text', 'text' => 'Error de validación: '.$validator->errors()->first()]]];
        }

        try {
            $client->update($args);

            return [
                'content' => [
                    [
                        'type' => 'text',
                        'text' => json_encode(['success' => true, 'client' => $client->fresh()->toArray()], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE),
                    ],
                ],
            ];
        } catch (\Exception $e) {
            return ['content' => [['type' => 'text', 'text' => 'Error al actualizar cliente: '.$e->getMessage()]]];
        }
    }

    private function deleteClient(array $args): array
    {
        $client = Client::find($args['id']);
        if (! $client) {
            return ['content' => [['type' => 'text', 'text' => 'Cliente no encontrado']]];
        }

        try {
            $client->delete();

            return [
                'content' => [
                    [
                        'type' => 'text',
                        'text' => json_encode(['success' => true, 'message' => 'Cliente eliminado'], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE),
                    ],
                ],
            ];
        } catch (\Exception $e) {
            return ['content' => [['type' => 'text', 'text' => 'Error al eliminar cliente: '.$e->getMessage()]]];
        }
    }
}
