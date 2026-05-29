# Cotización — Rediseño con 3 Pestañas

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactorizar la página de detalles de cotización (Show.tsx) de un layout de dos columnas a una sola columna con 3 pestañas: Financiera, Técnica y Estados con timeline animado.

**Architecture:** Extraer las secciones actuales en 3 componentes de pestaña. Show.tsx se convierte en un orquestador con header de acciones y navegación de tabs. Cada pestaña es independiente y reutilizable.

**Tech Stack:** React + Inertia + TypeScript + Tailwind CSS

---

## File Structure

```
resources/js/
├── Components/Quotations/
│   ├── FinancialTab.tsx      (nuevo)
│   ├── TechnicalTab.tsx      (nuevo)
│   └── StatesTab.tsx         (nuevo)
└── Pages/Quotations/
    └── Show.tsx              (refactorizar — quitar ~800 líneas)
```

---

### Task 1: Crear esqueleto de FinancialTab.tsx

**Files:**
- Create: `resources/js/Components/Quotations/FinancialTab.tsx`

- [ ] **Step 1: Crear archivo con estructura base**

```tsx
import { Calculator } from 'lucide-react';

interface FinancialTabProps {
  localData: any;
  totals: any;
  editingCell: any;
  setEditingCell: any;
  handleChange: any;
  quotation: any;
}

export default function FinancialTab({ localData, totals, editingCell, setEditingCell, handleChange, quotation }: FinancialTabProps) {
  const fmt = (v: number) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(v || 0);

  return (
    <div className="space-y-6">
      <div className="glass rounded-2xl border border-[var(--solar-gold)]/20 overflow-hidden">
        <div className="bg-[var(--solar-gold)]/10 p-6 border-b border-[var(--solar-gold)]/20">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Calculator className="w-5 h-5" />
            Resumen Financiero
          </h2>
        </div>
        <div className="p-6 space-y-4">
          {/* Totales AUI — se migrarán del Show.tsx lines 986-1056 */}
          <p className="text-sm text-[var(--text-secondary)]">Contenido financiero...</p>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add resources/js/Components/Quotations/FinancialTab.tsx
git commit -m "feat(quotation): crear esqueleto FinancialTab"
```

---

### Task 2: Completar FinancialTab.tsx

**Files:**
- Modify: `resources/js/Components/Quotations/FinancialTab.tsx`

- [ ] **Step 1: Copiar la sección de Resumen Financiero (lines 978-1057 de Show.tsx)**

Migrar todo el bloque del sidebar derecho "Resumen Financiero AUI" a FinancialTab.tsx. El componente recibe `localData`, `totals`, `editingCell`, `setEditingCell`, `handleChange` y `quotation` como props.

Mantener el mismo diseño visual (glass card con borde dorado, misma tipografía, mismos cálculos).

- [ ] **Step 2: Verificar que el formateador fmt esté disponible**

```tsx
const fmt = (v: number) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(v || 0);
```

- [ ] **Step 3: Commit**

```bash
git add resources/js/Components/Quotations/FinancialTab.tsx
git commit -m "feat(quotation): completar FinancialTab con resumen AUI"
```

---

### Task 3: Crear esqueleto de TechnicalTab.tsx

**Files:**
- Create: `resources/js/Components/Quotations/TechnicalTab.tsx`

- [ ] **Step 1: Crear archivo con estructura base**

```tsx
import { FileText, Sun, Cpu, Battery, Wrench, Zap, Activity, TrendingUp, TrendingDown, Info, Box, Wallet } from 'lucide-react';

interface TechnicalTabProps {
  localData: any;
  setLocalData: any;
  editingInfo: boolean;
  setEditingInfo: any;
  editingCell: any;
  setEditingCell: any;
  handleChange: any;
  openProductModal: any;
  openAddProductModal: any;
  catalogPanels: any;
  catalogInverters: any;
  catalogBatteries: any;
  quotation: any;
  overdimensioning: any;
  specs: any;
}

export default function TechnicalTab(props: TechnicalTabProps) {
  return (
    <div className="space-y-6">
      {/* Información General */}
      <p className="text-sm text-[var(--text-secondary)]">Contenido técnico...</p>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add resources/js/Components/Quotations/TechnicalTab.tsx
git commit -m "feat(quotation): crear esqueleto TechnicalTab"
```

---

### Task 4: Completar TechnicalTab.tsx

**Files:**
- Modify: `resources/js/Components/Quotations/TechnicalTab.tsx`

- [ ] **Step 1: Migrar secciones desde Show.tsx**

Migrar en orden:
1. **Alerts** (lines 512-568): sobre / subdimensionamiento
2. **Información General** (lines 570-686): cliente, sistema, editable
3. **Suministros (Productos)** (lines 688-784): tabla editable
4. **Ítems Complementarios** (lines 786-841): tabla editable
5. **Especificaciones Técnicas** (lines 843-972): métricas, ratio, producción

Cada sección usa `sectionCls = "glass rounded-2xl p-6 md:p-8 space-y-6"`.

- [ ] **Step 2: Ajustar referencias de props**

Todos los `editingCell` → `props.editingCell`, etc.

- [ ] **Step 3: Commit**

```bash
git add resources/js/Components/Quotations/TechnicalTab.tsx
git commit -m "feat(quotation): completar TechnicalTab"
```

---

### Task 5: Crear StatesTab.tsx con timeline animado

**Files:**
- Create: `resources/js/Components/Quotations/StatesTab.tsx`

- [ ] **Step 1: Crear componente con timeline**

```tsx
import { Clock } from 'lucide-react';

interface StatesTabProps {
  status_history: any[];
  currentStatus: string;
}

export default function StatesTab({ status_history, currentStatus }: StatesTabProps) {
  return (
    <div className="space-y-6">
      <div className="glass rounded-2xl border border-[var(--border-ui)] overflow-hidden">
        <div className="px-6 py-4 border-b border-[var(--border-ui)] flex items-center gap-2">
          <Clock className="w-4 h-4 text-[var(--solar-gold)]" />
          <h3 className="font-bold text-sm">Historial de Estados</h3>
        </div>
        <div className="p-6 space-y-4">
          {status_history.map((h: any, idx: number) => {
            const isCurrent = h.to_status === currentStatus;
            return (
              <div key={h.id} className="flex gap-3 items-start relative">
                {/* Línea vertical conectora */}
                {idx < status_history.length - 1 && (
                  <div className="absolute left-[9px] top-6 bottom-0 w-px bg-[var(--border-ui)]" />
                )}
                {/* Círculo de estado */}
                <div className={`relative z-10 w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center ${
                  isCurrent
                    ? 'bg-[var(--solar-gold)] ring-4 ring-[var(--solar-gold)]/30 animate-pulse'
                    : h.to_status === 'Aprobada' ? 'bg-emerald-400' :
                      h.to_status === 'Enviada'   ? 'bg-blue-400' :
                      h.to_status === 'Rechazada' ? 'bg-red-400' :
                      h.to_status === 'Vencida'   ? 'bg-amber-400' : 'bg-slate-400'
                }`}>
                  {isCurrent && (
                    <div className="w-2 h-2 rounded-full bg-white" />
                  )}
                </div>
                {/* Contenido */}
                <div className="flex-1 pb-4">
                  <div className="flex items-center gap-2 flex-wrap">
                    {h.from_status && (
                      <span className="text-xs text-[var(--text-secondary)] line-through">{h.from_status}</span>
                    )}
                    {h.from_status && <span className="text-xs text-[var(--text-secondary)]">→</span>}
                    <span className={`text-xs font-bold ${isCurrent ? 'text-[var(--solar-gold)]' : 'text-[var(--text-primary)]'}`}>
                      {h.to_status}
                    </span>
                    {isCurrent && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--solar-gold)]/20 text-[var(--solar-gold)] border border-[var(--solar-gold)]/30">
                        ACTUAL
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] text-[var(--text-secondary)]">{h.user?.name}</span>
                    <span className="text-[10px] text-[var(--text-secondary)] opacity-60">
                      {new Date(h.created_at).toLocaleDateString('es-CO', {day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'})}
                    </span>
                  </div>
                  {h.notes && (
                    <p className="text-[11px] text-[var(--text-secondary)] mt-1 italic border-l-2 border-[var(--solar-gold)]/40 pl-2">{h.notes}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add resources/js/Components/Quotations/StatesTab.tsx
git commit -m "feat(quotation): crear StatesTab con timeline animado"
```

---

### Task 6: Refactorizar Show.tsx como orquestador

**Files:**
- Modify: `resources/js/Components/Quotations/FinancialTab.tsx`
- Modify: `resources/js/Components/Quotations/TechnicalTab.tsx`
- Modify: `resources/js/Components/Quotations/StatesTab.tsx`
- Modify: `resources/js/Pages/Quotations/Show.tsx`

- [ ] **Step 1: Definir constantes de tabs y estado**

```tsx
const tabs = [
  { id: 'financial', label: 'Financiera', icon: Calculator },
  { id: 'technical', label: 'Técnica', icon: Cpu },
  { id: 'states', label: 'Estados', icon: Clock },
] as const;

const [activeTab, setActiveTab] = useState<'financial' | 'technical' | 'states'>('financial');
```

- [ ] **Step 2: Reemplazar el grid de dos columnas por tabs**

Reemplazar lines 506-1103 (todo el grid de dos columnas) con:

```tsx
{/* Navegación de tabs */}
<nav className="-mb-px flex space-x-4 mb-6">
  {tabs.map((tab) => {
    const Icon = tab.icon;
    return (
      <button
        key={tab.id}
        onClick={() => setActiveTab(tab.id)}
        className={`inline-flex items-center gap-2 px-4 py-2.5 border-b-2 text-sm font-semibold rounded-t-lg transition-all ${
          activeTab === tab.id
            ? 'border-[var(--solar-gold)] text-[var(--solar-gold)] bg-[var(--solar-gold)]/5'
            : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface)]'
        }`}
      >
        <Icon className="w-4 h-4" />
        {tab.label}
      </button>
    );
  })}
</nav>

{/* Contenido según tab */}
<div className="min-h-[400px]">
  {activeTab === 'financial' && (
    <FinancialTab
      localData={localData}
      totals={totals}
      editingCell={editingCell}
      setEditingCell={setEditingCell}
      handleChange={handleChange}
      quotation={quotation}
    />
  )}
  {activeTab === 'technical' && (
    <TechnicalTab
      localData={localData}
      setLocalData={setLocalData}
      editingInfo={editingInfo}
      setEditingInfo={setEditingInfo}
      editingCell={editingCell}
      setEditingCell={setEditingCell}
      handleChange={handleChange}
      openProductModal={openProductModal}
      openAddProductModal={openAddProductModal}
      catalogPanels={catalogPanels}
      catalogInverters={catalogInverters}
      catalogBatteries={catalogBatteries}
      quotation={quotation}
      overdimensioning={overdimensioning}
      specs={specs}
    />
  )}
  {activeTab === 'states' && (
    <StatesTab
      status_history={quotation.status_history || []}
      currentStatus={localData.status}
    />
  )}
</div>
```

- [ ] **Step 3: Agregar imports de los nuevos componentes y hooks**

```tsx
import { useState } from 'react';
import FinancialTab from '@/Components/Quotations/FinancialTab';
import TechnicalTab from '@/Components/Quotations/TechnicalTab';
import StatesTab from '@/Components/Quotations/StatesTab';
import { Calculator, Cpu, Clock } from 'lucide-react';
```

- [ ] **Step 4: Limpiar imports no utilizados**

Eliminar `Sun`, `Battery`, `Wrench`, `FileText`, `MapPin`, `Box`, `Wallet` del import de lucide (ya no se usan en Show.tsx nivel raíz).

- [ ] **Step 5: Commit**

```bash
git add resources/js/Pages/Quotations/Show.tsx
git commit -m "feat(quotation): refactorizar Show.tsx con tabs y componentes separados"
```

---

### Task 7: Verificación final

- [ ] **Step 1: Levantar dev server y verificar**

```bash
npm run dev
```

Navegar a `/quotations/{id}` y verificar:
- Los 3 tabs se muestran y cambian contenido al hacer click
- El header con acciones (Guardar/Descartar/Estado/PDF) permanece visible
- No hay errores en consola
- El timeline en Estados muestra el estado actual con animación

- [ ] **Step 2: Verificar mobile responsive**

Achicar ventana a < 1024px y verificar que los tabs funcionan correctamente.

- [ ] **Step 3: Commit final**

```bash
git add . && git commit -m "feat(quotation): rediseño página con pestanas financiera tecnica estados"
```

---

## Self-Review Checklist

- [x] Cada archivo tiene una responsabilidad clara
- [x] No hay placeholder/TODO en los pasos
- [x] Props usadas en TechnicalTab y FinancialTab coinciden con lo emitido por Show.tsx
- [x] El timeline animado usa `animate-pulse` y `ring` para destacar estado actual
- [x] El patrón de tabs sigue el existente en ProjectDetailsPage.tsx