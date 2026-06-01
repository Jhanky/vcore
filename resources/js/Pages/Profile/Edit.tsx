import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Modal from '@/Components/Modal';
import { PageProps } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';
import { cn } from '@/utils/cn';
import { Camera, User as UserIcon, X } from 'lucide-react';
import { useState } from 'react';

export default function Edit({
    mustVerifyEmail,
    status,
}: PageProps<{ mustVerifyEmail: boolean; status?: string }>) {
    const { auth } = usePage<PageProps>().props as any;
    const [showPhotoModal, setShowPhotoModal] = useState(false);

    const profilePhotoUrl = auth?.user?.profile_photo_url || null;

    return (
        <AuthenticatedLayout
            header="Configuración del Perfil"
        >
            <Head title="Mi Perfil" />

            <div className="max-w-5xl mx-auto space-y-8 pb-20">
                {/* Profile Photo Header Card */}
                <div className="glass p-8 rounded-[2rem] relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                         <UserIcon className="h-32 w-32" />
                    </div>
                    
                    <div className="relative flex flex-col md:flex-row items-center gap-8">
                        <div className="relative group/avatar">
                            {profilePhotoUrl ? (
                                <img
                                    src={profilePhotoUrl}
                                    alt={auth.user.name}
                                    onClick={() => setShowPhotoModal(true)}
                                    className="h-32 w-32 rounded-2xl object-cover shadow-[0_0_30px_rgba(251,191,36,0.3)] transition-transform duration-500 group-hover/avatar:scale-105 cursor-pointer"
                                />
                            ) : (
                                <div
                                    onClick={() => setShowPhotoModal(true)}
                                    className="h-32 w-32 rounded-2xl bg-[var(--solar-gold)] flex items-center justify-center text-slate-900 text-5xl font-bold shadow-[0_0_30px_rgba(251,191,36,0.3)] transition-transform duration-500 group-hover/avatar:scale-105 cursor-pointer"
                                >
                                    {auth.user.name.charAt(0)}
                                </div>
                            )}
                            <button
                                onClick={() => setShowPhotoModal(true)}
                                className="absolute -bottom-2 -right-2 p-3 bg-[var(--bg-content)] rounded-full border border-[var(--border-ui)] text-[var(--solar-gold)] hover:bg-slate-700 hover:text-white transition-all shadow-xl"
                            >
                                <Camera className="h-5 w-5" />
                            </button>
                        </div>
                        
                        <div className="text-center md:text-left">
                            <h3 className="text-2xl font-bold text-[var(--text-primary)] font-outfit">{auth.user.name}</h3>
                            <p className="text-[var(--text-secondary)]">Administrador de Sistema</p>
                            <div className="mt-4 flex flex-wrap gap-2 justify-center md:justify-start">
                                <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 text-xs font-bold rounded-full border border-emerald-500/20">Activo</span>
                                <span className="px-3 py-1 bg-blue-500/10 text-blue-500 text-xs font-bold rounded-full border border-blue-500/20">Energy 4.0 Team</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="glass p-8 rounded-[2rem]">
                        <h4 className="text-lg font-bold text-[var(--text-primary)] mb-6 font-outfit">Información Personal</h4>
                        <UpdateProfileInformationForm
                            mustVerifyEmail={mustVerifyEmail}
                            status={status}
                        />
                    </div>

                    <div className="glass p-8 rounded-[2rem]">
                        <h4 className="text-lg font-bold text-[var(--text-primary)] mb-6 font-outfit">Seguridad</h4>
                        <UpdatePasswordForm />
                    </div>
                </div>

                <div className="glass p-8 rounded-[2rem] border-red-500/20 bg-red-500/5">
                    <h4 className="text-lg font-bold text-red-500 mb-4 font-outfit">Zona de Peligro</h4>
                    <p className="text-sm text-[var(--text-secondary)] mb-6">Una vez que elimines tu cuenta, todos sus recursos y datos se eliminarán de forma permanente.</p>
                    <DeleteUserForm />
                </div>

                <Modal show={showPhotoModal} onClose={() => setShowPhotoModal(false)} maxWidth="2xl">
                    <div className="relative bg-[var(--bg-content)]">
                        <button
                            onClick={() => setShowPhotoModal(false)}
                            className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                        >
                            <X className="h-5 w-5" />
                        </button>
                        {profilePhotoUrl ? (
                            <img
                                src={profilePhotoUrl}
                                alt={auth.user.name}
                                className="w-full max-h-[80vh] object-contain rounded-lg"
                            />
                        ) : (
                            <div className="h-64 w-64 mx-auto rounded-2xl bg-[var(--solar-gold)] flex items-center justify-center text-slate-900 text-8xl font-bold">
                                {auth.user.name.charAt(0)}
                            </div>
                        )}
                    </div>
                </Modal>
            </div>
        </AuthenticatedLayout>
    );
}
