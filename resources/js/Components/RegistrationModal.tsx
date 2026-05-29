import { Dialog, DialogPanel, Transition, TransitionChild } from '@headlessui/react';
import { CheckCircle, Loader, X, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';

type RegistrationStatus = 'idle' | 'loading' | 'success' | 'error';

interface RegistrationModalProps {
    show: boolean;
    status: RegistrationStatus;
    clientName?: string;
    clientId?: number;
    errorMessage?: string;
    onClose: () => void;
}

export default function RegistrationModal({
    show,
    status,
    clientName,
    clientId,
    errorMessage,
    onClose,
}: RegistrationModalProps) {
    useEffect(() => {
        if (status === 'success' && clientId) {
            const timer = setTimeout(() => {
                window.location.href = route('clients.show', clientId);
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [status, clientId]);

    const isOpen = status !== 'idle';

    const content = {
        loading: {
            title: 'Registrando cliente...',
            message: 'Por favor espera mientras guardamos la información.',
            icon: (
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                >
                    <Loader className="w-12 h-12 text-blue-400" />
                </motion.div>
            ),
            iconBg: 'bg-blue-500/10',
        },
        success: {
            title: '¡Cliente registrado!',
            message: clientName
                ? `${clientName} se ha registrado correctamente.`
                : 'El cliente se ha registrado correctamente.',
            icon: (
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                >
                    <CheckCircle className="w-12 h-12 text-emerald-400" />
                </motion.div>
            ),
            iconBg: 'bg-emerald-500/10',
        },
        error: {
            title: 'Error al registrar',
            message: errorMessage || 'Ocurrió un error al registrar el cliente. Intenta de nuevo.',
            icon: (
                <motion.div
                    initial={{ scale: 0, x: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                >
                    <XCircle className="w-12 h-12 text-red-400" />
                </motion.div>
            ),
            iconBg: 'bg-red-500/10',
        },
    };

    const current = content[status === 'idle' ? 'loading' : status];

    return (
        <Transition show={isOpen && show} leave="duration-200">
            <Dialog as="div" className="fixed inset-0 z-50 flex items-center justify-center p-4" onClose={onClose}>
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

                <TransitionChild
                    enter="ease-out duration-300"
                    enterFrom="opacity-0 scale-90 translate-y-4"
                    enterTo="opacity-100 scale-100 translate-y-0"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100 scale-100 translate-y-0"
                    leaveTo="opacity-0 scale-90 translate-y-4"
                >
                    <DialogPanel
                        className="relative w-full max-w-sm rounded-2xl border border-slate-500/20 shadow-2xl overflow-hidden"
                        style={{ background: 'var(--surface, #1e293b)' }}
                    >
                        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-blue-500 to-transparent" />

                        <div className="p-6">
                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-slate-500/10 transition-all"
                            >
                                <X className="w-4 h-4" />
                            </button>

                            <div className="flex flex-col items-center text-center">
                                <div className={`flex-shrink-0 w-16 h-16 rounded-2xl ${current.iconBg} flex items-center justify-center mb-4`}>
                                    <AnimatePresence mode="wait">
                                        <motion.div
                                            key={status}
                                            initial={{ opacity: 0, scale: 0.5 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.5 }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            {current.icon}
                                        </motion.div>
                                    </AnimatePresence>
                                </div>

                                <h3 className="text-lg font-bold text-[var(--text-primary)] font-outfit leading-tight mb-2">
                                    {current.title}
                                </h3>

                                <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-6">
                                    {current.message}
                                </p>

                                {status === 'success' && (
                                    <p className="text-xs text-[var(--text-secondary)]">
                                        Redirigiendo en 2 segundos...
                                    </p>
                                )}

                                {status === 'error' && (
                                    <button
                                        onClick={onClose}
                                        className="px-5 py-2.5 text-sm font-bold rounded-xl shadow-lg bg-red-500 hover:bg-red-600 text-white transition-all"
                                    >
                                        Cerrar
                                    </button>
                                )}
                            </div>
                        </div>
                    </DialogPanel>
                </TransitionChild>
            </Dialog>
        </Transition>
    );
}
