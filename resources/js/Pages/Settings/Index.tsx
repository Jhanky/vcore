import { useState, useEffect, useMemo } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage, Link } from '@inertiajs/react';
import {
    Sun,
    Moon,
    Key,
    Sparkles,
    Copy,
    Check,
    Trash2,
    Monitor,
    Shield,
    Loader2,
    Eye,
    EyeOff,
    RefreshCw,
    X,
    User as UserIcon,
} from 'lucide-react';

type TabType = 'account' | 'appearance' | 'security' | 'mcp';

export default function Settings() {
    const { auth, theme: savedTheme, mcp_token, mcp_token_created_at } = usePage().props as any;
    const [activeTab, setActiveTab] = useState<TabType>('account');
    const [theme, setTheme] = useState(savedTheme || 'light');
    const [copiedToken, setCopiedToken] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isRevoking, setIsRevoking] = useState(false);
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPasswordInput, setShowNewPasswordInput] = useState(false);
    const [showConfirmPasswordInput, setShowConfirmPasswordInput] = useState(false);

    const [passwordData, setPasswordData] = useState({
        current_password: '',
        password: '',
        password_confirmation: '',
    });
    const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({});
    const [passwordSuccess, setPasswordSuccess] = useState(false);

    const isAdmin = auth?.user?.roles?.includes('admin');
    const [showToken, setShowToken] = useState(false);
    const [mcpToken, setMcpToken] = useState('');
    const [mcpTokenCreatedAt, setMcpTokenCreatedAt] = useState(mcp_token_created_at ? new Date(mcp_token_created_at).toISOString() : '');
    const [mcpSuccess, setMcpSuccess] = useState('');
    const [mcpError, setMcpError] = useState('');
    const [hasExistingToken, setHasExistingToken] = useState(!!mcp_token_created_at);

    useEffect(() => {
        // Solo inicializar estado local desde localStorage, NO al html
        // (AuthenticatedLayout ya lo hace via useThemeInit)
        const saved = localStorage.getItem('theme');
        if (saved === 'dark' || saved === 'light') {
            setTheme(saved);
        }
    }, []);

    useEffect(() => {
        // Sincronizar con otras pestañas
        const handler = (e: StorageEvent) => {
            if (e.key !== 'theme') return;
            const t = e.newValue || 'dark';
            setTheme(t);
        };
        window.addEventListener('storage', handler);
        return () => window.removeEventListener('storage', handler);
    }, []);

    const handleThemeChange = async (newTheme: string) => {
        setTheme(newTheme);
        // Aplicar al html directamente (el hook de AuthLayout no responde a cambios locales)
        const root = window.document.documentElement;
        root.classList.remove('dark', 'light');
        root.classList.add(newTheme);
        localStorage.setItem('theme', newTheme);
        try {
            await fetch('/settings/theme', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as any)?.content || '',
                },
                body: JSON.stringify({ theme: newTheme }),
            });
        } catch (error) {
            console.error('Error saving theme:', error);
        }
    };

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        setPasswordErrors({});
        setPasswordSuccess(false);

        if (passwordData.password !== passwordData.password_confirmation) {
            setPasswordErrors({ password_confirmation: 'Las contraseñas no coinciden' });
            return;
        }

        setIsChangingPassword(true);

        try {
            const response = await fetch('/settings/password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as any)?.content || '',
                },
                body: JSON.stringify(passwordData),
            });

            const data = await response.json();

            if (response.ok) {
                setPasswordSuccess(true);
                setPasswordData({ current_password: '', password: '', password_confirmation: '' });
            } else {
                if (data.errors) {
                    setPasswordErrors(data.errors);
                }
            }
        } catch (error) {
            setPasswordErrors({ general: 'Error al cambiar la contraseña' });
        } finally {
            setIsChangingPassword(false);
        }
    };

    const generateMcpToken = async () => {
        setIsGenerating(true);
        setMcpError('');
        setMcpSuccess('');
        setShowToken(false);

        try {
            const response = await fetch('/settings/mcp-token/generate', {
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as any)?.content || '',
                },
            });

            const data = await response.json();

            if (response.ok) {
                setMcpToken(data.token);
                setMcpTokenCreatedAt(new Date().toISOString());
                setShowToken(true);
                setMcpSuccess(data.message);
            } else {
                setMcpError(data.message || 'Error al generar el token');
            }
        } catch (error) {
            setMcpError('Error al conectar con el servidor');
        } finally {
            setIsGenerating(false);
        }
    };

    const revokeMcpToken = async () => {
        setIsRevoking(true);
        setMcpError('');

        try {
            const response = await fetch('/settings/mcp-token/revoke', {
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as any)?.content || '',
                },
            });

            const data = await response.json();

            if (response.ok) {
                setMcpToken('');
                setMcpTokenCreatedAt('');
                setShowToken(false);
                setMcpSuccess(data.message);
            } else {
                setMcpError(data.message || 'Error al revocar el token');
            }
        } catch (error) {
            setMcpError('Error al conectar con el servidor');
        } finally {
            setIsRevoking(false);
        }
    };

    const copyToken = () => {
        navigator.clipboard.writeText(mcpToken);
        setCopiedToken(true);
        setTimeout(() => setCopiedToken(false), 2000);
    };

    const passwordRequirements = useMemo(() => ({
        length: passwordData.password.length >= 8,
        uppercase: /[A-Z]/.test(passwordData.password),
        lowercase: /[a-z]/.test(passwordData.password),
        number: /[0-9]/.test(passwordData.password),
        special: /[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(passwordData.password),
    }), [passwordData.password]);

    const passwordsMatch = useMemo(() => (
        passwordData.password.length > 0 &&
        passwordData.password === passwordData.password_confirmation
    ), [passwordData.password, passwordData.password_confirmation]);

    const generateSecurePassword = () => {
        const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
        let password = '';
        const rand = new Uint32Array(16);
        crypto.getRandomValues(rand);
        for (let i = 0; i < 16; i++) {
            password += chars[rand[i] % chars.length];
        }
        setPasswordData({
            ...passwordData,
            password,
            password_confirmation: '',
        });
        setShowNewPasswordInput(true);
        setShowConfirmPasswordInput(false);
    };

    const tabs = [
        { id: 'account' as TabType, label: 'Mi Cuenta', icon: UserIcon },
        { id: 'appearance' as TabType, label: 'Apariencia', icon: Monitor },
        { id: 'security' as TabType, label: 'Seguridad', icon: Shield },
        ...(isAdmin ? [{ id: 'mcp' as TabType, label: 'Token MCP', icon: Sparkles }] : []),
    ];

    return (
        <AuthenticatedLayout header="Configuración del Sistema">
            <Head title="Configuración" />

            <div className="px-4 md:px-8 space-y-6 md:space-y-8 pb-32">
                <div className="glass p-4 px-4 md:px-6 rounded-2xl">
                    <div className="flex gap-2 overflow-x-auto">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-3 px-6 py-3 rounded-xl font-medium transition-all whitespace-nowrap ${
                                    activeTab === tab.id
                                        ? 'bg-[var(--solar-gold)] text-slate-900 shadow-[0_0_15px_rgba(251,191,36,0.3)]'
                                        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-slate-500/10'
                                }`}
                            >
                                <tab.icon className="h-5 w-5" />
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {activeTab === 'account' && (
                    <div className="glass p-8 rounded-[2rem]">
                        <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2 font-outfit flex items-center gap-3">
                            <UserIcon className="h-6 w-6 text-[var(--solar-gold)]" />
                            Mi Cuenta
                        </h3>
                        <p className="text-[var(--text-secondary)] mb-8">Información de tu cuenta de usuario</p>

                        <div className="flex flex-col md:flex-row gap-8">
                            <div className="flex flex-col items-center gap-4">
                                {auth?.user?.profile_photo_url ? (
                                    <img
                                        src={auth.user.profile_photo_url}
                                        alt={auth.user.name}
                                        className="h-28 w-28 rounded-2xl object-cover shadow-[0_0_20px_rgba(251,191,36,0.2)]"
                                    />
                                ) : (
                                    <div className="h-28 w-28 rounded-2xl bg-brand-600 flex items-center justify-center text-white text-4xl font-bold shadow-[0_0_20px_rgba(59,130,246,0.3)]">
                                        {auth?.user?.name?.charAt(0) ?? 'U'}
                                    </div>
                                )}
                                <Link
                                    href={route('profile.edit')}
                                    className="text-sm text-[var(--solar-gold)] hover:text-[var(--solar-gold-hover)] transition-colors"
                                >
                                    Editar perfil
                                </Link>
                            </div>

                            <div className="flex-1 space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider mb-1">Nombre</label>
                                        <p className="text-[var(--text-primary)] font-medium">{auth?.user?.name ?? '—'}</p>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider mb-1">Correo Electrónico</label>
                                        <p className="text-[var(--text-primary)] font-medium">{auth?.user?.email ?? '—'}</p>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider mb-1">Roles</label>
                                        <div className="flex flex-wrap gap-2 mt-1">
                                            {auth?.user?.roles && auth.user.roles.length > 0 ? (
                                                auth.user.roles.map((role: string, index: number) => (
                                                    <span key={index} className="px-3 py-1 bg-[var(--solar-gold)]/10 text-[var(--solar-gold)] text-xs font-bold rounded-full border border-[var(--solar-gold)]/20 capitalize">
                                                        {role}
                                                    </span>
                                                ))
                                            ) : (
                                                <span className="text-[var(--text-secondary)]">Sin roles asignados</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'appearance' && (
                    <div className="glass p-8 rounded-[2rem]">
                        <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2 font-outfit flex items-center gap-3">
                            <Monitor className="h-6 w-6 text-[var(--solar-gold)]" />
                            Apariencia
                        </h3>
                        <p className="text-[var(--text-secondary)] mb-8">Personaliza cómo se ve la aplicación</p>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-[var(--text-primary)] mb-4">
                                    Tema de Color
                                </label>
                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        onClick={() => handleThemeChange('dark')}
                                        className={`relative p-6 rounded-2xl border-2 transition-all ${
                                            theme === 'dark'
                                                ? 'border-[var(--solar-gold)] bg-[var(--solar-gold)]/10'
                                                : 'border-[var(--border-ui)] hover:border-slate-500'
                                        }`}
                                    >
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="h-12 w-12 rounded-xl bg-slate-900 flex items-center justify-center">
                                                <Moon className="h-6 w-6 text-slate-400" />
                                            </div>
                                            <span className="font-medium text-[var(--text-primary)]">Modo Oscuro</span>
                                        </div>
                                        {theme === 'dark' && (
                                            <div className="absolute -top-2 -right-2 bg-[var(--solar-gold)] text-slate-900 rounded-full p-1">
                                                <Check className="h-4 w-4" />
                                            </div>
                                        )}
                                    </button>

                                    <button
                                        onClick={() => handleThemeChange('light')}
                                        className={`relative p-6 rounded-2xl border-2 transition-all ${
                                            theme === 'light'
                                                ? 'border-[var(--solar-gold)] bg-[var(--solar-gold)]/10'
                                                : 'border-[var(--border-ui)] hover:border-slate-500'
                                        }`}
                                    >
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="h-12 w-12 rounded-xl bg-slate-100 flex items-center justify-center">
                                                <Sun className="h-6 w-6 text-amber-500" />
                                            </div>
                                            <span className="font-medium text-[var(--text-primary)]">Modo Claro</span>
                                        </div>
                                        {theme === 'light' && (
                                            <div className="absolute -top-2 -right-2 bg-[var(--solar-gold)] text-slate-900 rounded-full p-1">
                                                <Check className="h-4 w-4" />
                                            </div>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'security' && (
                    <div className="glass p-8 rounded-[2rem]">
                        <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2 font-outfit flex items-center gap-3">
                            <Shield className="h-6 w-6 text-[var(--solar-gold)]" />
                            Seguridad
                        </h3>
                        <p className="text-[var(--text-secondary)] mb-8">Gestiona tu contraseña y seguridad de la cuenta</p>

                        <form onSubmit={handlePasswordChange} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                                    Contraseña Actual
                                </label>
                                <div className="relative">
                                    <input
                                        type={showCurrentPassword ? 'text' : 'password'}
                                        value={passwordData.current_password}
                                        onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
                                        className="w-full px-4 py-3 pr-12 rounded-xl border border-[var(--border-ui)] bg-slate-500/5 text-[var(--text-primary)] focus:border-[var(--solar-gold)] focus:ring-1 focus:ring-[var(--solar-gold)]"
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                                    >
                                        {showCurrentPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                    </button>
                                </div>
                                {passwordErrors.current_password && (
                                    <p className="mt-1 text-sm text-red-500">{passwordErrors.current_password}</p>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                                        Nueva Contraseña
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showNewPasswordInput ? 'text' : 'password'}
                                            value={passwordData.password}
                                            onChange={(e) => setPasswordData({ ...passwordData, password: e.target.value })}
                                            className="w-full px-4 py-3 pr-20 rounded-xl border border-[var(--border-ui)] bg-slate-500/5 text-[var(--text-primary)] focus:border-[var(--solar-gold)] focus:ring-1 focus:ring-[var(--solar-gold)]"
                                            placeholder="••••••••"
                                        />
                                        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                                            <button
                                                type="button"
                                                onClick={() => setShowNewPasswordInput(!showNewPasswordInput)}
                                                className="p-1.5 rounded-lg hover:bg-slate-500/20 text-[var(--text-secondary)]"
                                                title={showNewPasswordInput ? 'Ocultar' : 'Mostrar'}
                                            >
                                                {showNewPasswordInput ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={generateSecurePassword}
                                                className="p-1.5 rounded-lg hover:bg-slate-500/20 text-[var(--text-secondary)]"
                                                title="Generar contraseña segura"
                                            >
                                                <RefreshCw className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                    {passwordErrors.password && (
                                        <p className="mt-1 text-sm text-red-500">{passwordErrors.password}</p>
                                    )}
                                    {passwordData.password && (
                                        <div className="mt-2 p-3 rounded-xl bg-slate-500/5 border border-[var(--border-ui)]">
                                            <p className="text-xs font-bold text-[var(--text-secondary)] mb-2">Requisitos:</p>
                                            <div className="grid grid-cols-2 gap-1 text-xs">
                                                <div className="flex items-center gap-1">
                                                    {passwordRequirements.length ? <Check className="h-3 w-3 text-green-400" /> : <X className="h-3 w-3 text-red-400" />}
                                                    <span className={passwordRequirements.length ? 'text-green-400' : 'text-red-400'}>8+ caracteres</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    {passwordRequirements.uppercase ? <Check className="h-3 w-3 text-green-400" /> : <X className="h-3 w-3 text-red-400" />}
                                                    <span className={passwordRequirements.uppercase ? 'text-green-400' : 'text-red-400'}>Mayúscula</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    {passwordRequirements.lowercase ? <Check className="h-3 w-3 text-green-400" /> : <X className="h-3 w-3 text-red-400" />}
                                                    <span className={passwordRequirements.lowercase ? 'text-green-400' : 'text-red-400'}>Minúscula</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    {passwordRequirements.number ? <Check className="h-3 w-3 text-green-400" /> : <X className="h-3 w-3 text-red-400" />}
                                                    <span className={passwordRequirements.number ? 'text-green-400' : 'text-red-400'}>Número</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    {passwordRequirements.special ? <Check className="h-3 w-3 text-green-400" /> : <X className="h-3 w-3 text-red-400" />}
                                                    <span className={passwordRequirements.special ? 'text-green-400' : 'text-red-400'}>Especial</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                                        Confirmar Nueva Contraseña
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showConfirmPasswordInput ? 'text' : 'password'}
                                            value={passwordData.password_confirmation}
                                            onChange={(e) => setPasswordData({ ...passwordData, password_confirmation: e.target.value })}
                                            className={`w-full px-4 py-3 pr-12 rounded-xl border ${
                                                passwordData.password_confirmation
                                                    ? passwordsMatch
                                                        ? 'border-green-500/50 focus:border-green-500 focus:ring-green-500/50'
                                                        : 'border-red-500/50 focus:border-red-500 focus:ring-red-500/50'
                                                    : 'border-[var(--border-ui)] focus:border-[var(--solar-gold)] focus:ring-[var(--solar-gold)]'
                                            } bg-slate-500/5 text-[var(--text-primary)]`}
                                            placeholder="••••••••"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPasswordInput(!showConfirmPasswordInput)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                                            title={showConfirmPasswordInput ? 'Ocultar' : 'Mostrar'}
                                        >
                                            {showConfirmPasswordInput ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                        </button>
                                    </div>
                                    {passwordData.password_confirmation && !passwordsMatch && (
                                        <p className="mt-1 text-xs text-red-400 flex items-center gap-1">
                                            <X className="h-3 w-3" /> Las contraseñas no coinciden
                                        </p>
                                    )}
                                    {passwordErrors.password_confirmation && (
                                        <p className="mt-1 text-sm text-red-500">{passwordErrors.password_confirmation}</p>
                                    )}
                                </div>
                            </div>

                            {passwordErrors.general && (
                                <p className="text-sm text-red-500">{passwordErrors.general}</p>
                            )}

                            {passwordSuccess && (
                                <div className="flex items-center gap-2 text-emerald-500 bg-emerald-500/10 px-4 py-3 rounded-xl">
                                    <Check className="h-5 w-5" />
                                    <span>Contraseña actualizada correctamente</span>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={isChangingPassword}
                                className="flex items-center gap-2 px-6 py-3 bg-[var(--solar-gold)] text-slate-900 rounded-xl font-medium hover:bg-[var(--solar-gold-hover)] transition-colors disabled:opacity-50"
                            >
                                {isChangingPassword ? <Loader2 className="h-5 w-5 animate-spin" /> : <Key className="h-5 w-5" />}
                                {isChangingPassword ? 'Cambiando...' : 'Cambiar Contraseña'}
                            </button>
                        </form>
                    </div>
                )}

                {activeTab === 'mcp' && (
                    <div className="glass p-8 rounded-[2rem]">
                        <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2 font-outfit flex items-center gap-3">
                            <Sparkles className="h-6 w-6 text-[var(--solar-gold)]" />
                            Token MCP
                        </h3>
                        <p className="text-[var(--text-secondary)] mb-8">Genera y gestiona el token de acceso para el Model Context Protocol</p>

                        {mcpSuccess && (
                            <div className="flex items-center gap-2 text-emerald-500 bg-emerald-500/10 px-4 py-3 rounded-xl mb-6">
                                <Check className="h-5 w-5" />
                                <span>{mcpSuccess}</span>
                            </div>
                        )}

                        {mcpError && (
                            <div className="flex items-center gap-2 text-red-500 bg-red-500/10 px-4 py-3 rounded-xl mb-6">
                                <Shield className="h-5 w-5" />
                                <span>{mcpError}</span>
                            </div>
                        )}

                        {!mcpToken && !showToken && !hasExistingToken ? (
                            <div className="text-center py-12">
                                <div className="h-20 w-20 mx-auto mb-6 rounded-full bg-[var(--solar-gold)]/10 flex items-center justify-center">
                                    <Key className="h-10 w-10 text-[var(--solar-gold)]" />
                                </div>
                                <h4 className="text-lg font-bold text-[var(--text-primary)] mb-2">Sin Token MCP</h4>
                                <p className="text-[var(--text-secondary)] mb-6 max-w-md mx-auto">
                                    Genera un token para autenticarte con servicios externos que utilizan el Model Context Protocol
                                </p>
                                <button
                                    onClick={generateMcpToken}
                                    disabled={isGenerating}
                                    className="flex items-center gap-2 px-6 py-3 bg-[var(--solar-gold)] text-slate-900 rounded-xl font-medium hover:bg-[var(--solar-gold-hover)] transition-colors disabled:opacity-50 mx-auto"
                                >
                                    {isGenerating ? <Loader2 className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5" />}
                                    {isGenerating ? 'Generando...' : 'Generar Token'}
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div className="p-4 bg-slate-500/10 rounded-xl border border-[var(--border-ui)]">
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="text-sm font-medium text-[var(--text-primary)]">Tu Token MCP</label>
                                        <span className="text-xs text-[var(--text-secondary)]">
                                            {mcpTokenCreatedAt ? `Creado el ${new Date(mcpTokenCreatedAt).toLocaleDateString()}` : ''}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type={showToken ? 'text' : 'password'}
                                            value={mcpToken}
                                            readOnly
                                            className="flex-1 px-4 py-3 rounded-xl border border-[var(--border-ui)] bg-slate-500/5 text-[var(--text-primary)] font-mono text-sm"
                                        />
                                        <button
                                            onClick={() => setShowToken(!showToken)}
                                            className="p-3 rounded-xl border border-[var(--border-ui)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-slate-500/10"
                                        >
                                            {showToken ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                        </button>
                                        <button
                                            onClick={copyToken}
                                            className="p-3 rounded-xl border border-[var(--border-ui)] text-[var(--text-secondary)] hover:text-[var(--solar-gold)] hover:bg-slate-500/10"
                                        >
                                            {copiedToken ? <Check className="h-5 w-5 text-emerald-500" /> : <Copy className="h-5 w-5" />}
                                        </button>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={generateMcpToken}
                                        disabled={isGenerating}
                                        className="flex items-center gap-2 px-6 py-3 bg-[var(--solar-gold)] text-slate-900 rounded-xl font-medium hover:bg-[var(--solar-gold-hover)] transition-colors disabled:opacity-50"
                                    >
                                        {isGenerating ? <Loader2 className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5" />}
                                        Regenerar Token
                                    </button>
                                    <button
                                        onClick={revokeMcpToken}
                                        disabled={isRevoking}
                                        className="flex items-center gap-2 px-6 py-3 border border-red-500/50 text-red-500 rounded-xl font-medium hover:bg-red-500/10 transition-colors disabled:opacity-50"
                                    >
                                        {isRevoking ? <Loader2 className="h-5 w-5 animate-spin" /> : <Trash2 className="h-5 w-5" />}
                                        Revocar Token
                                    </button>
                                </div>

                                <div className="mt-6 p-4 bg-amber-500/10 rounded-xl border border-amber-500/20">
                                    <p className="text-sm text-amber-500 font-medium mb-1">Importante</p>
                                    <p className="text-sm text-[var(--text-secondary)]">
                                        Guarda este token en un lugar seguro. No se mostrará nuevamente después de esta sesión.
                                        Puedes revocarlo y generar uno nuevo cuando lo necesites.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}