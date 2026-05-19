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