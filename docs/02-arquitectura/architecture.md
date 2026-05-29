# Arquitectura - VatioCore

## 1. Stack Tecnológico

### Backend
- **Framework**: Laravel 13.x (PHP 8.3+)
- **Base de datos**: SQLite (embebida)
- **Autenticación**: Laravel Sanctum + Breeze
- **API IA**: Laravel AI SDK (`laravel/ai` v0.6.0)
- **SSR Bridge**: Inertia.js (Laravel adapter)

### Frontend
- **Framework UI**: React 18.x
- **Lenguaje**: TypeScript 5.x
- **Bundler**: Vite 6.x
- **Estilos**: Tailwind CSS 3.x
- **UI Components**: HeadlessUI v2
- **Iconos**: Lucide React
- **Gráficos**: Recharts (lazy loaded)
- **Tablas virtuales**: react-window

### Arquitectura General
```
┌─────────────────────────────────────────────────────────────────┐
│                        BROWSER                                 │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐     │
│  │   React SPA  │◄──►│  Inertia.js  │◄──►│    Laravel  │     │
│  │  (Frontend) │    │   (Bridge)   │    │   (Backend) │     │
│  └──────────────┘    └──────────────┘    └──────────────┘     │
│         │                    │                    │              │
│         ▼                    ▼                    ▼              │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐     │
│  │   Vite.js    │    │    Ziggy     │    │   SQLite     │     │
│  │  (Build/HMR) │    │  (Routes)    │    │  (Database)  │     │
│  └──────────────┘    └──────────────┘    └──────────────┘     │
└─────────────────────────────────────────────────────────────────┘
```

## 2. Estructura de Directorios

```
Vcore/
├── app/
│   ├── Http/
│   │   ├── Controllers/       # Controladores de recursos
│   │   │   ├── Auth/          # Autenticación Breeze
│   │   │   ├── BatteryController.php
│   │   │   ├── ClientController.php
│   │   │   ├── ClientInteractionController.php
│   │   │   ├── InverterController.php
│   │   │   ├── PanelController.php
│   │   │   ├── ProfileController.php
│   │   │   ├── QuotationController.php
│   │   │   └── SupplyController.php
│   │   ├── Middleware/
│   │   │   └── HandleInertiaRequests.php  # Shared data
│   │   └── Requests/           # Validación de formularios
│   └── Models/                # Modelos Eloquent
├── resources/
│   ├── css/
│   │   └── app.css            # Tailwind + variables de tema
│   └── js/
│       ├── app.tsx            # Inertia app setup
│       ├── bootstrap.ts       # Axios config
│       ├── Components/        # Componentes reutilizables
│       │   ├── Auth/
│       │   ├── Layouts/
│       │   └── UI/            # Modal, Dropdown, TextInput...
│       ├── Hooks/             # Custom hooks
│       │   ├── useDebounce.ts
│       │   ├── useAsync.ts
│       │   └── useMediaQuery.ts
│       └── Pages/             # Vistas por módulo
│           ├── Auth/
│           ├── Clients/
│           ├── Dashboard.tsx
│           ├── Quotations/
│           └── Supplies/
├── routes/
│   ├── web.php               # Rutas principales
│   └── auth.php              # Rutas auth Breeze
├── config/                   # Configuraciones Laravel
│   └── ai.php                # Proveedores IA
└── docs/                     # Documentación
```

## 3. Patrones de Diseño

### 3.1 Server-Driven SPA (Inertia)
La navegación es maneja por Laravel, no por React Router. Cada página es un componente React que recibe datos del servidor.

```typescript
// resources/js/app.tsx
createInertiaApp({
    resolve: (name) => resolvePageComponent(
        `./Pages/${name}.tsx`,
        import.meta.glob('./Pages/**/*.tsx'),
    ),
});
```

### 3.2 Lazy Loading de Páginas
Las páginas se cargan dinámicamente usando `import.meta.glob`:

```typescript
// vite.config.js
resolve: (name) => resolvePageComponent(
    `./Pages/${name}.tsx`,
    import.meta.glob('./Pages/**/*.tsx'),
)
```

### 3.3 Lazy Loading de Recharts
Los componentes de gráficos se importan dinámicamente para reducir el bundle inicial:

```typescript
const BarChart = lazy(() => import('recharts').then(module => ({ default: module.BarChart })));
```

### 3.4 Memoización
- `useMemo`: Para cálculos pesados que dependen de múltiples dependencias
- `useCallback`: Para funciones pasadas como props que no deben recrearse

### 3.5 Virtualización de Tablas
Para tablas con más de 50 elementos, se usa `react-window`:

```typescript
// VirtualTableContainer para más de 50 filas
const shouldVirtualize = items.length > 50;
```

### 3.6 Debounce en Filtros
Los filtros de búsqueda usan debounce de 300ms para evitar demasiadas peticiones:

```typescript
const debouncedSearch = useDebounce(searchTerm, 300);
```

## 4. Estado Global

### 4.1 Autenticación (Inertia Shared Props)
```typescript
// HandleInertiaRequests.php middleware
public function share(Request $request) {
    return array_merge(parent::share($request), [
        'auth' => [
            'user' => $request->user(),
        ],
    ]);
}

// Uso en componente
const user = usePage().props.auth.user;
```

### 4.2 Tema (CSS Variables + localStorage)
```typescript
// AuthenticatedLayout.tsx
const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

useEffect(() => {
    const root = window.document.documentElement;
    theme === 'dark' ? root.classList.add('dark') : root.classList.add('light');
    localStorage.setItem('theme', theme);
}, [theme]);
```

## 5. Modelos de Datos

### 5.1 Relaciones Eloquent
```
User (1) ─── (N) Client
Client (1) ─── (N) ClientContact
Client (1) ─── (N) ClientInteraction
Client (1) ─── (N) Quotation
Quotation (1) ─── (N) QuotationProduct
Quotation (1) ─── (N) QuotationItem
```

### 5.2 Modelos Principales

| Modelo | Descripción | Tabla |
|--------|-------------|-------|
| User | Usuarios autenticados | users |
| Client | Leads y clientes | clients |
| ClientContact | Contactos de cliente | client_contacts |
| ClientInteraction | Historial de interacciones | client_interactions |
| Quotation | Cotizaciones fotovoltaicas | quotations |
| QuotationProduct | Productos de cotización (snapshot) | quotation_products |
| QuotationItem | Ítems complementarios | quotation_items |
| Panel | Catálogo de paneles | panels |
| Inverter | Catálogo de inversores | inverters |
| Battery | Catálogo de baterías | batteries |

## 6. API Routes

### 6.1 Resource Controllers
```
GET    /clients           → clients.index
POST   /clients           → clients.store
GET    /clients/create    → clients.create
GET    /clients/{id}      → clients.show
GET    /clients/{id}/edit → clients.edit
PUT    /clients/{id}      → clients.update
DELETE /clients/{id}      → clients.destroy
```

### 6.2 Rutas de Cotizaciones
```
GET    /quotations              → quotations.index
POST   /quotations              → quotations.store
GET    /quotations/create       → quotations.create
GET    /quotations/{id}         → quotations.show
GET    /quotations/{id}/edit    → quotations.edit
PUT    /quotations/{id}         → quotations.update
DELETE /quotations/{id}         → quotations.destroy
```

### 6.3 Rutas de Suministros
```
GET    /panels              → panels.index
POST   /panels              → panels.store
GET    /panels/{id}         → panels.show
PUT    /panels/{id}         → panels.update
DELETE /panels/{id}         → panels.destroy
```

## 7. Optimizaciones de Rendimiento

### 7.1 Frontend
- Lazy loading de Recharts (~150KB)
- useMemo para cálculos de cotización
- useCallback para funciones de evento
- Debounce de 300ms en filtros
- Virtualización de tablas (>50 items)
- React.memo en componentes puros

### 7.2 Backend
- eager loading con `->with()` en controladores
- Índices en base de datos para filtros frecuentes
- SQLite para rápido acceso embebido

## 8. Hooks Personalizados

| Hook | Ubicación | Descripción |
|------|-----------|-------------|
| useDebounce | Hooks/useDebounce.ts | Retrasa actualización de valor |
| useAsync | Hooks/useAsync.ts | Manejo de estado async |
| useMediaQuery | Hooks/useMediaQuery.ts | Responsive breakpoints |

## 9. Componentes Reutilizables

| Componente | Descripción |
|------------|-------------|
| AuthenticatedLayout | Layout principal con sidebar |
| GuestLayout | Layout para páginas públicas |
| Modal | Modal con transiciones HeadlessUI |
| Dropdown | Menú desplegable |
| TextInput | Input con memoización |
| InputLabel | Label semántico |
| InputError | Mensaje de error |
| PrimaryButton | Botón principal |
| SecondaryButton | Botón secundario |
| DangerButton | Botón de peligro |
| Skeleton | Estados de carga |
| VirtualTable | Tabla virtualizada |
