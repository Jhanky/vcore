import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router, usePage } from '@inertiajs/react';
import { useState, useCallback, useMemo } from 'react';
import { Plus, Edit, Users, Shield, RefreshCw, Eye, EyeOff, Check, X, Camera, Image as ImageIcon, UserX } from 'lucide-react';
import { DataTable, Column } from '@/Components/DataTable';
import ConfirmModal from '@/Components/ConfirmModal';
import Modal from '@/Components/Modal';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import { showToast } from '@/Components/Toast';
import { cn } from '@/utils/cn';

type Tab = 'users' | 'roles';

export default function AccessControlIndex({
    users,
    roles,
    allRoles
}: any) {
    const { auth } = usePage<any>().props;
    const [activeTab, setActiveTab] = useState<Tab>('users');

    // ==================== USERS ====================
    const [userModal, setUserModal] = useState<{ show: boolean; user: any | null }>({ show: false, user: null });
    const [confirmUserDelete, setConfirmUserDelete] = useState<{ show: boolean; id: number | null; name: string }>({
        show: false, id: null, name: ''
    });
    const [deletingUser, setDeletingUser] = useState(false);
    const [deletingRole, setDeletingRole] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const userForm = useForm({
        name: '',
        username: '',
        email: '',
        password: '',
        password_confirmation: '',
        profile_photo: null as File | null,
        role: '',
        roles: [] as string[],
    });
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);

    const openUserModal = (user: any = null) => {
        if (user) {
            userForm.setData({
                name: user.name,
                username: user.username || '',
                email: user.email,
                password: '',
                password_confirmation: '',
                profile_photo: null,
                role: user.roles.length > 0 ? user.roles[0].name : '',
                roles: user.roles.map((r: any) => r.name),
            });
            setPhotoPreview(user.profile_photo_path ? `/storage/${user.profile_photo_path}` : null);
        } else {
            userForm.reset();
            setPhotoPreview(null);
        }
        setShowPassword(false);
        setShowConfirmPassword(false);
        setUserModal({ show: true, user });
    };

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            userForm.setData('profile_photo', file);
            const reader = new FileReader();
            reader.onload = (ev) => setPhotoPreview(ev.target?.result as string);
            reader.readAsDataURL(file);
        }
    };

    const submitUser = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        if (userModal.user) {
            userForm.put(route('access-control.users.update', userModal.user.id), {
                onSuccess: () => {
                    setUserModal({ show: false, user: null });
                    setSubmitting(false);
                    showToast('Usuario actualizado.', 'success');
                },
                onError: () => {
                    setSubmitting(false);
                },
            });
        } else {
            userForm.post(route('access-control.users.store'), {
                onSuccess: () => {
                    setUserModal({ show: false, user: null });
                    setSubmitting(false);
                    showToast('Usuario creado.', 'success');
                },
                onError: () => {
                    setSubmitting(false);
                },
            });
        }
    };

    const handleDeleteUser = useCallback((id: number, name: string) => {
        setConfirmUserDelete({ show: true, id, name });
    }, []);

    const onConfirmDeleteUser = () => {
        if (confirmUserDelete.id) {
            setDeletingUser(true);
            router.delete(route('access-control.users.destroy', confirmUserDelete.id), {
                preserveScroll: true,
                onSuccess: () => {
                    setConfirmUserDelete({ show: false, id: null, name: '' });
                    setDeletingUser(false);
                    showToast('Usuario deshabilitado.', 'success');
                },
                onError: () => {
                    setDeletingUser(false);
                },
            });
        }
    };

    const handlePerPageUsers = useCallback((perPage: number) => {
        router.get(route('access-control.index'), { per_page: perPage }, { preserveState: true, preserveScroll: true });
    }, []);

    const toggleUserRole = (roleName: string) => {
        const has = userForm.data.roles.includes(roleName);
        if (has) {
            userForm.setData('roles', userForm.data.roles.filter((r: string) => r !== roleName));
        } else {
            userForm.setData('roles', [...userForm.data.roles, roleName]);
        }
    };

    const generateSecurePassword = () => {
        const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
        let password = '';
        const rand = new Uint32Array(16);
        crypto.getRandomValues(rand);
        for (let i = 0; i < 16; i++) {
            password += chars[rand[i] % chars.length];
        }
        userForm.setData('password', password);
        userForm.setData('password_confirmation', password);
        setShowPassword(true);
        setShowConfirmPassword(true);
    };

    const passwordRequirements = useMemo(() => ({
        length: userForm.data.password.length >= 8,
        uppercase: /[A-Z]/.test(userForm.data.password),
        lowercase: /[a-z]/.test(userForm.data.password),
        number: /[0-9]/.test(userForm.data.password),
        special: /[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(userForm.data.password),
    }), [userForm.data.password]);

    const isPasswordValid = useMemo(() => (
        passwordRequirements.length &&
        passwordRequirements.uppercase &&
        passwordRequirements.lowercase &&
        passwordRequirements.number &&
        passwordRequirements.special
    ), [passwordRequirements]);

    const passwordsMatch = useMemo(() => (
        userForm.data.password.length > 0 &&
        userForm.data.password === userForm.data.password_confirmation
    ), [userForm.data.password, userForm.data.password_confirmation]);

    const userColumns: Column<any>[] = [
        {
            key: 'name',
            label: 'Nombre',
            render: (u) => <span className="font-bold text-[var(--text-primary)]">{u.name}</span>,
        },
        {
            key: 'email',
            label: 'Email',
            hideOnMobile: true,
            render: (u) => <span className="text-[var(--text-secondary)]">{u.email}</span>,
        },
        {
            key: 'is_active',
            label: 'Estado',
            render: (u) => (
                u.deleted_at ? (
                    <span className="px-3 py-1 bg-red-500/10 border border-red-500/20 text-red-400 rounded-full text-xs font-bold">
                        Deshabilitado
                    </span>
                ) : (
                    <span className="px-3 py-1 bg-green-500/10 border border-green-500/20 text-green-400 rounded-full text-xs font-bold">
                        Activo
                    </span>
                )
            ),
        },
        {
            key: 'roles',
            label: 'Roles',
            render: (u) => (
                <div className="flex gap-2 flex-wrap">
                    {u.roles.map((r: any) => (
                        <span key={r.id} className="px-3 py-1 bg-violet-500/10 border border-violet-500/20 text-violet-400 rounded-full text-xs font-bold uppercase">
                            {r.name}
                        </span>
                    ))}
                    {u.roles.length === 0 && <span className="text-slate-500">-</span>}
                </div>
            ),
        },
    ];

    // ==================== ROLES ====================
    const [roleModal, setRoleModal] = useState<{ show: boolean; role: any | null }>({ show: false, role: null });
    const [confirmRoleDelete, setConfirmRoleDelete] = useState<{ show: boolean; id: number | null; name: string }>({
        show: false, id: null, name: ''
    });

    const roleForm = useForm({
        name: '',
    });

    const openRoleModal = (role: any) => {
        if (!role) return;
        roleForm.setData({ name: role.name });
        setRoleModal({ show: true, role });
    };

    const submitRole = (e: React.FormEvent) => {
        e.preventDefault();
        if (roleModal.role) {
            roleForm.put(route('access-control.roles.update', roleModal.role.id), {
                onSuccess: () => {
                    setRoleModal({ show: false, role: null });
                    showToast('Rol actualizado.', 'success');
                },
            });
        } else {
            roleForm.post(route('access-control.roles.store'), {
                onSuccess: () => {
                    setRoleModal({ show: false, role: null });
                    showToast('Rol creado.', 'success');
                },
            });
        }
    };

    const handleDeleteRole = useCallback((id: number, name: string) => {
        setConfirmRoleDelete({ show: true, id, name });
    }, []);

    const onConfirmDeleteRole = () => {
        if (confirmRoleDelete.id) {
            setDeletingRole(true);
            router.delete(route('access-control.roles.destroy', confirmRoleDelete.id), {
                preserveScroll: true,
                onSuccess: () => {
                    setConfirmRoleDelete({ show: false, id: null, name: '' });
                    setDeletingRole(false);
                    showToast('Rol eliminado.', 'success');
                },
                onError: () => {
                    setDeletingRole(false);
                },
            });
        }
    };

    return (
        <AuthenticatedLayout header="Control de Acceso">
            <Head title="Control de Acceso" />

            {/* Tabs */}
            <div className="flex gap-2 mb-6">
                <button
                    onClick={() => setActiveTab('users')}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${
                        activeTab === 'users'
                            ? 'bg-[var(--solar-gold)] text-slate-900 shadow-lg'
                            : 'bg-[var(--surface)] border border-[var(--border-ui)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--solar-gold)]/50'
                    }`}
                >
                    <Users className="h-4 w-4" />
                    Usuarios
                </button>
                <button
                    onClick={() => setActiveTab('roles')}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${
                        activeTab === 'roles'
                            ? 'bg-[var(--solar-gold)] text-slate-900 shadow-lg'
                            : 'bg-[var(--surface)] border border-[var(--border-ui)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--solar-gold)]/50'
                    }`}
                >
                    <Shield className="h-4 w-4" />
                    Roles
                </button>
            </div>

            {/* USERS TAB */}
            {activeTab === 'users' && (
                <DataTable
                    data={users.data}
                    columns={userColumns}
                    searchPlaceholder="Buscar usuario..."
                    emptyMessage="No hay usuarios"
                    pagination={users}
                    onPerPageChange={handlePerPageUsers}
                    actions={(u) => (
                        <>
                            <button
                                onClick={() => openUserModal(u)}
                                className="inline-flex p-2 rounded-xl hover:bg-[var(--solar-gold)]/10 text-[var(--text-secondary)] hover:text-[var(--solar-gold)] transition-all"
                                title="Editar"
                            >
                                <Edit className="h-4 w-4" />
                            </button>
                            {u.deleted_at === null && u.id !== auth?.id && (
                                <button
                                    onClick={() => handleDeleteUser(u.id, u.name)}
                                    className="inline-flex p-2 rounded-xl hover:bg-red-500/10 text-[var(--text-secondary)] hover:text-red-400 transition-all"
                                    title="Deshabilitar"
                                >
                                    <UserX className="h-4 w-4" />
                                </button>
                            )}
                        </>
                    )}
                    headerAction={
                        <button
                            onClick={() => openUserModal()}
                            className="flex items-center gap-2 bg-[var(--solar-gold)] text-slate-900 font-bold px-5 py-2.5 rounded-xl hover:brightness-110 transition-all shadow-lg"
                        >
                            <Plus className="h-4 w-4" />
                            <span>Nuevo Usuario</span>
                        </button>
                    }
                />
            )}

            {/* ROLES TAB */}
            {activeTab === 'roles' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {roles.data.map((r: any) => (
                        <div
                            key={r.id}
                            className="glass rounded-[2rem] p-6 border border-[var(--border-ui)]/30 hover:border-[var(--solar-gold)]/30 transition-all group"
                        >
                                <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-[var(--solar-gold)]/10 flex items-center justify-center">
                                        <Shield className="h-5 w-5 text-[var(--solar-gold)]" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-[var(--text-primary)] capitalize font-outfit">{r.name}</h3>
                                    </div>
                                </div>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => openRoleModal(r)}
                                        className="inline-flex p-2 rounded-xl hover:bg-[var(--solar-gold)]/10 text-[var(--text-secondary)] hover:text-[var(--solar-gold)] transition-all"
                                        title="Editar"
                                    >
                                        <Edit className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* USER MODAL */}
            <Modal show={userModal.show} onClose={() => !userForm.processing && setUserModal({ show: false, user: null })} maxWidth="2xl">
                <div className="p-4 sm:p-6 bg-[var(--surface)] text-[var(--text-primary)]">
                    <h2 className="text-xl font-bold font-outfit mb-6 text-[var(--solar-gold)]">
                        {userModal.user ? 'Editar Usuario' : 'Nuevo Usuario'}
                    </h2>
                    <form onSubmit={submitUser} className="space-y-4">
                        {/* Foto de Perfil */}
                        <div className="mb-6 flex flex-col items-center">
                            <div className="relative">
                                <div className="w-24 h-24 rounded-full bg-[var(--surface)] border-2 border-dashed border-[var(--border-ui)] overflow-hidden flex items-center justify-center">
                                    {photoPreview ? (
                                        <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                                    ) : (
                                        <ImageIcon className="h-8 w-8 text-slate-500" />
                                    )}
                                </div>
                                <label className="absolute -bottom-1 -right-1 bg-[var(--solar-gold)] text-slate-900 p-1.5 rounded-full cursor-pointer hover:brightness-110 transition-all shadow-lg">
                                    <Camera className="h-4 w-4" />
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handlePhotoChange}
                                        className="hidden"
                                    />
                                </label>
                            </div>
                            {userForm.errors.profile_photo && <p className="text-red-400 text-xs mt-1">{userForm.errors.profile_photo}</p>}
                            {photoPreview && (
                                <button type="button" onClick={() => { setPhotoPreview(null); userForm.setData('profile_photo', null); }} className="mt-2 text-xs text-red-400 hover:text-red-300">
                                    Eliminar foto
                                </button>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <InputLabel htmlFor="name" value="Nombre *" />
                                <TextInput
                                    id="name"
                                    className="mt-1 block w-full"
                                    value={userForm.data.name}
                                    onChange={(e) => userForm.setData('name', e.target.value)}
                                    required
                                />
                                <InputError message={userForm.errors.name} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="username" value="Nombre de Usuario *" />
                                <TextInput
                                    id="username"
                                    className="mt-1 block w-full"
                                    value={userForm.data.username}
                                    onChange={(e) => userForm.setData('username', e.target.value)}
                                    required
                                />
                                <InputError message={userForm.errors.username} className="mt-2" />
                            </div>
                        </div>

                        <div>
                            <InputLabel htmlFor="email" value="Email *" />
                            <TextInput
                                id="email"
                                type="email"
                                className="mt-1 block w-full"
                                value={userForm.data.email}
                                onChange={(e) => userForm.setData('email', e.target.value)}
                                required
                            />
                            <InputError message={userForm.errors.email} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="password">
                                Contraseña * {userModal.user && <span className="text-xs font-normal opacity-70">(Dejar en blanco para mantener)</span>}
                            </InputLabel>
                            <div className="relative">
                                <TextInput
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    className="mt-1 block w-full pr-20"
                                    value={userForm.data.password}
                                    onChange={(e) => userForm.setData('password', e.target.value)}
                                    required={!userModal.user}
                                />
                                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1 mt-1">
                                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="p-1.5 rounded-xl hover:bg-slate-500/20 text-[var(--text-secondary)]" title={showPassword ? 'Ocultar' : 'Mostrar'}>
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                    <button type="button" onClick={generateSecurePassword} className="p-1.5 rounded-xl hover:bg-slate-500/20 text-[var(--text-secondary)]" title="Generar contraseña segura">
                                        <RefreshCw className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                            <InputError message={userForm.errors.password} className="mt-2" />
                            {!userModal.user && userForm.data.password && (
                                <div className="mt-2 p-3 rounded-xl bg-[var(--surface)] border border-[var(--border-ui)]">
                                    <p className="text-xs font-bold text-[var(--text-secondary)] mb-2">Requisitos de contraseña:</p>
                                    <div className="grid grid-cols-2 gap-1 text-xs">
                                        <div className="flex items-center gap-1">
                                            {passwordRequirements.length ? <Check className="h-3 w-3 text-green-400" /> : <X className="h-3 w-3 text-red-400" />}
                                            <span className={passwordRequirements.length ? 'text-green-400' : 'text-red-400'}>Mínimo 8 caracteres</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            {passwordRequirements.uppercase ? <Check className="h-3 w-3 text-green-400" /> : <X className="h-3 w-3 text-red-400" />}
                                            <span className={passwordRequirements.uppercase ? 'text-green-400' : 'text-red-400'}>Una mayúscula</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            {passwordRequirements.lowercase ? <Check className="h-3 w-3 text-green-400" /> : <X className="h-3 w-3 text-red-400" />}
                                            <span className={passwordRequirements.lowercase ? 'text-green-400' : 'text-red-400'}>Una minúscula</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            {passwordRequirements.number ? <Check className="h-3 w-3 text-green-400" /> : <X className="h-3 w-3 text-red-400" />}
                                            <span className={passwordRequirements.number ? 'text-green-400' : 'text-red-400'}>Un número</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            {passwordRequirements.special ? <Check className="h-3 w-3 text-green-400" /> : <X className="h-3 w-3 text-red-400" />}
                                            <span className={passwordRequirements.special ? 'text-green-400' : 'text-red-400'}>Un carácter especial</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div>
                            <InputLabel htmlFor="password_confirmation" value="Confirmar Contraseña *" />
                            <div className="relative">
                                <TextInput
                                    id="password_confirmation"
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    className="mt-1 block w-full"
                                    value={userForm.data.password_confirmation}
                                    onChange={(e) => userForm.setData('password_confirmation', e.target.value)}
                                    required={!userModal.user && userForm.data.password.length > 0}
                                />
                                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-xl hover:bg-slate-500/20 text-[var(--text-secondary)]" title={showConfirmPassword ? 'Ocultar' : 'Mostrar'}>
                                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                            {userForm.data.password_confirmation && !passwordsMatch && (
                                <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                                    <X className="h-3 w-3" /> Las contraseñas no coinciden
                                </p>
                            )}
                            <InputError message={userForm.errors.password_confirmation} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="role" value="Rol *" />
                            <select
                                id="role"
                                value={userForm.data.role}
                                onChange={(e) => userForm.setData('role', e.target.value)}
                                className="mt-1 block w-full p-3 rounded-xl bg-[var(--surface)] border border-[var(--border-ui)] focus:border-[var(--solar-gold)] text-[var(--text-primary)]"
                                required
                            >
                                <option value="">Seleccionar rol...</option>
                                {allRoles.map((r: any) => (
                                    <option key={r.id} value={r.name} className="capitalize">{r.name}</option>
                                ))}
                            </select>
                            <InputError message={userForm.errors.role} className="mt-2" />
                        </div>

                        <div className="mt-6 flex justify-end gap-3">
                            <SecondaryButton onClick={() => setUserModal({ show: false, user: null })} disabled={userForm.processing} className="border-[var(--border-ui)] text-[var(--text-secondary)]">
                                Cancelar
                            </SecondaryButton>
                            <PrimaryButton
                                disabled={userForm.processing || (!userModal.user && !passwordsMatch)}
                                isLoading={userForm.processing}
                                className="bg-[var(--solar-gold)] text-slate-900 hover:brightness-110"
                            >
                                {userForm.processing ? 'Procesando...' : (userModal.user ? 'Actualizar' : 'Guardar')}
                            </PrimaryButton>
                        </div>
                    </form>
                </div>
            </Modal>

            {/* ROLE MODAL */}
            <Modal show={roleModal.show} onClose={() => { if (!roleForm.processing) setRoleModal({ show: false, role: null }); }} maxWidth="2xl">
                <div className="p-4 sm:p-6 bg-[var(--surface)] text-[var(--text-primary)]">
                    <h3 className="text-xl font-bold font-outfit mb-6">
                        {roleModal.role ? 'Editar Rol' : 'Nuevo Rol'}
                    </h3>
                    <form onSubmit={submitRole}>
                        <div className="mb-4">
                            <label className="block text-sm font-bold text-[var(--text-secondary)] mb-2 font-outfit">Nombre del Rol</label>
                            <input
                                type="text"
                                value={roleForm.data.name}
                                onChange={(e) => roleForm.setData('name', e.target.value)}
                                className="w-full py-3 px-4 rounded-2xl bg-[var(--surface)] border border-[var(--border-ui)] focus:border-[var(--solar-gold)] focus:ring focus:ring-[var(--solar-gold)]/20 text-[var(--text-primary)]"
                                required
                                disabled={roleModal.role?.name === 'admin'}
                            />
                            {roleForm.errors.name && <p className="text-red-400 text-xs mt-1">{roleForm.errors.name}</p>}
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border-ui)]/50">
                            <button type="button" onClick={() => setRoleModal({ show: false, role: null })} className="px-5 py-2.5 rounded-xl font-bold bg-[var(--surface)] text-[var(--text-primary)] hover:bg-slate-500/20">
                                Cancelar
                            </button>
                            <button type="submit" disabled={roleForm.processing} className="px-5 py-2.5 rounded-xl font-bold bg-[var(--solar-gold)] text-slate-900 hover:brightness-110 disabled:opacity-50">
                                Guardar
                            </button>
                        </div>
                    </form>
                </div>
            </Modal>

            {/* DELETE USER MODAL */}
            <ConfirmModal
                show={confirmUserDelete.show}
                onClose={() => setConfirmUserDelete({ ...confirmUserDelete, show: false })}
                onConfirm={onConfirmDeleteUser}
                title="Deshabilitar Usuario"
                message={`¿Estás seguro de deshabilitar al usuario ${confirmUserDelete.name}? El usuario no podrá iniciar sesión pero sus registros permanecerán accesibles.`}
                confirmLabel="Deshabilitar"
                variant="danger"
                processing={deletingUser}
            />
        </AuthenticatedLayout>
    );
}