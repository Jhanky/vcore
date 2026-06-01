import { useState, useEffect, useCallback } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import { usePage } from '@inertiajs/react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastItem {
    id: number;
    message: string;
    type: ToastType;
}

const icons = {
    success: CheckCircle,
    error: XCircle,
    warning: AlertTriangle,
    info: Info,
};

const colors = {
    success: 'bg-emerald-500/20 border-emerald-500 text-emerald-400',
    error: 'bg-red-500/20 border-red-500 text-red-400',
    warning: 'bg-amber-500/20 border-amber-500 text-amber-400',
    info: 'bg-blue-500/20 border-blue-500 text-blue-400',
};

let toastId = 0;
let showToastExternal: ((message: string, type: ToastType) => void) | null = null;

export function showToast(message: string, type: ToastType = 'info') {
    if (showToastExternal) {
        showToastExternal(message, type);
    }
}

export default function Toast() {
    const [toasts, setToasts] = useState<ToastItem[]>([]);
    const { props } = usePage() as any;

    const removeToast = useCallback((id: number) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    // Leer flash messages del servidor al montar (session flash)
    useEffect(() => {
        const sessionFlash = (props as any).session;
        if (sessionFlash?.success) {
            showToast(sessionFlash.success, 'success');
        }
        if (sessionFlash?.error) {
            showToast(sessionFlash.error, 'error');
        }
        if (sessionFlash?.warning) {
            showToast(sessionFlash.warning, 'warning');
        }
    }, []);

    useEffect(() => {
        showToastExternal = (message: string, type: ToastType) => {
            const id = ++toastId;
            setToasts((prev) => [...prev, { id, message, type }]);

            setTimeout(() => {
                removeToast(id);
            }, 3000);
        };

        return () => {
            showToastExternal = null;
        };
    }, [removeToast]);

    return (
        <div className="fixed bottom-4 right-4 left-4 sm:bottom-6 sm:right-6 sm:left-auto z-[100] flex flex-col gap-3">
            {toasts.map((toast) => {
                const Icon = icons[toast.type];
                return (
                    <div
                        key={toast.id}
                        className={`
                            flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-sm
                            shadow-lg animate-slide-up max-w-sm
                            ${colors[toast.type]}
                        `}
                    >
                        <Icon className="h-5 w-5 shrink-0" />
                        <span className="text-sm font-medium">{toast.message}</span>
                        <button
                            onClick={() => removeToast(toast.id)}
                            className="ml-2 p-1 rounded hover:bg-white/10 transition-colors"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                );
            })}
        </div>
    );
}