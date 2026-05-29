# Módulo Suministros - Catálogo Técnico

## 1. Descripción General

El módulo de Suministros gestiona el catálogo de componentes fotovoltaicos: paneles solares, inversores y baterías. Alimenta la calculadora de cotizaciones y permite control de costos y especificaciones técnicas.

## 2. Modelos de Datos

### 2.1 Panel
```php
class Panel extends Model
{
    protected $fillable = [
        'brand',             // Marca (ej: LONGi, JA Solar)
        'model',             // Modelo (ej: LR5-545HPH)
        'power',             // Potencia en Wp (ej: 545)
        'price',            // Precio unitario COP
        'datasheet_url',    // URL a ficha técnica PDF
        'is_active',        // Activo/Inactivo
    ];
}
```

### 2.2 Inverter
```php
class Inverter extends Model
{
    protected $fillable = [
        'brand',             // Marca
        'model',             // Modelo
        'power',             // Potencia en kW
        'system_type',      // On-grid|Off-grid|Híbrido
        'grid_type',        // monofasico|bifasico_220|trifasico_220|trifasico_440
        'price',            // Precio unitario COP
        'datasheet_url',    // URL a ficha técnica
        'is_active',        // Activo/Inactivo
    ];
}
```

### 2.3 Battery
```php
class Battery extends Model
{
    protected $fillable = [
        'brand',             // Marca
        'model',             // Modelo
        'capacity',         // Capacidad en Ah
        'voltage',          // Voltaje en V
        'type',             // Gel|Litio|Otro
        'price',            // Precio unitario COP
        'datasheet_url',    // URL a ficha técnica
        'is_active',        // Activo/Inactivo
    ];
}
```

## 3. Características por Tipo

### 3.1 Paneles Solares
| Campo | Descripción | Ejemplo |
|-------|-------------|---------|
| Marca | Fabricante | LONGi, JA Solar, Trina |
| Modelo | Identificador | LR5-545HPH-550M |
| Potencia | Wp del panel | 545 - 550 Wp |
| Precio | COP sin puntos | 2500000 |

### 3.2 Inversores
| Campo | Descripción | Ejemplo |
|-------|-------------|---------|
| Marca | Fabricante | Huawei, SMA, Growatt |
| Modelo | Identificador | SUN2000-8KTL |
| Potencia | kW del inversor | 8 kW |
| Tipo Sistema | Compatibilidad | On-grid, Off-grid, Híbrido |
| Tipo Red | Conexión eléctrica | Monofásico, Trifásico 220V |
| Precio | COP sin puntos | 12000000 |

### 3.3 Baterías
| Campo | Descripción | Ejemplo |
|-------|-------------|---------|
| Marca | Fabricante | Pylontech, BYD |
| Modelo | Identificador | US5000 |
| Capacidad | Ah | 100 Ah |
| Voltaje | V | 48V |
| Tipo | Tecnología | Gel, Litio |
| Precio | COP sin puntos | 8500000 |

## 4. Vista Principal (Supplies/Index.tsx)

### 4.1 Pestañas
```
┌────────────┬────────────┬────────────┐
│  Paneles   │ Inversores │  Baterías  │
│   (Zap)    │   (Cpu)   │  (Battery)│
└────────────┴────────────┴────────────┘
```

### 4.2 Filtros
- **Búsqueda**: Por marca o modelo (debounced 300ms)
- **Filtro de Potencia**: Depende del tipo:
  - Paneles: Wp
  - Inversores: kW
  - Baterías: Ah
- **Filtros específicos**:
  - Inversores: Tipo sistema, Tipo red
  - Baterías: Tipo (Gel, Litio)

### 4.3 Tabla de Datos
| Columna | Paneles | Inversores | Baterías |
|---------|---------|------------|----------|
| Marca/Modelo | ✓ | ✓ | ✓ |
| Potencia | Wp | kW | Ah/V |
| Sistema/Red | - | ✓ | - |
| Tipo | - | - | ✓ |
| Precio | ✓ | ✓ | ✓ |
| Ficha Técnica | ✓ | ✓ | ✓ |
| Acciones | ✓ | ✓ | ✓ |

## 5. Modal de Formulario

### 5.1 PanelFormModal.tsx
Campos:
- Marca (texto)
- Modelo (texto)
- Potencia Wp (número)
- Precio (número)
- Ficha técnica (upload PDF)
- Activo (checkbox)

### 5.2 InverterFormModal.tsx
Campos:
- Marca, Modelo, Potencia kW, Precio
- Tipo sistema (select)
- Tipo red (select)
- Ficha técnica (upload PDF)
- Activo (checkbox)

### 5.3 BatteryFormModal.tsx
Campos:
- Marca, Modelo, Capacidad Ah, Voltaje V
- Tipo (select: Gel, Litio, Otro)
- Precio
- Ficha técnica (upload PDF)
- Activo (checkbox)

## 6. Optimizaciones Implementadas

### 6.1 Virtualización
```typescript
// Supplies/Index.tsx
const shouldVirtualize = currentItems.length > 50;
{shouldVirtualize ? (
    <VirtualTableContainer items={currentItems} ... />
) : (
    <div className="glass rounded-[2rem]">...</div>
)}
```

### 6.2 Debounce en Filtros
```typescript
const debouncedSearch = useDebounce(searchTerm, 300);
const debouncedPower = useDebounce(powerFilter, 300);
const debouncedSystemType = useDebounce(systemTypeFilter, 300);
```

### 6.3 Memoización del Filtrado
```typescript
const currentItems = useMemo(() => {
    let items = activeTab === 'panels' ? panels : ...;
    return items.filter((item: any) => {
        const matchesSearch = !debouncedSearch || ...;
        // ... más filtros
    });
}, [activeTab, panels, inverters, batteries, debouncedSearch, ...]);
```

### 6.4 useCallback para Handlers
```typescript
const openEdit = useCallback((item: any, type: ...) => {
    // handler memoizado
}, []);

const handleDelete = useCallback((id: number, type: ...) => {
    // handler memoizado
}, []);
```

## 7. Integración con Cotizaciones

### 7.1 Auto-selecciópn de Productos
En Quotations/Form, al seleccionar un panel se calcula automáticamente la cantidad:

```typescript
const onSelectSupply = (type: 'panel', id: string) => {
    const panel = panels.find(p => p.id === id);
    const autoQty = Math.ceil((powerKwp * 1000) / panel.power);
    setData({ panel_id: id, panel_qty: autoQty });
};
```

### 7.2 Snapshot en Cotización
Los productos se almacenan como snapshot en QuotationProduct:
- Precio en el momento de la cotización
- Cantidadfinal
- Profit percentage

## 8. Rutas

```
# Paneles
GET    /panels              → panels.index
POST   /panels              → panels.store
GET    /panels/{id}         → panels.show
PUT    /panels/{id}         → panels.update
DELETE /panels/{id}         → panels.destroy

# Inversores
GET    /inverters              → inverters.index
POST   /inverters              → inverters.store
GET    /inverters/{id}         → inverters.show
PUT    /inverters/{id}         → inverters.update
DELETE /inverters/{id}         → inverters.destroy

# Baterías
GET    /batteries              → batteries.index
POST   /batteries              → batteries.store
GET    /batteries/{id}         → batteries.show
PUT    /batteries/{id}         → batteries.update
DELETE /batteries/{id}         → batteries.destroy

# Vista unificada
GET    /supplies              → supplies.index (redirects to panels)
```

## 9. Componentes Relacionados

| Componente | Descripción |
|------------|-------------|
| PanelFormModal | Modal CRUD paneles |
| InverterFormModal | Modal CRUD inversores |
| BatteryFormModal | Modal CRUD baterías |
| VirtualTable | Tabla virtualizada |
| SkeletonTable | Estado de carga |

## 10. Fórmulas de Dimensionamiento

### Paneles necesarios
```
n_paneles = (potencia_kwp × 1000) / potencia_panel_wpm
```

### Inversores recomendados
```
n_inversores = potencia_kwp / (potencia_inversor_kw × 1.3)
```
Factor 1.3 asegura ratio DC/AC ideal de 1.1-1.3

## 11. Indicadores de Ficha Técnica

| Estado | Icono | Descripción |
|--------|-------|-------------|
| Con URL | FileText | Enlace a PDF funcional |
| Sin URL | AlertCircle | Sin ficha disponible |
