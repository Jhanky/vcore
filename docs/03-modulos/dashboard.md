# Módulo Dashboard - Panel de Control

## 1. Descripción General

El Dashboard es el punto de entrada principal después de la autenticación. Muestra métricas clave del negocio, indicadores de rendimiento y actividad reciente.

## 2. Estructura Visual

### 2.1 Layout
```
┌─────────────────────────────────────────────────────────────┐
│                      AuthenticatedLayout                      │
├──────────┬──────────────────────────────────────────────────┤
│          │                    Header                         │
│          │  "Panel de Control"  [Settings]                   │
│  Sidebar ├──────────────────────────────────────────────────┤
│          │                                                  │
│  Logo    │   ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐         │
│  Nav     │   │ KPI  │ │ KPI  │ │ KPI  │ │ KPI  │         │
│  Items   │   └──────┘ └──────┘ └──────┘ └──────┘         │
│          │                                                  │
│  User    │   ┌────────────────────┐ ┌────────────┐         │
│  Info    │   │                    │ │            │         │
│          │   │   Gráfico          │ │  Actividad │         │
│  Theme   │   │   Rendimiento      │ │  Recent    │         │
│  Toggle  │   │   Fotovoltaico     │ │            │         │
│          │   │                    │ │            │         │
│  Logout  │   └────────────────────┘ └────────────┘         │
└──────────┴──────────────────────────────────────────────────┘
```

## 3. KPIs (Key Performance Indicators)

### 3.1 Tarjetas de Métricas
Cada tarjeta incluye:

| Métrica | Icono | Color | Descripción |
|---------|-------|-------|-------------|
| Proyectos Activos | Sun | Amber | Sistemas en ejecución |
| Nuevos Clientes | Users | Blue | Leads nuevos mes |
| Cotizaciones Mes | Calculator | Emerald | Cotizaciones generadas |
| Eficiencia Energética | TrendingUp | Purple | % mejora vs mes anterior |

### 3.2 Diseño de Tarjeta KPI
```tsx
<div className="glass p-6 rounded-3xl transition-all duration-300 group">
    <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-2xl bg-slate-500/10 ${stat.color}`}>
            <stat.icon className="h-6 w-6" />
        </div>
        <span className="text-xs font-bold text-[var(--text-secondary)] uppercase">
            Este Mes
        </span>
    </div>
    <h3 className="text-3xl font-bold text-[var(--text-primary)]">
        {stat.value}
    </h3>
    <p className="text-sm text-[var(--text-secondary)]">
        {stat.label}
    </p>
</div>
```

## 4. Gráfico de Rendimiento

### 4.1 Estado Actual
Placeholder con mensaje:
```
┌────────────────────────────────────────┐
│                                        │
│   "Gráfico de monitoreo en tiempo      │
│    real (Próximamente)"                │
│                                        │
│   [ Placeholder con borde punteado ]   │
│                                        │
└────────────────────────────────────────┘
```

### 4.2 Próximos Pasos
- Integración con datos reales de producción
- API de consumo energético
- Comparativas mensuales/anuales

## 5. Actividad Reciente

### 5.1 Lista de Actividades
- Máximo 4 items estáticos (placeholder)
- Estructura:
  - Icono (Sun dorado)
  - Descripción
  - Detalle (cliente + tiempo relativo)

### 5.2 Formato de Tiempo
Se muestra tiempo relativo:
- "Hace 2 horas"
- "Hace 3 días"
- "Ayer"

## 6. Optimizaciones Implementadas

### 6.1 Lazy Loading
El Dashboard se carga vía lazy loading de Inertia:
```typescript
// vite.config.js
resolve: (name) => resolvePageComponent(
    `./Pages/${name}.tsx`,
    import.meta.glob('./Pages/**/*.tsx'),
)
```

### 6.2 Transiciones
```css
.animate-fade-in {
    animation: fadeIn 0.5s ease-out forwards;
}
```

### 6.3 Responsive Design
- Grid adaptativo: 1 col → 2 cols → 4 cols
- Sidebar colapsable en móvil

## 7. Integración Futura

### 7.1 Datos Reales
Para mostrar datos reales se requiere:

1. **Endpoint de métricas**:
```php
Route::get('/dashboard/stats', function () {
    return [
        'active_projects' => Project::where('status', 'ejecucion')->count(),
        'new_clients' => Client::whereMonth('created_at', now())->count(),
        'quotations_this_month' => Quotation::whereMonth('created_at', now())->count(),
        'efficiency' => calculateEfficiency(),
    ];
});
```

2. **Widget de producción**:
- Fetch de datos de inversores conectados
- API de monitoring (Fronius, SolarEdge, etc.)
- Time series para gráfico de línea

3. **Notificaciones**:
- Live notifications con Laravel Echo
- WebSocket para actualizaciones en tiempo real

### 7.2 Posibles Gráficos
- Producción mensual (barras)
- Consumo vs Producción (área)
- Tendencia de leads (línea)
- Distribución por estado (pie)

## 8. Componentes Relacionados

| Componente | Descripción |
|------------|-------------|
| AuthenticatedLayout | Layout principal con sidebar |
| Glass | Utility de glassmorphism |
| SkeletonCard | Placeholder de carga para KPIs |

## 9. Rutas

```
GET /dashboard → Dashboard.tsx ( authenticated)
```

## 10. Estructura de Datos

```typescript
interface DashboardStats {
    activeProjects: number;
    newClients: number;
    quotationsThisMonth: number;
    energyEfficiency: string; // "+24%"
}

interface RecentActivity {
    id: string;
    type: 'quotation' | 'client' | 'project';
    description: string;
    detail: string;
    timestamp: Date;
}
```
