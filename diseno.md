---
name: diseno-vcore
description: |
  Sistema de diseño de Vcore / Energy 4.0. Define colores, tipografía, componentes UI y el patrón obligatorio para todas las páginas de listado (DataTable). 
  Úsalo cuando necesites crear o modificar páginas de listado con tabla, estadísticas, filtros y acciones CRUD. También cuando necesites conocer la paleta 
  de colores, tipografía o convenciones visuales del proyecto. NO lo uses para tareas no relacionadas con la UI de la aplicación.
---

# Sistema de Diseño — Vcore / Energy 4.0

CRM SaaS fotovoltaico con Laravel 13 + Inertia.js + React + Tailwind CSS.
Tema oscuro por defecto con `darkMode: 'class'`.

---

## 1. Paleta de Colores

Todos los colores se definen como **CSS Custom Properties** en `resources/css/app.css`.
**NO uses colores Tailwind directamente** (ej. `text-emerald-500`) a menos que sea para gradientes de tarjetas de estadísticas. Siempre prefiere `var(--...)` o las clases utilitarias.

### 1.1 Colores Primarios — Verdes Energy

| Variable CSS | Valor | Propósito |
|---|---|---|
| `--solar-gold` | `#548F4B` (verde) | **Color principal de la app** — botones primarios, enlaces activos, badges |
| `--solar-gold-hover` | `#476b3e` | Hover del color principal |
| `--verde-oscuro` | `#548F4B` | Clase `.bg-verde-oscuro` / `.text-verde-oscuro` |
| `--verde-medio` | `#7BBA4E` | PrimaryButton, clases `.bg-verde-medio` / `.text-verde-medio` |
| `--lima` | `#7BBA4E` | Sinónimo de `--verde-medio` |
| `--lima-claro` | `#BED641` | Clase `.bg-lima-claro` / `.text-lima-claro` |
| `--brand-primary` | `#548F4B` | Alias del verde oscuro |
| `--brand-primary-hover` | `#476b3e` | Hover del brand |

> **⚠ Importante**: Aunque la variable se llama `--solar-gold`, su valor es **verde** (`#548F4B`). En la paleta `solar` de Tailwind, `gold: '#F59E0B'` es el amarillo real, pero en las variables CSS `--solar-gold` apunta al verde. No confundir.

### 1.2 Tema (Dark por defecto)

| Variable CSS | Dark (`:root` / `.dark`) | Light (`.light`) |
|---|---|---|
| `--bg-main` | `#000000` | `#F8FAFC` |
| `--bg-content` | `#1E2021` | `#FFFFFF` |
| `--surface` | `rgba(30,32,33,0.8)` | `rgba(255,255,255,0.9)` |
| `--text-primary` | `#F8FAFC` | `#0F172A` |
| `--text-secondary` | `#A0AEB8` | `#475569` |
| `--border-ui` | `rgba(255,255,255,0.08)` | `rgba(15,23,42,0.1)` |

### 1.3 Colores de Acción y Estado

| Uso | Variable / Clase | Color |
|---|---|---|
| Hover ver/ver detalles | `hover:bg-[var(--solar-gold)]/10 hover:text-[var(--solar-gold)]` | Verde |
| Hover editar | `hover:bg-blue-500/10 hover:text-blue-400` | Azul |
| Hover eliminar/peligro | `hover:bg-red-500/10 hover:text-red-400` | Rojo |
| Badge de tipo | `bg-[var(--solar-gold)]/10 text-[var(--solar-gold)]` | Verde |
| Badge de estado borrador | `bg-slate-500/10 text-slate-400` | Gris |
| Badge de estado enviado | `bg-blue-500/10 text-blue-400` | Azul |
| Badge de estado aprobado | `bg-emerald-500/10 text-emerald-400` | Esmeralda |
| Badge de estado rechazado | `bg-red-500/10 text-red-400` | Rojo |
| Badge de estado vencido | `bg-amber-500/10 text-amber-400` | Ámbar |
| Variante danger (ConfirmModal) | `bg-red-500 hover:bg-red-600` | Rojo |
| Variante warning (ConfirmModal) | `bg-amber-500 hover:bg-amber-600` | Ámbar |
| Variante info (ConfirmModal) | `bg-blue-500 hover:bg-blue-600` | Azul |

### 1.4 Gradientes para Tarjetas de Estadísticas

Cada tarjeta usa un gradiente y color de icono distinto según su métrica:

| Métrica | Color icono | Gradiente bg |
|---|---|---|
| Total / Conteo | `text-blue-400` | `from-blue-500/20 to-blue-500/5` + `border-blue-500/20` |
| Energía / kWh | `text-emerald-400` | `from-emerald-500/20 to-emerald-500/5` + `border-emerald-500/20` |
| Promedio / Tendencia | `text-violet-400` | `from-violet-500/20 to-violet-500/5` + `border-violet-500/20` |
| Factura / Dinero | `text-[var(--solar-gold)]` | `from-[var(--solar-gold)]/20 to-[var(--solar-gold)]/5` + `border-[var(--solar-gold)]/20` |

---

## 2. Tipografía

| Uso | Familia | Clase |
|---|---|---|
| Cuerpo / texto general | Inter | `font-sans` (por defecto en `body`) |
| Títulos / encabezados | Space Grotesk | `font-outfit` o `font-display` + `tracking-tight` |
| Mono (números técnicos, precios) | JetBrains Mono | `font-mono` |

Body por defecto:
```css
body {
    font-family: 'Inter', sans-serif;
    @apply antialiased;
}
```

Títulos:
```css
h1, h2, h3, h4, .font-display {
    font-family: 'Space Grotesk', sans-serif;
    letter-spacing: -0.02em;
}
```

Patrón de título en página: Usar la prop `header` del `AuthenticatedLayout`:
```tsx
<AuthenticatedLayout header="Título de la Página">
```

---

## 3. Clases Utilitarias CSS

Definidas en `resources/css/app.css`.

| Clase | Efecto |
|---|---|
| `.glass` | Fondo `--surface` + `backdrop-filter: blur(16px)` + borde `--border-ui` + sombra |
| `.card-industrial` | Gradiente verde oscuro + `rounded-2xl` + sombra |
| `.solar-bar` | Barra degradada ámbar→naranja→rojo, 4px altura |
| `.animate-fade-in` | `opacity: 0 → 1` en 0.5s |
| `.animate-slide-up` | `opacity: 0; translateY(20px) → 0` en 0.3s |
| `.custom-scrollbar` | Scrollbar delgada (6px) con color `--border-ui` y hover `--brand-primary` |
| `bg-verde-oscuro/medio/lima/lima-claro` | Fondo con variables de verdes |
| `text-verde-oscuro/medio/lima/lima-claro` | Color de texto con variables de verdes |
| `border-verde-oscuro/medio/lima/lima-claro` | Borde con variables de verdes |

---

## 4. Componentes UI Compartidos

| Componente | Archivo | Propósito |
|---|---|---|
| `DataTable` | `resources/js/Components/DataTable.tsx` | Tabla genérica con búsqueda, filtros, paginación, skeleton |
| `ConfirmModal` | `resources/js/Components/ConfirmModal.tsx` | Modal de confirmación (danger/warning/info) |
| `Modal` | `resources/js/Components/Modal.tsx` | Modal genérico con Headless UI |
| `TextInput` | `resources/js/Components/TextInput.tsx` | Input de texto con ref forwarding |
| `NumberInput` | `resources/js/Components/NumberInput.tsx` | Input numérico con formato COP |
| `InputLabel` | `resources/js/Components/InputLabel.tsx` | Label con `font-outfit text-secondary` |
| `InputError` | `resources/js/Components/InputError.tsx` | Mensaje de error en rojo |
| `PrimaryButton` | `resources/js/Components/PrimaryButton.tsx` | Botón verde con framer-motion |
| `SecondaryButton` | `resources/js/Components/SecondaryButton.tsx` | Botón con borde y surface bg |
| `DangerButton` | `resources/js/Components/DangerButton.tsx` | Botón rojo de peligro |
| `Checkbox` | `resources/js/Components/Checkbox.tsx` | Checkbox estilizado |
| `Dropdown` | `resources/js/Components/Dropdown.tsx` | Menú desplegable con Headless UI |
| `Toast` | `resources/js/Components/Toast.tsx` | Notificaciones toast con 4 variantes |
| `Spinner` | `resources/js/Components/Spinner.tsx` | Loader animado |
| `cn()` | `resources/js/utils/cn.ts` | Merge de clases Tailwind (`clsx` + `twMerge`) |

---

## 5. Patrón de Página de Listado (DataTable)

**TODAS las páginas de listado** deben seguir EXACTAMENTE este patrón para mantener consistencia visual y funcional. Los archivos de referencia son:
- `resources/js/Pages/Clients/Index.tsx` (con selección múltiple)
- `resources/js/Pages/Quotations/Index.tsx` (patrón simple)
- `resources/js/Pages/Supplies/Index.tsx` (con tabs)

### 5.1 Estructura completa del archivo

```tsx
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { Plus, Eye, Pencil, Trash2 } from 'lucide-react';
import { useState, useCallback } from 'react';
import { DataTable, Column, FilterOption } from '@/Components/DataTable';
import ConfirmModal from '@/Components/ConfirmModal';
import { showToast } from '@/Components/Toast';

interface Props {
    items: any; // Paginated response from Laravel
    filters: {
        search?: string;
        // otros filtros...
    };
    statistics?: {
        total: number;
        // otras estadísticas...
    };
}

export default function Index({ items, filters, statistics }: Props) {
    const [isLoading, setIsLoading] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<{ id: number } | null>(null);
    const [deleting, setDeleting] = useState(false);

    // ── Handlers de navegación (server-side) ──

    const handleSearch = useCallback((search: string) => {
        setIsLoading(true);
        router.get(
            route('modulo.index'),
            { search, per_page: items.per_page },
            { preserveState: true, replace: true, onFinish: () => setIsLoading(false) }
        );
    }, [items.per_page]);

    const handlePerPageChange = useCallback((perPage: number) => {
        setIsLoading(true);
        router.get(
            route('modulo.index'),
            { search: filters.search, per_page: perPage },
            { preserveState: true, replace: true, onFinish: () => setIsLoading(false) }
        );
    }, [filters.search]);

    const handleFilterChange = useCallback((key: string, value: string) => {
        setIsLoading(true);
        router.get(
            route('modulo.index'),
            { search: filters.search, [key]: value || undefined, per_page: items.per_page },
            { preserveState: true, replace: true, onFinish: () => setIsLoading(false) }
        );
    }, [filters.search, items.per_page]);

    // ── Handlers de eliminación ──

    const confirmDelete = (id: number) => {
        setDeleteTarget({ id });
        setShowDeleteModal(true);
    };

    const handleDelete = () => {
        if (!deleteTarget) return;
        setDeleting(true);
        router.delete(route('modulo.destroy', deleteTarget.id), {
            preserveScroll: true,
            onSuccess: () => {
                setShowDeleteModal(false);
                setDeleting(false);
                showToast('Elemento eliminado exitosamente', 'success');
            },
            onError: () => setDeleting(false),
        });
    };

    // ── Definición de columnas ──

    const columns: Column<any>[] = [
        {
            key: 'name',
            label: 'Nombre',
            render: (item) => (
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-[var(--solar-gold)]/20 to-[var(--solar-gold)]/5 flex items-center justify-center border border-[var(--solar-gold)]/20 text-[var(--solar-gold)] font-bold text-xl font-outfit">
                        {item.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <div className="font-bold text-[var(--text-primary)] text-lg">{item.name}</div>
                        <div className="text-xs text-[var(--text-secondary)]">{item.subtitle}</div>
                    </div>
                </div>
            ),
        },
        // Más columnas...
    ];

    // ── Acciones por fila (obligatorio: view, edit, delete) ──

    const renderActions = (item: any) => (
        <div className="flex items-center gap-1">
            <Link
                href={route('modulo.show', item.id)}
                className="inline-flex p-2 rounded-xl hover:bg-[var(--solar-gold)]/10 text-[var(--text-secondary)] hover:text-[var(--solar-gold)] transition-all"
                title="Ver detalles"
            >
                <Eye className="h-5 w-5" />
            </Link>
            <Link
                href={route('modulo.edit', item.id)}
                className="inline-flex p-2 rounded-xl hover:bg-blue-500/10 text-[var(--text-secondary)] hover:text-blue-400 transition-all"
                title="Editar"
            >
                <Pencil className="h-5 w-5" />
            </Link>
            <button
                onClick={() => confirmDelete(item.id)}
                className="inline-flex p-2 rounded-xl hover:bg-red-500/10 text-[var(--text-secondary)] hover:text-red-400 transition-all"
                title="Eliminar"
            >
                <Trash2 className="h-5 w-5" />
            </button>
        </div>
    );

    // ── Render ──

    return (
        <AuthenticatedLayout header="Título">
            <Head title="Título" />

            {/* Estadísticas (grid 4 columnas) — opcional pero recomendado */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
                <div className="glass rounded-2xl p-6 border border-[var(--border-ui)]/30 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-500/5 border border-blue-500/20 flex items-center justify-center flex-shrink-0">
                        <Users className="w-6 h-6 text-blue-400" />
                    </div>
                    <div>
                        <p className="text-xs text-[var(--text-secondary)] uppercase tracking-wider">Total</p>
                        <p className="text-xl font-bold font-outfit text-blue-400">{statistics.total}</p>
                    </div>
                </div>
                {/* Repetir para cada métrica con su color correspondiente (ver sección 1.4) */}
            </div>

            {/* DataTable */}
            <DataTable
                data={items.data}
                columns={columns}
                searchPlaceholder="Buscar..."
                emptyMessage="No se encontraron elementos"
                pagination={items}
                loading={isLoading}
                onSearch={handleSearch}
                onFilterChange={handleFilterChange}
                onPerPageChange={handlePerPageChange}
                actions={renderActions}
                headerAction={
                    <Link
                        href={route('modulo.create')}
                        className="flex items-center gap-2 bg-[var(--solar-gold)] text-slate-900 font-bold px-5 py-2.5 rounded-xl hover:brightness-110 transition-all shadow-lg"
                    >
                        <Plus className="h-4 w-4" />
                        <span>Nuevo Elemento</span>
                    </Link>
                }
            />

            {/* Modal de confirmación */}
            <ConfirmModal
                show={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={handleDelete}
                title="Eliminar elemento"
                message="¿Está seguro de eliminar este elemento? Esta acción no se puede deshacer."
                confirmLabel="Eliminar"
                variant="danger"
                processing={deleting}
            />
        </AuthenticatedLayout>
    );
}
```

### 5.2 Selección Múltiple (opcional)

Si el módulo necesita selección múltiple con borrado masivo, agregar:

```tsx
const [selectedIds, setSelectedIds] = useState<number[]>([]);

const allSelected = selectedIds.length === items.data.length && items.data.length > 0;
const someSelected = selectedIds.length > 0 && selectedIds.length < items.data.length;

const toggleSelectAll = () => {
    if (allSelected) setSelectedIds([]);
    else setSelectedIds(items.data.map((c: any) => c.id));
};

const toggleSelect = (id: number) => {
    setSelectedIds(prev =>
        prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
};
```

Columna checkbox en el DataTable:
```tsx
{
    key: 'checkbox',
    label: '',
    render: (item) => (
        <input
            type="checkbox"
            className="w-4 h-4 rounded border-[var(--border-ui)] text-[var(--solar-gold)] focus:ring-[var(--solar-gold)]/20 bg-transparent cursor-pointer"
            checked={selectedIds.includes(item.id)}
            onChange={() => toggleSelect(item.id)}
        />
    ),
},
```

Barra flotante de selección:
```tsx
{selectedIds.length > 0 && (
    <div className="mb-4 p-4 glass rounded-2xl flex items-center justify-between">
        <span className="text-sm font-bold text-[var(--text-primary)]">
            {selectedIds.length} elemento(s) seleccionado(s)
        </span>
        <button
            onClick={() => confirmDeleteBulk()}
            className="inline-flex items-center gap-2 bg-red-500/10 text-red-400 font-bold px-4 py-2 rounded-xl hover:bg-red-500/20 transition-all"
        >
            <Trash2 className="h-4 w-4" />
            Eliminar seleccionados
        </button>
    </div>
)}
```

### 5.3 Filtros Comunes

Filtro tipo `select`:
```tsx
filters={[{
    key: 'status',
    label: 'Estado',
    options: [
        { value: 'activo', label: 'Activo' },
        { value: 'inactivo', label: 'Inactivo' },
    ],
}]}
```

Filtro tipo `range`:
```tsx
filters={[{
    key: 'amount',
    label: 'Rango',
    type: 'range',
}]}
```

---

## 6. Patrón de Backend (Controller)

```php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\TuModelo;

class TuModeloController extends Controller
{
    public function index(Request $request)
    {
        $query = TuModelo::query()->with(['relaciones']);

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Filtros de rango
        if ($request->filled('amount_min')) {
            $query->where('amount', '>=', $request->amount_min);
        }
        if ($request->filled('amount_max')) {
            $query->where('amount', '<=', $request->amount_max);
        }

        $perPage = $request->input('per_page', 10);

        // Si per_page es -1, traer todos (opcional)
        if ($perPage === '-1') {
            $items = $query->orderBy('id', 'desc')->get();
            // Convertir a paginador manual para mantener interfaz consistente
            $items = new \Illuminate\Pagination\LengthAwarePaginator(
                $items, count($items), count($items), 1
            );
        } else {
            $items = $query->orderBy('id', 'desc')->paginate($perPage);
        }

        $items->withQueryString();

        return inertia('Modulo/Index', [
            'items' => $items,
            'filters' => $request->only(['search', 'status', 'amount_min', 'amount_max', 'per_page']),
            'statistics' => [
                'total' => TuModelo::count(),
                // otras estadísticas...
            ],
        ]);
    }
}
```

---

## 7. Reglas de Consistencia

### 7.1 Iconos (Lucide React)
- Los iconos se importan por nombre directamente desde `lucide-react` (no como objeto).
- Preferir iconos de 16-20px (`h-4 w-4` a `h-5 w-5`) para acciones inline.
- Iconos de 24px (`h-6 w-6`) para tarjetas de estadísticas.

### 7.2 Formato de Moneda
- Usar `toLocaleString('es-CO')` para formato colombiano (puntos como separador de miles).
- Prefijo `$` antes del valor.
- Valores nulos/missing: mostrar `$0` con fallback.

### 7.3 Formato de Fechas
- `new Date(dateStr + 'T00:00:00').toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })`
- Fechas nulas: mostrar `–` (guión).

### 7.4 Estados Vacíos
```tsx
{
    filteredData.length === 0 ? (
        <div className="flex flex-col items-center gap-2 p-12">
            <Search className="h-8 w-8 opacity-20" />
            <span className="font-medium text-[var(--text-secondary)]">{emptyMessage}</span>
        </div>
    ) : ...
}
```

### 7.5 Loading / Skeleton
El DataTable ya incluye skeleton loading automático con 5 filas `animate-pulse`. Solo hay que pasar `loading={isLoading}`.

### 7.6 Bordes y Esquinas
| Elemento | Border radius |
|---|---|
| Cards / tablas | `rounded-2xl` |
| Contenedores grandes (DataTable) | `rounded-[2rem]` |
| Badges / tags | `rounded-lg` o `rounded-full` |
| Inputs / selects | `rounded-2xl` |
| Botones de acción (iconos) | `rounded-xl` |
| Botones primarios | `rounded-xl` |
| Checkbox | `rounded` (no `rounded-lg`) |

### 7.7 Paleta de Badges de Estado
```tsx
const STATUS_STYLES: Record<string, string> = {
    'Borrador'  : 'bg-slate-500/10 text-slate-400 border-slate-500/20',
    'activo'    : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    'inactivo'  : 'bg-slate-500/10 text-slate-400 border-slate-500/20',
    'pendiente' : 'bg-amber-500/10 text-amber-400 border-amber-500/20',
};
```

Uso: `<span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border {clase}">{status}</span>`

---

## 8. Animación de Página

Todas las páginas envueltas en `AuthenticatedLayout` ya tienen animación de entrada via `framer-motion`:
```tsx
<motion.div
    key={route().current()}
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    transition={{ duration: 0.3 }}
>
    {children}
</motion.div>
```

No agregar animaciones adicionales de página.

---

## 9. Ejemplos en el Código Base

| Módulo | Archivo | Particularidad |
|---|---|---|
| Clientes | `resources/js/Pages/Clients/Index.tsx` | Selección múltiple, filtro de rango, avatar con inicial |
| Cotizaciones | `resources/js/Pages/Quotations/Index.tsx` | Badges de estado, formato COP, sin selección múltiple |
| Suministros | `resources/js/Pages/Supplies/Index.tsx` | Tabs, edición inline via modal, columnas dinámicas |
