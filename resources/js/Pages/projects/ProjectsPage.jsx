import { useState, useCallback } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Plus, MapPin, Calendar, Eye, Pencil, Trash2, Briefcase, Activity, CheckCircle2, DollarSign } from 'lucide-react';
import { DataTable } from '@/Components/DataTable';
import ProjectModal from '@/features/projects/components/ProjectModal';
import ProjectDeleteModal from '@/features/projects/components/ProjectDeleteModal';
import { showToast } from '@/Components/Toast';
import PrimaryButton from '@/Components/PrimaryButton';

export default function ProjectsPage({ projects, states, statistics, filters }) {
    const [showModal, setShowModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [editingProject, setEditingProject] = useState(null);
    const [deletingProject, setDeletingProject] = useState(null);

    const handleSearch = useCallback((search) => {
        router.get(
            route('projects.index'),
            { search, state_id: filters.state_id, priority: filters.priority, is_active: filters.is_active, per_page: projects.per_page },
            { preserveState: true, replace: true }
        );
    }, [filters, projects.per_page]);

    const handleFilterChange = useCallback((key, value) => {
        router.get(
            route('projects.index'),
            { ...filters, search: filters.search, [key]: value, per_page: projects.per_page },
            { preserveState: true, replace: true }
        );
    }, [filters, projects.per_page]);

    const handlePerPageChange = useCallback((perPage) => {
        router.get(
            route('projects.index'),
            { search: filters.search, state_id: filters.state_id, priority: filters.priority, is_active: filters.is_active, per_page: perPage },
            { preserveState: true, replace: true }
        );
    }, [filters]);

    const handleEdit = (project) => {
        setEditingProject(project);
        setShowModal(true);
    };

    const handleDelete = (project) => {
        setDeletingProject(project);
        setShowDeleteModal(true);
    };

    const handleCreate = () => {
        setEditingProject(null);
        setShowModal(true);
    };

    const handleConfirmDelete = (project) => {
        router.delete(route('projects.destroy', project.id), {
            preserveScroll: true,
            onSuccess: () => {
                setShowDeleteModal(false);
                showToast('Proyecto eliminado.', 'success');
            },
        });
    };

    const formatCurrency = (value) => {
        if (!value) return '-';
        return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(value);
    };

    const columns = [
        {
            key: 'code',
            label: 'Código',
            render: (project) => (
                <Link
                    href={route('projects.show', project.id)}
                    className="text-[var(--solar-gold)] hover:brightness-110 font-bold"
                >
                    {project.code}
                </Link>
            ),
        },
        {
            key: 'name',
            label: 'Proyecto',
            render: (project) => (
                <div>
                    <div className="font-bold text-[var(--text-primary)]">{project.name}</div>
                    {project.installation_address && (
                        <div className="text-xs text-[var(--text-secondary)] flex items-center gap-1 mt-1">
                            <MapPin className="h-3 w-3" />
                            {project.installation_address}
                        </div>
                    )}
                </div>
            ),
        },
        {
            key: 'client',
            label: 'Cliente',
            render: (project) => (
                <div className="text-sm text-[var(--text-primary)]">{project.client?.name}</div>
            ),
        },
        {
            key: 'status',
            label: 'Estado',
            render: (project) => {
                const state = project.current_state;
                if (!state || !state.color) return <span className="text-[var(--text-secondary)]">-</span>;
                return (
                    <span
                        className="px-3 py-1 inline-flex text-xs font-bold rounded-full border shadow-sm"
                        style={{
                            backgroundColor: state.color + '15',
                            color: state.color,
                            borderColor: state.color + '40',
                        }}
                    >
                        {state.name}
                    </span>
                );
            },
        },
        {
            key: 'priority',
            label: 'Prioridad',
            render: (project) => {
                const colors = {
                    alta: 'bg-red-500/10 text-red-400 border-red-500/20',
                    media: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
                    baja: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
                };
                const colorClass = colors[project.priority] || 'bg-slate-500/10 text-[var(--text-secondary)] border-slate-500/20';
                return (
                    <span className={`px-3 py-1 inline-flex text-xs font-bold rounded-full border shadow-sm capitalize ${colorClass}`}>
                        {project.priority || '-'}
                    </span>
                );
            },
        },
        {
            key: 'start_date',
            label: 'Fecha Inicio',
            render: (project) => (
                <div className="text-sm text-[var(--text-secondary)] flex items-center gap-1">
                    {project.start_date ? (
                        <>
                            <Calendar className="w-3 h-3" />
                            {new Date(project.start_date).toLocaleDateString('es-CO')}
                        </>
                    ) : '-'}
                </div>
            ),
        },
        {
            key: 'value',
            label: 'Valor',
            render: (project) => (
                <div className="text-sm font-bold text-[var(--text-primary)]">
                    {project.contracted_value_cop
                        ? new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(project.contracted_value_cop)
                        : '-'}
                </div>
            ),
        },
    ];

    const dataTableFilters = [
        {
            key: 'state_id',
            label: 'Estado',
            options: states.map(s => ({ value: s.id.toString(), label: s.name }))
        },
        {
            key: 'priority',
            label: 'Prioridad',
            options: [
                { value: 'alta', label: 'Alta' },
                { value: 'media', label: 'Media' },
                { value: 'baja', label: 'Baja' }
            ]
        },
        {
            key: 'is_active',
            label: 'Estado Activo',
            options: [
                { value: 'true', label: 'Activos' },
                { value: 'false', label: 'Inactivos' }
            ]
        }
    ];

    return (
        <AuthenticatedLayout header="Gestión de Proyectos">
            <Head title="Proyectos" />

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
                {[
                    { label: 'Total Proyectos', value: statistics.total, icon: Briefcase, color: 'text-blue-400', bg: 'from-blue-500/20 to-blue-500/5', border: 'border-blue-500/20' },
                    { label: 'Proyectos Activos', value: statistics.active, icon: Activity, color: 'text-emerald-400', bg: 'from-emerald-500/20 to-emerald-500/5', border: 'border-emerald-500/20' },
                    { label: 'Completados', value: statistics.completed, icon: CheckCircle2, color: 'text-[var(--solar-gold)]', bg: 'from-[var(--solar-gold)]/20 to-[var(--solar-gold)]/5', border: 'border-[var(--solar-gold)]/20' },
                    { label: 'Valor Total', value: formatCurrency(statistics.total_contracted_value), icon: DollarSign, color: 'text-amber-400', bg: 'from-amber-500/20 to-amber-500/5', border: 'border-amber-500/20' },
                ].map(({ label, value, icon: Icon, color, bg, border }) => (
                    <div key={label} className={`glass rounded-2xl p-5 border ${border} flex items-center gap-4`}>
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${bg} border ${border} flex items-center justify-center flex-shrink-0`}>
                            <Icon className={`w-6 h-6 ${color}`} />
                        </div>
                        <div>
                            <p className="text-xs text-[var(--text-secondary)] uppercase tracking-wider">{label}</p>
                            <p className={`text-xl font-bold font-outfit ${color}`}>{value}</p>
                        </div>
                    </div>
                ))}
            </div>

            <DataTable
                data={projects.data}
                columns={columns}
                filters={dataTableFilters}
                searchPlaceholder="Buscar por código o nombre..."
                emptyMessage="No se encontraron proyectos"
                pagination={projects}
                onSearch={handleSearch}
                onFilterChange={handleFilterChange}
                onPerPageChange={handlePerPageChange}
                actions={(project) => (
                    <>
                        <Link
                            href={route('projects.show', project.id)}
                            className="inline-flex p-2 rounded-xl hover:bg-[var(--solar-gold)]/10 text-[var(--text-secondary)] hover:text-[var(--solar-gold)] transition-all"
                            title="Ver más información"
                        >
                            <Eye className="h-5 w-5" />
                        </Link>
                        <button
                            onClick={() => handleEdit(project)}
                            className="inline-flex p-2 rounded-xl hover:bg-blue-500/10 text-[var(--text-secondary)] hover:text-blue-400 transition-all"
                            title="Editar"
                        >
                            <Pencil className="h-5 w-5" />
                        </button>
                        <button
                            onClick={() => handleDelete(project)}
                            className="inline-flex p-2 rounded-xl hover:bg-red-500/10 text-[var(--text-secondary)] hover:text-red-400 transition-all"
                            title="Eliminar"
                        >
                            <Trash2 className="h-5 w-5" />
                        </button>
                    </>
                )}
                headerAction={
                    <PrimaryButton onClick={handleCreate}>
                        <Plus className="h-5 w-5" />
                        <span>Nuevo Proyecto</span>
                    </PrimaryButton>
                }
            />

            <ProjectModal
                show={showModal}
                onClose={() => {
                    setShowModal(false);
                    setEditingProject(null);
                }}
                project={editingProject}
                isEditing={!!editingProject}
            />

            <ProjectDeleteModal
                show={showDeleteModal}
                onClose={() => {
                    setShowDeleteModal(false);
                    setDeletingProject(null);
                }}
                project={deletingProject}
                onConfirm={handleConfirmDelete}
            />
        </AuthenticatedLayout>
    );
}
