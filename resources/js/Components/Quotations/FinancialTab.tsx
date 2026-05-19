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

  // Componente EditableCell inline para celdas editables en la tabla AUI
  const EditableCell = ({ value, section, id, field, type = "number", suffix = "", prefix = "", fmtFn = (v: any) => v }: any) => {
    const isEditing = editingCell?.section === section && editingCell?.id === id && editingCell?.field === field;

    if (isEditing) {
      return (
        <input
          autoFocus
          type={type}
          step="any"
          className="w-full bg-[var(--bg-content)] border-[var(--solar-gold)] rounded px-2 py-1 text-right focus:ring-1 focus:ring-[var(--solar-gold)] outline-none"
          value={value}
          onChange={(e) => handleChange(section, id, field, e.target.value)}
          onBlur={() => setEditingCell(null)}
          onKeyDown={(e) => e.key === 'Enter' && setEditingCell(null)}
        />
      );
    }

    return (
      <div
        onDoubleClick={() => {}}
        className="cursor-pointer hover:bg-[var(--solar-gold)]/5 rounded px-2 py-1 transition-colors"
      >
        {prefix}{fmtFn(value)}{suffix}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="glass rounded-2xl border border-[var(--solar-gold)]/20 overflow-hidden">
        <div className="bg-[var(--solar-gold)]/10 p-6 border-b border-[var(--solar-gold)]/20">
          <h2 className="text-xl font-bold text-[var(--text-primary)] flex items-center gap-2 mb-1">
            <Calculator className="w-5 h-5 text-[var(--solar-gold)]" /> Resumen Financiero
          </h2>
          <p className="text-sm text-[var(--text-secondary)]">Cálculos AUI</p>
        </div>
        <div className="p-6 space-y-4">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-[var(--text-secondary)]">
              <span>Subtotal (Costos directos)</span>
              <span>{fmt(totals.subtotal)}</span>
            </div>
            <div className="flex justify-between text-[var(--text-secondary)]">
              <div className="flex items-center gap-1">
                <span>Gestión Comercial</span>
                <EditableCell section="summary" id="global" field="commercial_management_percentage" value={localData.commercial_management_percentage} suffix="%" fmtFn={(v: any) => (v * 100).toFixed(1)} />
              </div>
              <span>{fmt(totals.commercial_management)}</span>
            </div>
            <div className="flex justify-between font-semibold text-[var(--text-primary)] py-2 border-y border-[var(--border-ui)]">
              <span>Subtotal 2</span>
              <span>{fmt(totals.subtotal2)}</span>
            </div>
            <div className="flex justify-between text-[var(--text-secondary)]">
              <div className="flex items-center gap-1">
                <span>Administración</span>
                <EditableCell section="summary" id="global" field="administration_percentage" value={localData.administration_percentage} suffix="%" fmtFn={(v: any) => (v * 100).toFixed(1)} />
              </div>
              <span>{fmt(totals.administration)}</span>
            </div>
            <div className="flex justify-between text-[var(--text-secondary)]">
              <div className="flex items-center gap-1">
                <span>Imprevistos</span>
                <EditableCell section="summary" id="global" field="contingency_percentage" value={localData.contingency_percentage} suffix="%" fmtFn={(v: any) => (v * 100).toFixed(1)} />
              </div>
              <span>{fmt(totals.contingency)}</span>
            </div>
            <div className="flex justify-between text-[var(--text-secondary)]">
              <div className="flex items-center gap-1">
                <span>Utilidad</span>
                <EditableCell section="summary" id="global" field="profit_percentage" value={localData.profit_percentage} suffix="%" fmtFn={(v: any) => (v * 100).toFixed(1)} />
              </div>
              <span>{fmt(totals.profit)}</span>
            </div>
            <div className="flex justify-between text-[var(--text-secondary)]">
              <span>IVA s/ Utilidad ({(localData.iva_profit_percentage * 100).toFixed(1)}%)</span>
              <span>{fmt(totals.profit_iva)}</span>
            </div>
            <div className="flex justify-between font-semibold text-[var(--text-primary)] py-2 border-y border-[var(--border-ui)]">
              <span>Subtotal 3</span>
              <span>{fmt(totals.subtotal3)}</span>
            </div>
            <div className="flex justify-between text-[var(--text-secondary)]">
              <div className="flex items-center gap-1">
                <span>Retenciones</span>
                <EditableCell section="summary" id="global" field="withholding_percentage" value={localData.withholding_percentage} suffix="%" fmtFn={(v: any) => (v * 100).toFixed(1)} />
              </div>
              <span>{fmt(totals.withholdings)}</span>
            </div>
          </div>

          <div className="mt-6 p-4 bg-[var(--surface)] border border-[var(--solar-gold)]/30 rounded-xl text-center">
            <p className="text-sm text-[var(--text-secondary)] mb-1 uppercase tracking-widest font-semibold">Valor Total del Proyecto</p>
            <p className="text-3xl font-black text-[var(--solar-gold)]">{fmt(totals.total_value)}</p>
            <p className="text-xs text-[var(--text-secondary)] mt-2">Valor por Vatio: <strong className="text-[var(--text-primary)]">{fmt(totals.total_value / (localData.power_kwp * 1000))}</strong> / Wp</p>
          </div>

          <div className="pt-4 flex flex-col gap-2">
            <div className="flex justify-between text-xs text-[var(--text-secondary)]">
              <span>Fecha de emisión:</span>
              <span>{quotation.issue_date}</span>
            </div>
            <div className="flex justify-between text-xs text-[var(--text-secondary)]">
              <span>Válido hasta:</span>
              <span>{quotation.expiration_date}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}