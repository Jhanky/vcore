# Módulo Cotizaciones - Calculadora Fotovoltaica

## 1. Descripción General

El módulo de Cotizaciones permite configurar y calcular sistemas fotovoltaicos con un flujo de 4 pasos. Genera automáticamente código de cotización (COT-YYYY-NNNN), calcula dimensiones de paneles/inversores/baterías, y produce un resumen financiero completo con porcentajes de utilidad, administración e impuestos.

## 2. Modelo de Datos

### 2.1 Quotation
```php
class Quotation extends Model
{
    protected $fillable = [
        'client_id',                         // FK a Client
        'user_id',                           // FK a User (asesor)
        'quotation_number',                   // COT-2026-0001
        'project_name',                      // Nombre del proyecto
        'system_type',                       // On-grid|Off-grid|Híbrido
        'network_type',                      // monofasico|bifasico_220|trifasico_220|trifasico_440
        'power_kwp',                         // Potencia objetivo kWp
        'requires_financing',                 // boolean
        'status',                            // Borrador|Enviada|Aprobada|Rechazada

        // Porcentajes de cálculo
        'profit_percentage',                 // 8%
        'iva_profit_percentage',             // 19%
        'commercial_management_percentage',  // 2%
        'administration_percentage',         // 8%
        'contingency_percentage',            // 3%
        'withholding_percentage',            // 2.5%

        // Totales calculados
        'subtotal',
        'commercial_management_amount',
        'subtotal_2',
        'administration_amount',
        'contingency_amount',
        'profit_amount',
        'iva_profit_amount',
        'subtotal_3',
        'withholding_amount',
        'total',
    ];

    // Relaciones
    public function client()         → belongsTo(Client)
    public function user()           → belongsTo(User)
    public function products()       → hasMany(QuotationProduct)
    public function items()          → hasMany(QuotationItem)
}
```

### 2.2 QuotationProduct (Snapshot de productos)
```php
class QuotationProduct extends Model
{
    protected $fillable = [
        'quotation_id',               // FK a Quotation
        'product_type',               // panel|inverter|battery
        'product_id',                 // ID del producto en catálogo
        'quantity',                   // Cantidad
        'unit_price_cop',             // Precio unitario COP
        'profit_percentage',          // % profit (snapshot)
    ];
}
```

### 2.3 QuotationItem (Ítems complementarios)
```php
class QuotationItem extends Model
{
    protected $fillable = [
        'quotation_id',               // FK a Quotation
        'description',                // Descripción del ítem
        'category',                   // material|mano_obra|servicio
        'quantity',                   // Cantidad
        'unit_measure',               // und|kW|m|global|panel|trámite
        'unit_price_cop',             // Precio unitario COP
        'profit_percentage',          // % profit
    ];
}
```

## 3. Flujo de 4 Pasos

### Paso 1: Información General
- Selección de cliente (con sugerencia de kWp según consumo)
- Nombre del proyecto
- Tipo de sistema (On-grid, Off-grid, Híbrido)
- Tipo de red (Monofásico, Bifásico 220, Trifásico 220, Trifásico 440)
- Potencia objetivo (kWp)
- Opción de financiamiento

### Paso 2: Suministros
- **Panel Solar**: Selección de modelo + cantidad automática
- **Inversor**: Filtrado por tipo de sistema + cantidad automática
- **Batería**: Solo para Off-grid/Híbrido
- **Análisis del Sistema** (cuando hay paneles + inversor):
  - DC/AC Ratio con gráfico de barras
  - Alerts de configuración
  - Producción mensual/ anual estimada
  - Gráfico de producción por mes

### Paso 3: Ítems Complementarios
- Lista de ítems por defecto:
  - Mano de obra instalación (375,000 COP/kW, 15% profit)
  - Material eléctrico (345,000 COP/kW, 15% profit)
  - Estructura de soporte (130,000 COP/panel, 15% profit)
  - Trámites y permisos (7,000,000 COP global, 10% profit)
- Agregar/eliminar ítems personalizados
- Categorías: material, mano_obra, servicio

### Paso 4: Porcentajes y Resumen
- Ajustes de porcentajes:
  - Utilidad (8%)
  - IVA sobre Utilidad (19%)
  - Gestión Comercial (2%)
  - Administración (8%)
  - Imprevistos (3%)
  - Retenciones (2.5%)
- Resumen financiero completo

## 4. Cálculo de Dimensionamiento

### 4.1 Paneles
```typescript
// Cálculo de cantidad de paneles
const autoQty = Math.ceil((powerKwp * 1000) / panelPowerWp);
```

### 4.2 Inversor
```typescript
// Ratio DC/AC recomendado: 1.1 - 1.3
// Cantidad inversores
const autoQty = Math.ceil(powerKwp / (inverterPowerKw * 1.3));
```

### 4.3 Batería (Off-grid/Híbrido)
Selección manual sin auto-cálculo.

## 5. Cálculo Financiero

### Fórmula de Totales
```typescript
function calcTotals(products, items, pcts) {
    // Subtotal (suministros + items con profit)
    let sub = 0;
    [...products, ...items].forEach(r => {
        const cost = r.quantity * r.unit_price_cop;
        sub += cost * (1 + r.profit_percentage);
    });

    // Gestión Comercial
    const cm = sub * pcts.commercial_management_percentage;
    const s2 = sub + cm;

    // Cargos adicionales
    const adm = s2 * pcts.administration_percentage;
    const cnt = s2 * pcts.contingency_percentage;
    const prf = s2 * pcts.profit_percentage;
    const piv = prf * pcts.iva_profit_percentage;
    const s3 = s2 + adm + cnt + prf + piv;

    // Retenciones
    const wh = s3 * pcts.withholding_percentage;
    const total = s3 + wh;

    return { sub, cm, s2, adm, cnt, prf, piv, s3, wh, total };
}
```

## 6. Análisis DC/AC Ratio

### Rangos
| Ratio | Estado | Color | Descripción |
|-------|--------|-------|-------------|
| < 0.8 | Sub | Amarillo | Inversor subdimensionado |
| 0.8 - 1.3 | Óptimo | Verde | Configuración ideal |
| > 1.3 | Sobre | Rojo | Exceso de paneles |

### Alertas
El sistema genera alertas automáticas:
- Ratio DC/AC > 1.5: "Exceso de paneles puede saturar el inversor"
- Ratio DC/AC > 1.3: "Ratio en límite superior"
- Ratio DC/AC < 0.8: "Inversor subdimensionado"
- Potencia instalada > 15% del objetivo
- Potencia instalada < 85% del objetivo

## 7. Producción Estimada

### HSP (Horas de Sol Pico) - Colombia
```typescript
const hspByMonth = [3.8, 4.0, 4.2, 4.3, 4.1, 3.9, 3.8, 4.0, 4.2, 4.4, 4.1, 3.9];
const avgHsp = hspByMonth.reduce((a, b) => a + b) / 12; // ~4.1
```

### Producción Mensual
```typescript
const monthlyKwh = totalPanelKw * hsp * 30; // 30 días
```

### Producción Anual
```typescript
const annualKwh = monthlyProduction.reduce((sum, m) => sum + m.kwh, 0);
```

## 8. Vistas

### Quotations/Form.tsx
Formulario de 4 pasos con:
- Lazy loading de Recharts (Suspense fallback)
- useMemo para calcTotals y buildProducts
- useCallback para funciones de evento
- Auto-dimensionamiento al seleccionar productos
- Gráfico de barras para DC/AC Ratio
- Gráfico de producción mensual (línea/barras)

### Quotations/Index.tsx
Lista de cotizaciones con filtros y paginación.

## 9. Rutas

```
GET    /quotations              → quotations.index   (Lista)
POST   /quotations              → quotations.store   (Crear)
GET    /quotations/create       → quotations.create  (Form nuevo)
GET    /quotations/{id}         → quotations.show    (Ver)
GET    /quotations/{id}/edit    → quotations.edit    (Editar)
PUT    /quotations/{id}         → quotations.update   (Actualizar)
DELETE /quotations/{id}         → quotations.destroy  (Eliminar)
```

## 10. Integración IA

El módulo puede usar Laravel AI SDK para análisis:
- Análisis de configuración recomendada
- Sugerencias de optimización
- Comparación con proyectos similares

## 11. Estados de Cotización

| Estado | Descripción | Color |
|--------|-------------|-------|
| Borrador | Cotización en progreso | Gris |
| Enviada | Enviada al cliente | Azul |
| Aprobada | Aceptada por el cliente | Verde |
| Rechazada | Rechazada | Rojo |

## 12. Optimizaciones Implementadas

### Lazy Loading
```typescript
const BarChart = lazy(() => import('recharts').then(module => ({ default: module.BarChart })));
const Bar = lazy(() => import('recharts').then(module => ({ default: module.Bar })));
// ... otros componentes de recharts
```

### Memoización
```typescript
const buildProducts = useCallback((): QuotationProduct[] => {
    // ... cálculo memoizado
}, [data.panel_id, data.panel_qty, ...]);

const totals = useMemo(() => calcTotals(buildProducts(), data.items, data), [buildProducts, data.items, data]);
```

### Suspense Boundaries
```tsx
<Suspense fallback={<div className="animate-pulse"><div className="h-48 bg-slate-700/30 rounded-xl"></div></div>}>
    {/* Gráficos de Recharts */}
</Suspense>
```
