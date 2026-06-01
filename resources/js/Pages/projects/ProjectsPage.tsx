import { useState, useCallback, useMemo } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { MapPin, Calendar, Eye, Trash2, Pencil, Plus, Briefcase, Activity, CheckCircle2, DollarSign } from 'lucide-react';
import { DataTable } from '@/Components/DataTable';
import ProjectDeleteModal from '@/features/projects/components/ProjectDeleteModal';
import { showToast } from '@/Components/Toast';
import { formatCurrency, formatDate } from '@/utils/format';
import { cn } from '@/utils/cn';

const PHASE_LABELS = {
    commercial: 'Comercial',
    technical: 'Técnica',
    legal: 'Legal',
    completed: 'Completada',
};

const PHASE_COLORS = {
    commercial: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    technical: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    legal: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    completed: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
};

interface ProjectsPageProps {
        projects: any;
        states: any[];
    statistics: any;
    filters: any;
}

export default function ProjectsPage({ projects, states, statistics, filters }: ProjectsPageProps) {
    const activeFilterKey = useMemo(() => {
        if (filters.is_active === 'true') return 'active';
        if (filters.is_active === 'false') return 'inactive';
        if (filters.state_id) {
            const completedStates = states.filter(s => s.phase === 'completed').map(s => s.id.toString());
            if (completedStates.includes(filters.state_id)) return 'completed';
        }
        return null;
    }, [filters, states]);

    const navigateWithFilters = useCallback((params: Record<string, any>) => {
        router.get(
            route('projects.index'),
            { ...filters, search: filters.search, per_page: projects.per_page, ...params },
            { preserveState: true, replace: true }
        );
    }, [filters, projects.per_page]);

    const handleSearch = useCallback((search: string) => {
        navigateWithFilters({ search });
    }, [navigateWithFilters]);

    const handleFilterChange = useCallback((key: string, value: string) => {
        navigateWithFilters({ [key]: value || undefined });
    }, [navigateWithFilters]);

    const handlePerPageChange = useCallback((perPage: number) => {
        navigateWithFilters({ per_page: perPage });
    }, [navigateWithFilters]);

    const applyFilterPreset = useCallback((preset: string) => {
        switch (preset) {
            case 'active':
                navigateWithFilters({ is_active: 'true', state_id: undefined });
                break;
            case 'inactive':
                navigateWithFilters({ is_active: 'false', state_id: undefined });
                break;
            case 'completed': {
                const completedStates = states.filter(s => s.phase === 'completed');
                if (completedStates.length > 0) {
                    navigateWithFilters({ state_id: completedStates[0].id.toString(), is_active: undefined });
                }
                break;
            }
            default:
                navigateWithFilters({ state_id: undefined, is_active: undefined, priority: undefined });
        }
    }, [states, navigateWithFilters]);

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deletingProject, setDeletingProject] = useState(null);

    const handleDelete = (project: any) => {
        setDeletingProject(project);
        setShowDeleteModal(true);
    };

    const handleConfirmDelete = (project: any) => {
        router.delete(route('projects.destroy', project.id), {
            preserveScroll: true,
            onSuccess: () => {
                setShowDeleteModal(false);
                setDeletingProject(null);
                showToast('Proyecto eliminado.', 'success');
            },
        });
    };



    const columns = [
        {
            key: 'code',
            label: 'Código',
            render: (project: any) => (
                <Link href={route('projects.show', project.id)} className="text-[var(--solar-gold)] hover:brightness-110 font-bold">
                    {project.code}
                </Link>
            ),
        },
        {
            key: 'name',
            label: 'Proyecto',
            render: (project: any) => (
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
            render: (project: any) => (
                <div className="text-sm text-[var(--text-primary)]">{project.client?.name}</div>
            ),
        },
        {
            key: 'phase',
            label: 'Fase',
            render: (project: any) => {
                const phaseKey = (project.current_state?.phase || 'commercial') as keyof typeof PHASE_COLORS;
                const colors = PHASE_COLORS[phaseKey];
                return (
                    <span className={`px-3 py-1 inline-flex text-xs font-bold rounded-full border shadow-sm ${colors}`}>
                        {PHASE_LABELS[phaseKey] || '-'}
                    </span>
                );
            },
        },
        {
            key: 'status',
            label: 'Estado',
            render: (project: any) => {
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
            render: (project: any) => {
                const colors: Record<string, string> = {
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
            key: 'created_at',
            label: 'Fecha Creación',
            render: (project: any) => (
                <div className="flex items-center gap-2">
                    <span className="text-sm text-[var(--text-secondary)]">{formatDate(project.created_at)}</span>
                </div>
            ),
        },
        {
            key: 'value',
            label: 'Valor',
            render: (project: any) => (
                <div className="text-sm font-bold text-[var(--text-primary)]">
                    {project.contracted_value_cop
                        ? formatCurrency(project.contracted_value_cop)
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
    ];

    return (
        <AuthenticatedLayout header="Gestión de Proyectos">
            <Head title="Proyectos" />

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
                {[
                    { label: 'Total Proyectos', value: statistics.total, icon: Briefcase, color: 'text-blue-400', bg: 'from-blue-500/20 to-blue-500/5', border: 'border-blue-500/20', preset: null },
                    { label: 'Proyectos Activos', value: statistics.active, icon: Activity, color: 'text-emerald-400', bg: 'from-emerald-500/20 to-emerald-500/5', border: 'border-emerald-500/20', preset: 'active' },
                    { label: 'Completados', value: statistics.completed, icon: CheckCircle2, color: 'text-[var(--solar-gold)]', bg: 'from-[var(--solar-gold)]/20 to-[var(--solar-gold)]/5', border: 'border-[var(--solar-gold)]/20', preset: 'completed' },
                    { label: 'Valor Total', value: formatCurrency(statistics.total_contracted_value), icon: DollarSign, color: 'text-amber-400', bg: 'from-amber-500/20 to-amber-500/5', border: 'border-amber-500/20', preset: null },
                ].map(({ label, value, icon: Icon, color, bg, border, preset }) => {
                    const isClickable = preset !== null;
                    const isActive = preset === activeFilterKey;
                    const Card = isClickable ? 'button' : 'div';
                    return (
                        <Card
                            key={label}
                            onClick={() => isClickable ? applyFilterPreset(preset) : undefined}
                            className={`glass rounded-2xl p-5 border ${border} flex items-center gap-4 text-left transition-all ${
                                isClickable ? 'hover:scale-[1.02] cursor-pointer' : ''
                            } ${isActive ? 'ring-2 ring-[var(--solar-gold)] ring-offset-2 ring-offset-[var(--bg-main)]' : ''}`}
                        >
                            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${bg} border ${border} flex items-center justify-center flex-shrink-0`}>
                                <Icon className={`w-6 h-6 ${color}`} />
                            </div>
                            <div>
                                <p className="text-xs text-[var(--text-secondary)] uppercase tracking-wider font-outfit">{label}</p>
                                <p className={`text-xl font-bold font-outfit ${color}`}>{value}</p>
                            </div>
                        </Card>
                    );
                })}
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
                            title="Ver detalle"
                        >
                            <Eye className="h-5 w-5" />
                        </Link>
                        <Link
                            href={route('projects.edit', project.id)}
                            className="inline-flex p-2 rounded-xl hover:bg-blue-500/10 text-[var(--text-secondary)] hover:text-blue-400 transition-all"
                            title="Editar"
                        >
                            <Pencil className="h-5 w-5" />
                        </Link>
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
                    <Link
                        href={route('projects.create')}
                        className="flex items-center gap-2 bg-[var(--solar-gold)] text-slate-900 font-bold px-5 py-2.5 rounded-xl hover:brightness-110 transition-all shadow-lg"
                    >
                        <Plus className="h-4 w-4" />
                        <span>Nuevo Proyecto</span>
                    </Link>
                }
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
