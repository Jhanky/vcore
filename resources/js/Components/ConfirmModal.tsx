import { Dialog, DialogPanel, Transition, TransitionChild } from '@headlessui/react';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import { ReactNode } from 'react';

interface ConfirmModalProps {
    show: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title?: string;
    message?: string | ReactNode;
    confirmLabel?: string;
    cancelLabel?: string;
    variant?: 'danger' | 'warning' | 'info';
    processing?: boolean;
}

const variantConfig = {
    danger: {
        icon: Trash2,
        iconBg: 'bg-red-500/10',
        iconColor: 'text-red-400',
        confirmBtn: 'bg-red-500 hover:bg-red-600 text-white shadow-red-500/30',
        borderAccent: 'border-red-500/20',
        glowColor: 'shadow-red-500/5',
    },
    warning: {
        icon: AlertTriangle,
        iconBg: 'bg-amber-500/10',
        iconColor: 'text-amber-400',
        confirmBtn: 'bg-amber-500 hover:bg-amber-600 text-slate-900 shadow-amber-500/30',
        borderAccent: 'border-amber-500/20',
        glowColor: 'shadow-amber-500/5',
    },
    info: {
        icon: AlertTriangle,
        iconBg: 'bg-blue-500/10',
        iconColor: 'text-blue-400',
        confirmBtn: 'bg-blue-500 hover:bg-blue-600 text-white shadow-blue-500/30',
        borderAccent: 'border-blue-500/20',
        glowColor: 'shadow-blue-500/5',
    },
};

export default function ConfirmModal({
    show,
    onClose,
    onConfirm,
    title = '¿Estás seguro?',
    message = 'Esta acción no se puede deshacer.',
    confirmLabel = 'Confirmar',
    cancelLabel = 'Cancelar',
    variant = 'danger',
    processing = false,
}: ConfirmModalProps) {
    const cfg = variantConfig[variant];
    const Icon = cfg.icon;

    return (
        <Transition show={show} leave="duration-200">
            <Dialog as="div" className="fixed inset-0 z-50 flex items-center justify-center p-4" onClose={onClose}>
                {/* Backdrop */}
                <TransitionChild
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm" />
                </TransitionChild>

                {/* Panel */}
                <TransitionChild
                    enter="ease-out duration-300"
                    enterFrom="opacity-0 scale-90 translate-y-4"
                    enterTo="opacity-100 scale-100 translate-y-0"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100 scale-100 translate-y-0"
                    leaveTo="opacity-0 scale-90 translate-y-4"
                >
                    <DialogPanel
                        className={`relative w-full max-w-md rounded-2xl border ${cfg.borderAccent} shadow-2xl ${cfg.glowColor} overflow-hidden`}
                        style={{ background: 'var(--surface, #1e293b)' }}
                    >
                        {/* Top accent line */}
                        <div className={`absolute top-0 left-0 right-0 h-0.5 ${variant === 'danger' ? 'bg-gradient-to-r from-transparent via-red-500 to-transparent' : variant === 'warning' ? 'bg-gradient-to-r from-transparent via-amber-500 to-transparent' : 'bg-gradient-to-r from-transparent via-blue-500 to-transparent'}`} />

                        <div className="p-6">
                            {/* Close button */}
                            <button
                                onClick={onClose}
                                disabled={processing}
                                className="absolute top-4 right-4 p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-slate-500/10 transition-all"
                            >
                                <X className="w-4 h-4" />
                            </button>

                            {/* Icon + Title */}
                            <div className="flex items-start gap-4 mb-4">
                                <div className={`flex-shrink-0 w-12 h-12 rounded-xl ${cfg.iconBg} flex items-center justify-center`}>
                                    <Icon className={`w-6 h-6 ${cfg.iconColor}`} />
                                </div>
                                <div className="pt-1">
                                    <h3 className="text-lg font-bold text-[var(--text-primary)] font-outfit leading-tight">
                                        {title}
                                    </h3>
                                </div>
                            </div>

                            {/* Message */}
                            <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-6 ml-16">
                                {message}
                            </p>

                            {/* Actions */}
                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={onClose}
                                    disabled={processing}
                                    className="px-5 py-2.5 text-sm font-semibold rounded-xl border border-[var(--border-ui)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-slate-500/10 transition-all disabled:opacity-50"
                                >
                                    {cancelLabel}
                                </button>
                                <button
                                    onClick={() => { onConfirm(); }}
                                    disabled={processing}
                                    className={`px-5 py-2.5 text-sm font-bold rounded-xl shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed ${cfg.confirmBtn}`}
                                >
                                    {processing ? (
                                        <span className="flex items-center gap-2">
                                            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                            </svg>
                                            Procesando…
                                        </span>
                                    ) : confirmLabel}
                                </button>
                            </div>
                        </div>
                    </DialogPanel>
                </TransitionChild>
            </Dialog>
        </Transition>
    );
}
