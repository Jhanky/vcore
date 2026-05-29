# Módulo CRM - Gestión de Clientes

## 1. Descripción General

El módulo CRM (Customer Relationship Management) permite gestionar todo el ciclo de vida de los clientes, desde la captación de leads hasta la conversión en clientes activos. Incluye clasificación por potencial, seguimiento de interacciones y registro de contactos múltiples.

## 2. Modelos de Datos

### 2.1 Client
```php
// app/Models/Client.php
class Client extends Model
{
    protected $fillable = [
        'name',           // Nombre completo
        'email',          // Correo electrónico
        'phone',          // Teléfono principal
        'address',        // Dirección
        'city',           // Ciudad
        'state',          // Departamento
        'scoring',        // Puntuación 1-10
        'status',         // Lead|Cotizando|Cliente|Perdido
        'energy_consumption_kwh',  // Consumo mensual kWh
        'monthly_bill_amount',      // Factura mensual $
        'available_area_m2',        // Área disponible m²
    ];

    // Relaciones
    public function contacts()      → hasMany(ClientContact)
    public function interactions() → hasMany(ClientInteraction)
    public function quotations()   → hasMany(Quotation)
}
```

### 2.2 ClientContact
```php
class ClientContact extends Model
{
    protected $fillable = [
        'client_id',          // FK a Client
        'name',               // Nombre del contacto
        'position',           // Cargo
        'email',             // Email
        'phone',             // Teléfono
        'is_primary',        // Es contacto principal
        'is_decision_maker', // Es tomador de decisiones
    ];
}
```

### 2.3 ClientInteraction
```php
class ClientInteraction extends Model
{
    protected $fillable = [
        'client_id',        // FK a Client
        'type',            // llamada|correo|visita|reunion
        'notes',           // Notas de la interacción
        'interaction_date', // Fecha de interacción
    ];
}
```

## 3. Estados del Cliente

| Estado | Descripción | Color UI |
|--------|-------------|----------|
| `Lead` | Prospecto sin contacto o en investigación inicial | Azul |
| `Cotizando` | Ha solicitado o está en proceso de cotización | Amarillo |
| `Cliente` | Ha aceptado una cotización y es cliente activo | Verde |
| `Perdido` | No concretó o rechazó la propuesta | Rojo |

## 4. Scoring (Puntuación)

El scoring es un valor de 1-10 que indica el potencial del cliente:

| Rango | Descripción | Icono |
|-------|-------------|-------|
| 9-10 | Cliente muy potencial, alta intención | ★ dorado |
| 7-8 | Buen potencial, requiere seguimiento | ★ parcial |
| 5-6 | Potencial medio, necesita nurturing | ☆ gris |
| <5 | Potencial bajo, puede requerir más recursos | ☆ gris |

## 5. Vistas

### 5.1 Clients/Index.tsx
Lista todos los clientes con:
- Búsqueda por nombre, email, teléfono (debounced 300ms)
- Filtro por estado (Lead, Cotizando, Cliente, Perdido)
- Filtro por scoring mínimo (≥5, ≥7, ≥9)
- Tabla virtualizada con react-window (>50 clientes)
- Skeleton loader durante carga
- Paginación con `withQueryString()`

### 5.2 Clients/Form.tsx
Formulario de creación/edición:
- Datos básicos (nombre, email, teléfono, dirección)
- Información de consumo (kWh, factura mensual, área disponible)
- Scoring y estado
- Múltiples contactos con validaciones
- Toggle para financiamiento

### 5.3 Clients/Show.tsx
Vista detallada del cliente:
- Información completa del cliente
- Timeline de interacciones
- Lista de cotizaciones asociadas
- Contactos registrados

## 6. Controlador Backend

```php
// app/Http/Controllers/ClientController.php
class ClientController extends Controller
{
    public function index(Request $request)
    {
        $query = Client::query();

        // Filtros
        if ($search = $request->get('search')) {
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        if ($status = $request->get('status')) {
            $query->where('status', $status);
        }

        if ($scoring = $request->get('scoring')) {
            $query->where('scoring', '>=', $scoring);
        }

        $clients = $query->paginate(10);

        return inertia('Clients/Index', [
            'clients' => $clients,
            'filters' => $request->only(['search', 'status', 'scoring']),
        ]);
    }
}
```

## 7. Rutas

```
GET    /clients              → clients.index   (Lista con filtros)
POST   /clients              → clients.store   (Crear)
GET    /clients/create       → clients.create  (Formulario creación)
GET    /clients/{id}         → clients.show    (Ver detalle)
GET    /clients/{id}/edit    → clients.edit    (Formulario edición)
PUT    /clients/{id}         → clients.update  (Actualizar)
DELETE /clients/{id}         → clients.destroy (Eliminar)
```

## 8. Interacciones

### 8.1 Tipos de Interacción
- **llamada**: Registro de llamada telefónica
- **correo**: Envío o recepción de email
- **visita**: Visita presencial al cliente
- **reunion**: Reunión programada

### 8.2 Registro de Interacción
```php
// En ClientInteractionController
public function store(Request $request)
{
    $validated = $request->validate([
        'client_id' => 'required|exists:clients,id',
        'type' => 'required|in:llamada,correo,visita,reunion',
        'notes' => 'required|string',
        'interaction_date' => 'required|date',
    ]);

    ClientInteraction::create($validated);

    return redirect()->back()->with('success', 'Interacción registrada');
}
```

## 9. Hooks relacionados

| Hook | Descripción |
|------|-------------|
| useDebounce | Filtro de búsqueda con debounce 300ms |

## 10. Componentes relacionados

| Componente | Descripción |
|------------|-------------|
| SkeletonTable | Tabla con skeleton de carga |
| VirtualTableContainer | Tabla virtualizada para >50 filas |

## 11. Flujo del CRM

```
┌──────────────────────────────────────────────────────────────┐
│                         FLUJO CRM                            │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│   ┌─────────┐    ┌─────────────┐    ┌──────────────────┐   │
│   │  LEAD   │───►│ COTIZANDO   │───►│    CLIENTE       │   │
│   │  (Azul) │    │  (Amarillo) │    │    (Verde)       │   │
│   └─────────┘    └─────────────┘    └──────────────────┘   │
│        │                │                                      │
│        │                │                                      │
│        ▼                ▼                                      │
│   ┌─────────┐      ┌─────────┐                                │
│   │ PERDIDO │      │ PERDIDO │                                │
│   │  (Rojo) │      │  (Rojo) │                                │
│   └─────────┘      └─────────┘                                │
│                                                              │
│   CADA TRANSICIÓN REGISTRA UNA INTERACCIÓN                   │
└──────────────────────────────────────────────────────────────┘
```

## 12. Optimizaciones implementadas

- **Virtualización**: Tabla virtualizada con react-window cuando hay >50 clientes
- **Debounce**: Búsqueda con delay de 300ms para evitar múltiples peticiones
- **useMemo**: Filtrado memoizado en el frontend
- **Skeleton**: Estados de carga visuales
- **preserveState**: Mantiene scroll y estado al filtrar
- **withQueryString**: Filtros persistentes en URL
