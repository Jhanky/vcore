import { useState, useCallback } from 'react';
import { router, Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { DataTable } from '@/Components/DataTable';
import EvidenceForm from '@/features/evidences/components/EvidenceForm';
import { FileText, MapPin, Calendar, CheckCircle2, Eye } from 'lucide-react';

export default function EvidencesPage({ projects, filters }) {
    const [selectedProject, setSelectedProject] = useState(null);

    const handleSearch = useCallback((search) => {
        router.get(
            route('evidences.index'),
            { search, per_page: projects.per_page },
            { preserveState: true, replace: true }
        );
    }, [filters, projects.per_page]);

    const handlePerPageChange = useCallback((perPage) => {
        router.get(
            route('evidences.index'),
            { search: filters.search, per_page: perPage },
            { preserveState: true, replace: true }
        );
    }, [filters]);

    const columns = [
        {
            key: 'code',
            label: 'Código',
            render: (project) => (
                <button
                    onClick={() => setSelectedProject(project)}
                    className={`text-left ${selectedProject?.id === project.id ? 'text-[var(--solar-gold)]' : 'text-[var(--solar-gold)] hover:brightness-125'} font-bold transition-all`}
                >
                    {project.code}
                </button>
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
            key: 'documents',
            label: 'Docs',
            render: (project) => (
                <div className="flex items-center gap-1 text-sm">
                    <FileText className="w-4 h-4 text-[var(--text-secondary)]" />
                    <span className="text-[var(--text-primary)] font-medium">
                        {project.documents?.length || 0}
                    </span>
                </div>
            ),
        },
    ];

    return (
        <AuthenticatedLayout header="Gestión de Evidencias">
            <Head title="Evidencias" />
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <div className="lg:col-span-2">
                    <div className="glass rounded-[2rem] p-6 border border-[var(--border-ui)]/30">
                        <h2 className="text-lg font-bold font-outfit text-[var(--text-primary)] mb-4 flex items-center gap-2">
                            <FileText className="w-5 h-5 text-[var(--solar-gold)]" />
                            Seleccionar Proyecto
                        </h2>
                        <DataTable
                            data={projects.data}
                            columns={columns}
                            searchPlaceholder="Buscar por código o nombre..."
                            emptyMessage="No se encontraron proyectos"
                            pagination={projects}
                            onSearch={handleSearch}
                            onPerPageChange={handlePerPageChange}
                            actions={(project) => (
                                <button
                                    onClick={() => setSelectedProject(project)}
                                    className={`inline-flex p-2 rounded-xl transition-all ${
                                        selectedProject?.id === project.id
                                            ? 'bg-[var(--solar-gold)]/20 text-[var(--solar-gold)]'
                                            : 'hover:bg-[var(--solar-gold)]/10 text-[var(--text-secondary)] hover:text-[var(--solar-gold)]'
                                    }`}
                                    title="Seleccionar proyecto"
                                >
                                    <Eye className="h-5 w-5" />
                                </button>
                            )}
                        />
                    </div>
                </div>

                <div className="lg:col-span-3">
                    {selectedProject ? (
                        <EvidenceForm project={selectedProject} />
                    ) : (
                        <div className="glass rounded-[2rem] p-12 border border-[var(--border-ui)]/30 h-full flex items-center justify-center">
                            <div className="text-center">
                                <FileText className="w-16 h-16 text-[var(--text-secondary)]/20 mx-auto mb-4" />
                                <p className="text-[var(--text-secondary)]">
                                    Seleccione un proyecto para cargar evidencias
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
