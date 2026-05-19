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