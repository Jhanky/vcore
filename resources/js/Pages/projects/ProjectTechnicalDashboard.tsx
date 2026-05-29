import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { ArrowLeft, FileText, GitBranch, Flag, FolderOpen } from 'lucide-react';
import { Link } from '@inertiajs/react';
import ProjectGeneralInfo from '@/features/projects/components/ProjectGeneralInfo';
import ProjectWorkflowTab from '@/features/projects/components/ProjectWorkflowTab';
import ProjectMilestonesTimeline from '@/features/projects/components/ProjectMilestonesTimeline';
import ProjectDocumentsTab from '@/features/projects/components/ProjectDocumentsTab';

interface ProjectTechnicalDashboardProps {
    project: any;
    availableStates?: any;
    requirements?: any;
    milestoneTypes?: any;
}

/**
 * Dashboard Técnico de Proyecto
 * Muestra información técnica del proyecto con tabs para:
 * - Info General
 * - Workflow
 * - Hitos
 * - Documentos
 */
export default function ProjectTechnicalDashboard({
    project,
    availableStates,
    requirements,
    milestoneTypes
}: ProjectTechnicalDashboardProps) {
    const [activeTab, setActiveTab] = useState('info');

    const tabs = [
        { id: 'info', label: 'Info General', icon: FileText },
        { id: 'workflow', label: 'Workflow', icon: GitBranch },
        { id: 'milestones', label: 'Hitos', icon: Flag },
        { id: 'documents', label: 'Documentos', icon: FolderOpen },
    ];

    return (
        <AuthenticatedLayout>
            <div className="py-6">
                <div className="w-full px-4 sm:px-6 lg:px-8">
                    {/* Breadcrumb */}
                    <div className="mb-6">
                        <Link
                            href={route('projects.index')}
                            className="inline-flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--solar-gold)] transition-colors"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Volver a Proyectos
                        </Link>
                    </div>

                    {/* Header del proyecto */}
                    <div className="glass rounded-[2rem] p-8 mb-6">
                        <h1 className="text-2xl font-bold font-outfit text-[var(--text-primary)]">
                            Dashboard Técnico
                        </h1>
                        <p className="text-sm text-[var(--text-secondary)] mt-1">
                            {project.name} • {project.code}
                        </p>
                    </div>

                    {/* Tabs de navegación */}
                    <div className="mb-6">
                        <div className="border-b border-[var(--border-ui)]">
                            <nav className="-mb-px flex space-x-4">
                                {tabs.map((tab) => {
                                    const Icon = tab.icon;
                                    return (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id)}
                                            className={`inline-flex items-center gap-2 px-3 py-2 border-b-2 text-sm font-medium transition-colors ${
                                                activeTab === tab.id
                                                    ? 'border-[var(--solar-gold)] text-[var(--solar-gold)]'
                                                    : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-ui)]'
                                            }`}
                                        >
                                            <Icon className="w-4 h-4" />
                                            {tab.label}
                                        </button>
                                    );
                                })}
                            </nav>
                        </div>
                    </div>

                    {/* Contenido de tabs */}
                    <div className="mt-6">
                        {activeTab === 'info' && (
                            <ProjectGeneralInfo project={project} />
                        )}

                        {activeTab === 'workflow' && (
                            <ProjectWorkflowTab
                                project={project}
                                availableStates={availableStates || []}
                            />
                        )}

                        {activeTab === 'milestones' && (
                            <ProjectMilestonesTimeline
                                project={project}
                                milestones={project.milestones || []}
                                milestoneTypes={milestoneTypes || []}
                                onComplete={() => {}}
                            />
                        )}

                        {activeTab === 'documents' && (
                            <ProjectDocumentsTab project={project} />
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}