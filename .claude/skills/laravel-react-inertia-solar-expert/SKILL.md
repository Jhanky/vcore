---
name: laravel-react-inertia-solar-expert
description: Experto en el stack Laravel 13 + React + Inertia + TypeScript del proyecto Vcore CRM solar. Utiliza esta skill cuando trabajes con código del proyecto, crees nuevas funcionalidades, modifiques modelos, controladores, vistas, o cualquier tarea que involucre el stack completo de este CRM solar colombiano.
---

# Skill: Laravel + React + Inertia Solar CRM Expert

Esta skill te convierte en experto del stack técnico del proyecto Vcore CRM Solar — un sistema CRM para empresas de energía solar en Colombia, construido con Laravel 13 + Inertia.js + React + TypeScript.

---

## Stack Tecnológico

| Capa | Tecnología |
|------|------------|
| Backend | Laravel 13 (PHP 8.2+) |
| Frontend | React 18 + Inertia 2.0 |
| Build | Vite 6 |
| Styling | Tailwind 3.2 + CSS Variables |
| DB | SQLite (desarrollo) |
| Auth | Laravel Breeze + Inertia (cookie-based) |
| Permisos | Spatie Laravel Permission v7.3 |
| Gráficos | Recharts |
| Iconos | Lucide React |
| Animaciones | Framer Motion |
| Notificaciones | Sonner |
| UI Components | HeadlessUI + Custom Components |

---

## Convenciones Backend

### 1. Estructura de Controllers

**Ubicación:** `app/Http/Controllers/`

Los controllers:
- Extienden `Controller` base (vacío en Laravel 13)
- Usan **inyección de dependencias** en el constructor para servicios
- Usan **validación inline** con `$request->validate([])` dentro del método (no solo FormRequest)
- Usan **transacciones DB** con `DB::beginTransaction()/commit()/rollBack()` para operaciones complejas
- Retornan componentes Inertia: `return Inertia::render('Ruta/Pagina', ['props' => $data])`

```php
// Patrón típico de controller
class ProjectController extends Controller
{
    public function __construct(
        private \App\Services\ProjectService $projectService,
        private \App\Services\StateFieldService $stateFieldService
    ) {}

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'client_id' => 'required|exists:clients,id',
        ]);

        DB::beginTransaction();
        try {
            $project = $this->projectService->create($validated);
            DB::commit();
            return redirect()->route('projects.show', $project->id);
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }
}
```

### 2. Estructura de Models

**Ubicación:** `app/Models/`

Los models:
- Usan `HasFactory` para factories
- Usan `SoftDeletes` para borrado suave
- Usan relaciones Eloquent definidas con método `function name(): Type`
- Definen `$fillable` para asignación masiva
- Definen `$casts` para mutators

```php
// Patrón típico de model
class Project extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'code', 'client_id', 'name', 'current_state_id',
        'contracted_value_cop', 'total_cost_cop',
    ];

    protected function casts(): array
    {
        return [
            'start_date' => 'datetime',
            'contracted_value_cop' => 'decimal:2',
        ];
    }

    // Relaciones
    public function client(): BelongsTo { return $this->belongsTo(Client::class); }
    public function milestones(): HasMany { return $this->hasMany(Milestone::class); }

    // Scopes
    public function scopeActive($query) { return $query->where('is_active', true); }

    // Accessors
    public function getProgressAttribute(): int { /* calculo */ }

    // Helper estático
    public static function generateCode(): string { /* PRO-2026-0001 */ }
}
```

### 3. Sistema de Permisos (Spatie)

**Modelo User** usa `HasRoles` de Spatie:
```php
class User extends Authenticatable
{
    use HasFactory, Notifiable, HasRoles, SoftDeletes;
}
```

**Verificación de roles:**
```php
$user->hasRole(['admin', 'gerente']);
$user->hasPermissionTo('create quotations');
$user->isAdminOrGerente(); // Helper del proyecto
```

**Permisos definidos:**
- `manage users`, `manage roles`
- `view quotations`, `create quotations`, `edit quotations`, `delete quotations`, `approve quotations`
- `manage supplies`
- `view projects`, `manage projects`
- `view evidences`
- `view clients`, `manage clients`

**Roles:** `admin`, `comercial`, `tecnico`, `gerente`

### 4. Rutas

**Ubicación:** `routes/web.php`

Patrones:
- Todas las rutas usan middleware `auth`
- Resource controllers con rutas custom
- Rutas custom para projects: 20+ rutas adicionales (status, notes, documents, milestones, history, etc.)

```php
Route::middleware('auth')->group(function () {
    Route::resource('clients', ClientController::class);
    Route::resource('quotations', QuotationController::class);
    Route::resource('projects', ProjectController::class);

    // Rutas custom de projects
    Route::patch('projects/{project}/status', ...)->name('projects.changeStatus');
    Route::post('projects/{project}/notes', ...)->name('projects.notes');
    Route::post('projects/{project}/documents', ...)->name('projects.documents');
    // ... más
});
```

### 5. Servicios (Service Layer)

**Ubicación:** `app/Services/`

Los servicios contienen lógica de negocio compleja:
```php
ProjectService.php          // Lógica de proyectos
QuotationService.php        // Cálculos financieros de cotizaciones
StateFieldService.php       // Campos dinámicos por estado
ConnectionPointService.php // Integración API externa UPME
SolarProductionCalculator.php // Cálculos de producción solar
ProposalService.php         // Generación de PDF
QuotationSuggestionService.php // Sugerencias IA
SolarConstants.php         // Constantes HSP, PR, tariff
```

### 6. Inertia Render y Props

```php
// En controller
return Inertia::render('Clients/Index', [
    'clients' => $clients,
    'filters' => $filters,
    'clientTypes' => ClientType::all(),
    'statistics' => $statistics,
]);

// Props se reciben en frontend como interface TypeScript
interface Props {
    clients: PaginatedData;
    filters: { search?: string; client_type?: string; };
    clientTypes: { id: number; name: string; code: string }[];
    statistics: { total: number; total_consumption: number; };
}
```

---

## Convenciones Frontend

### 1. Estructura de Archivos

```
resources/js/
├── app.tsx                    # Entry point
├── bootstrap.ts              # Axios setup
├── types/
│   ├── index.d.ts           # PageProps, User interfaces
│   └── global.d.ts          # Window.axios, route extension
├── Layouts/
│   ├── AuthenticatedLayout.tsx  # Sidebar + nav
│   └── GuestLayout.tsx
├── Components/              # 27 componentes globales
│   ├── DataTable.tsx        # Tabla con paginación
│   ├── Modal.tsx           # HeadlessUI modal
│   ├── TextInput.tsx       # Input estilizado
│   ├── Toast.tsx           # Toasts (export showToast)
│   └── ...
├── Pages/                  # 25 páginas
│   ├── Clients/Index.tsx, Form.tsx, Show.tsx
│   ├── Quotations/Index.tsx, Form.tsx, Show.tsx
│   ├── Projects/ProjectDetailsPage.tsx, ProjectsPage.tsx
│   └── ...
├── features/
│   ├── projects/components/  # Componentes complejos de proyectos
│   └── evidences/components/
├── hooks/
│   ├── useThemeInit.ts
│   └── useDebounce.ts
├── utils/
│   ├── cn.ts                # clsx + tailwind-merge
│   ├── solarCalculator.ts
│   └── solarConstants.ts
└── services/
    └── projectService.js    # Service layer con Inertia router
```

### 2. Patrón de Componentes

```typescript
// Componente con forwardRef + memo + useImperativeHandle
const TextInput = memo(forwardRef(function TextInput(
    { type = 'text', className = '', isFocused = false, ...props }: InputHTMLAttributes<HTMLInputElement>,
    ref,
) {
    const localRef = useRef<HTMLInputElement>(null);
    useImperativeHandle(ref, () => ({ focus: () => localRef.current?.focus() }));
    useEffect(() => { if (isFocused) localRef.current?.focus(); }, []);
    return <input {...props} type={type} className={'... ' + className} ref={localRef} />;
}));

export default TextInput;
```

### 3. Uso de Inertia

```typescript
import { Link, router, usePage } from '@inertiajs/react';

// Navegación
<Link href={route('clients.index')}>Clientes</Link>

// Acciones con callbacks
router.delete(route('clients.destroy', id), {
    preserveScroll: true,
    onSuccess: () => showToast('Cliente eliminado', 'success'),
    onError: (errors) => showToast(errors.message, 'error'),
});

// Acceso a auth
const { auth } = usePage().props as any;
const isComercial = auth?.user?.roles?.includes('comercial');
```

### 4. Sistema de Estilos

**Tailwind + CSS Variables:**
```css
/* resources/css/app.css */
:root {
    --bg-main: #0B0F19;
    --bg-content: #111827;
    --text-primary: #F8FAFC;
    --border-ui: rgba(255, 255, 255, 0.1);
    --solar-gold: #548F4B; /* Verde solar */
}
```

**Clases utilitarias:**
```tsx
// Superficies con glassmorphism
<div className="glass rounded-[2rem]" />

// Colores del brand
<div className="text-[var(--solar-gold)]" />
<div className="border-[var(--border-ui)]" />

// Animaciones
<div className="animate-slide-up" />
```

### 5. UI Components Comunes

```typescript
// DataTable genérico
<DataTable
    data={clients.data}
    columns={columns}
    pagination={clients}
    onSearch={handleSearch}
    actions={(item) => <Menu>...</Menu>}
/>

// Modal con HeadlessUI
<Modal show={show} onClose={onClose} maxWidth="2xl">
    {children}
</Modal>

// Toast
import { showToast } from '@/Components/Toast';
showToast('Mensaje', 'success');
```

### 6. hook useForm de Inertia

```typescript
const { data, setData, post, patch, processing, errors, reset } = useForm({
    client_id: '',
    name: '',
    priority: 'media',
});

const handleSubmit = (e) => {
    e.preventDefault();
    post(route('projects.store'), {
        onSuccess: () => { onClose(); reset(); },
    });
};
```

---

## Modelos Principales

### Client
```php
$client->fillable = ['name', 'email', 'phone', 'nic', 'address', 'city', 'state',
                     'energy_consumption_kwh', 'monthly_bill_amount', 'energy_tariff',
                     'available_area_m2', 'user_id'];
$client->relations = ['creator', 'contacts', 'interactions', 'clientTypes', 'connectionPoint'];
```

### Project
```php
$project->fillable = ['code', 'client_id', 'quotation_id', 'current_state_id', 'name',
                      'description', 'installation_address', 'coordinates', 'start_date',
                      'estimated_end_date', 'contracted_value_cop', 'total_cost_cop',
                      'project_manager_id', 'technical_leader_id', 'priority', 'is_active'];
$project->relations = ['client', 'quotation', 'currentState', 'projectManager',
                      'technicalLeader', 'stateHistory', 'notes', 'documents',
                      'technicalSpecs', 'upmeDetail', 'costCenter', 'milestones'];
```

### Quotation
```php
$quotation->fillable = ['client_id', 'user_id', 'code', 'project_name', 'status',
                       'system_type', 'network_type', 'power_kwp', 'panel_count',
                       'profit_percentage', 'iva_profit_percentage', 'commercial_management_percentage',
                       'administration_percentage', 'contingency_percentage', 'withholding_percentage',
                       'subtotal', 'subtotal2', 'subtotal3', 'total_value'];
$quotation->relations = ['client', 'user', 'project', 'products', 'items', 'statusHistory'];
```

### Estados de Cotización
```php
'Borrador' → ['Enviada', 'Vencida']
'Enviada' → ['Borrador', 'Aprobada', 'Rechazada', 'Vencida']
'Aprobada' → [] // Terminal
'Rechazada' → ['Borrador']
'Vencida' → ['Borrador']
```

### Estados de Proyecto (10 estados)
```
BORRADOR → SOL_FACTIBILIDAD → FACT_APROBADA → DISEÑO_ELECTRICO →
DISEÑO_CONFORME → CONSTRUCCION → OBRA_TERMINADA → CONEXION_APROBADA →
ENERGIZADO → OPERACION_RED
```

### Roles y Permisos

| Rol | Permisos clave |
|-----|---------------|
| admin | Todos |
| gerente | view/edit quotations, approve, manage projects, manage clients, manage users |
| comercial | view/create quotations, view clients |
| tecnico | view projects, manage technical aspects |

---

## Seeders de Datos

**Orden de ejecución:**
1. `RolesAndPermissionsSeeder` - Permisos + 4 roles
2. `UsersByRoleSeeder` - 4 usuarios (admin, comercial, tecnico, gerente)
3. `ClientTypeSeeder` - 4 tipos (Residenciales, Comerciales, Institucionales, Industriales)
4. `PanelSeeder` - 22 paneles
5. `InverterSeeder` - 29 inversores
6. `BatterySeeder` - 12 baterías
7. `ProjectStateSeeder` - 10 estados
8. `RequiredDocumentSeeder` - Documentos por estado
9. `ProjectStateFieldSeeder` - Campos dinámicos

**Usuarios default:**
```
admin@vcore.com / password (admin)
comercial@vcore.com / password (comercial)
tecnico@vcore.com / password (tecnico)
gerente@vcore.com / password (gerente)
```

---

## Servicios de Cálculo Solar

### SolarProductionCalculator
```php
// Calcula producción solar mensual
calculateMonthlyProduction(powerKwp, month): float  // kWh
calculateAnnualProduction(powerKwp): float          // kWh/año
```

### Constantes (SolarConstants)
```php
HSP_COLOMBIA = 5.0  // Horas Solares Pico
PERFORMANCE_RATIO = 0.78  // Factor de eficiencia
LOSSES_FACTOR = 0.85
```

### Cálculo de área
```typescript
// solarAreaCalculator.ts
calculateRequiredArea(panelQty: number, panelPower: number): number  // m²
```

---

## Patrones de Validación

### Validación Inline (preferido en este proyecto)
```php
$validated = $request->validate([
    'name' => 'required|string|max:255',
    'email' => 'required|email|unique:clients,email|max:255',
    'contacts' => 'nullable|array',
    'contacts.*.name' => 'required_with:contacts|string|max:255',
    'client_types' => 'required|array',
    'client_types.*' => 'exists:client_types,id',
]);
```

### FormRequest (para formularios complejos)
```php
class ProfileUpdateRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', Rule::unique(User::class)->ignore($this->user()->id)],
        ];
    }
}
```

---

## API y Routing

**No existe `routes/api.php`** — Toda la API usa rutas web con Inertia (cookie-based session auth).

**Laravel Sanctum** está configurado pero solo para tokens MCP (`mcp_token` en User), no para API REST público.

---

## Helpers Globales de Frontend

### cn() - Classnames utility
```typescript
import { cn } from '@/utils/cn';
cn('px-4 py-2', isActive && 'bg-blue-500', 'text-sm')  // clsx + tailwind-merge
```

### showToast - Notificaciones
```typescript
import { showToast } from '@/Components/Toast';
showToast('Guardado exitosamente', 'success');
showToast('Error al guardar', 'error');
showToast('Advertencia', 'warning');
```

### route() - Ziggy routes
```typescript
route('clients.index')      // URL: /clients
route('projects.show', id)  // URL: /projects/1
```

---

## Comandos de Desarrollo

```bash
# Desarrollo local
npm run dev

# Instalar dependencias
composer install && npm install

# Migraciones y seeders
php artisan migrate
php artisan db:seed

# Tests
npm run test          # Tests Laravel
npx vitest            # Tests React

# Linting
./vendor/bin/pint     # PHP
npx eslint            # JS/TS
npx tsc --noEmit      # TypeScript

# Build
npm run build
```

---

## Reglas de Oro

1. **Controllers devuelven Inertia::render()** — Nunca devuelvas JSON directamente salvo que sea un endpoint explícito
2. **Validación inline** — Usa `$request->validate([])` dentro del método del controller
3. **Usa servicios** — La lógica de negocio va en Services, no en Controllers
4. **SoftDeletes** — Todos los modelos principales usan soft deletes
5. **Transacciones** — Envuelve operaciones complejas en DB::beginTransaction/commit/rollBack
6. **Scopes** — Usa scopes Eloquent para filtros reutilizables (`scopeActive`, `scopeByState`)
7. **Inertia Link + Router** — Para navegación y acciones, usa `Link` y `router` de Inertia, no `<a>`
8. **TypeScript interfaces** — Define interfaces para las props de cada página
9. **CSS Variables + Tailwind** — Usa variables CSS para colores del theme, Tailwind para el resto
10. **useMemo para cálculos costosos** — Cachea cálculos solares con useMemo