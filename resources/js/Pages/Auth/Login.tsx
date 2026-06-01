import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import Modal from '@/Components/Modal';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';
import { Eye, EyeOff, ShieldAlert } from 'lucide-react';

export default function Login({
    status,
}: {
    status?: string;
}) {
    const { data, setData, post, processing, errors, reset } = useForm({
        login: '',
        password: '',
        remember: false as boolean,
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showForgotModal, setShowForgotModal] = useState(false);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Acceso Corporativo" />

            <div className="mb-8 text-center">
                <h1 className="text-3xl font-bold font-outfit text-[var(--verde-oscuro)]">Energy 4.0</h1>
                <p className="text-sm text-[var(--text-secondary)] mt-2">Gestión Inteligente de Energía Solar</p>
            </div>

            {status && (
                <div className="mb-4 text-sm font-medium text-[var(--verde-medio)]">
                    {status}
                </div>
            )}

            <form onSubmit={submit}>
                <div>
                    <InputLabel htmlFor="login" value="Email o Usuario" />

                    <TextInput
                        id="login"
                        type="text"
                        name="login"
                        value={data.login}
                        className="mt-1 block w-full"
                        autoComplete="username"
                        isFocused={true}
                        onChange={(e) => setData('login', e.target.value)}
                    />

                    <InputError message={errors.login} className="mt-2" />
                </div>

                <div className="mt-4">
                    <InputLabel htmlFor="password" value="Contraseña" />

                    <div className="relative">
                        <TextInput
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            value={data.password}
                            className="mt-1 block w-full pr-10"
                            autoComplete="current-password"
                            onChange={(e) => setData('password', e.target.value)}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 flex items-center pr-3 mt-1"
                        >
                            {showPassword ? (
                                <EyeOff className="h-4 w-4 text-[var(--text-secondary)] hover:text-[var(--text-primary)]" />
                            ) : (
                                <Eye className="h-4 w-4 text-[var(--text-secondary)] hover:text-[var(--text-primary)]" />
                            )}
                        </button>
                    </div>

                    <InputError message={errors.password} className="mt-2" />
                </div>

                <div className="mt-4 block">
                    <label className="flex items-center">
                        <Checkbox
                            name="remember"
                            checked={data.remember}
                            onChange={(e) =>
                                setData(
                                    'remember',
                                    (e.target.checked || false) as false,
                                )
                            }
                        />
                        <span className="ms-2 text-sm text-[var(--text-secondary)]">
                            Recordarme
                        </span>
                    </label>
                </div>

                <div className="mt-6 flex flex-col gap-4">
                    <PrimaryButton className="w-full" disabled={processing}>
                        Entrar al Portal
                    </PrimaryButton>
                    
                    <div className="flex items-center justify-center">
                        <button
                            type="button"
                            onClick={() => setShowForgotModal(true)}
                            className="text-xs text-[var(--text-secondary)] underline hover:text-[var(--verde-medio)] focus:outline-none"
                        >
                            ¿Olvidaste tu contraseña?
                        </button>
                    </div>
                </div>
            </form>

            <Modal show={showForgotModal} onClose={() => setShowForgotModal(false)} maxWidth="sm">
                <div className="p-8 text-center">
                    <ShieldAlert className="mx-auto h-12 w-12 text-[var(--verde-medio)] mb-4" />
                    <h2 className="text-xl font-bold font-outfit text-[var(--verde-oscuro)] mb-3">
                        Restablecer Contraseña
                    </h2>
                    <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                        Por favor, comunícate con el administrador del sistema para que te restablezca la contraseña.
                    </p>
                    <button
                        type="button"
                        onClick={() => setShowForgotModal(false)}
                        className="mt-6 px-6 py-2.5 bg-[var(--verde-medio)] text-white rounded-full text-sm font-medium hover:opacity-90 transition-opacity"
                    >
                        Entendido
                    </button>
                </div>
            </Modal>
        </GuestLayout>
    );
}
