import { Dialog, DialogPanel, Transition, TransitionChild } from '@headlessui/react';
import { AlertCircle, CheckCircle, Info, X, XCircle } from 'lucide-react';
import { ReactNode } from 'react';

type AlertVariant = 'error' | 'success' | 'warning' | 'info';

interface AlertModalProps {
    show: boolean;
    onClose: () => void;
    title?: string;
    message?: string | ReactNode;
    variant?: AlertVariant;
    closeLabel?: string;
}

const variantConfig: Record<AlertVariant, {
    Icon: typeof AlertCircle;
    iconBg: string;
    iconColor: string;
    borderAccent: string;
    accentGradient: string;
    closeBtn: string;
}> = {
    error: {
        Icon: XCircle,
        iconBg: 'bg-red-500/10',
        iconColor: 'text-red-400',
        borderAccent: 'border-red-500/20',
        accentGradient: 'from-transparent via-red-500 to-transparent',
        closeBtn: 'bg-red-500 hover:bg-red-600 text-white',
    },
    success: {
        Icon: CheckCircle,
        iconBg: 'bg-emerald-500/10',
        iconColor: 'text-emerald-400',
        borderAccent: 'border-emerald-500/20',
        accentGradient: 'from-transparent via-emerald-500 to-transparent',
        closeBtn: 'bg-emerald-500 hover:bg-emerald-600 text-white',
    },
    warning: {
        Icon: AlertCircle,
        iconBg: 'bg-amber-500/10',
        iconColor: 'text-amber-400',
        borderAccent: 'border-amber-500/20',
        accentGradient: 'from-transparent via-amber-500 to-transparent',
        closeBtn: 'bg-amber-500 hover:bg-amber-600 text-slate-900',
    },
    info: {
        Icon: Info,
        iconBg: 'bg-blue-500/10',
        iconColor: 'text-blue-400',
        borderAccent: 'border-blue-500/20',
        accentGradient: 'from-transparent via-blue-500 to-transparent',
        closeBtn: 'bg-blue-500 hover:bg-blue-600 text-white',
    },
};

export default function AlertModal({
    show,
    onClose,
    title,
    message,
    variant = 'info',
    closeLabel = 'Entendido',
}: AlertModalProps) {
    const cfg = variantConfig[variant];
    const { Icon } = cfg;

    const defaultTitles: Record<AlertVariant, string> = {
        error: 'Error',
        success: '¡Éxito!',
        warning: 'Advertencia',
        info: 'Información',
    };

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
                        className={`relative w-full max-w-sm rounded-2xl border ${cfg.borderAccent} shadow-2xl overflow-hidden`}
                        style={{ background: 'var(--surface, #1e293b)' }}
                    >
                        {/* Top accent line */}
                        <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${cfg.accentGradient}`} />

                        <div className="p-6">
                            {/* Close button */}
                            <button
                                onClick={onClose}
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
                                        {title ?? defaultTitles[variant]}
                                    </h3>
                                </div>
                            </div>

                            {/* Message */}
                            {message && (
                                <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-6 ml-16">
                                    {message}
                                </p>
                            )}

                            {/* Action */}
                            <div className="flex justify-end">
                                <button
                                    onClick={onClose}
                                    className={`px-5 py-2.5 text-sm font-bold rounded-xl shadow-lg transition-all ${cfg.closeBtn}`}
                                >
                                    {closeLabel}
                                </button>
                            </div>
                        </div>
                    </DialogPanel>
                </TransitionChild>
            </Dialog>
        </Transition>
    );
}
