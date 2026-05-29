import { useState } from 'react';
import { useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { ArrowLeft, FileText, History, MapPin, Flag, Building, FolderOpen } from 'lucide-react';
import { Link, usePage } from '@inertiajs/react';
import ProjectGeneralInfo from '@/features/projects/components/ProjectGeneralInfo';
import ProjectWorkflowTab from '@/features/projects/components/ProjectWorkflowTab';
import ProjectHistoryTab from '@/features/projects/components/ProjectHistoryTab';
import ProjectMilestonesTimeline from '@/features/projects/components/ProjectMilestonesTimeline';
import ProjectUpmeTab from '@/features/projects/components/ProjectUpmeTab';
import ProjectDocumentsTab from '@/features/projects/components/ProjectDocumentsTab';

interface ProjectDetailsPageProps {
    project: any;
    availableStates: any;
    requirements: any;
    milestoneTypes: any;
}

export default function ProjectDetailsPage({ project, availableStates, requirements, milestoneTypes }: ProjectDetailsPageProps) {
    const { auth } = usePage().props as any;
    const user = auth?.user;
    const isComercial = user?.roles?.includes('comercial');
    const [activeTab, setActiveTab] = useState('general');

    const allTabs = [
        { id: 'general', label: 'Información General', icon: FileText },
        { id: 'workflow', label: 'Workflow', icon: MapPin },
        { id: 'documents', label: 'Documentos', icon: FolderOpen },
        { id: 'history', label: 'Historial', icon: History },
        { id: 'milestones', label: 'Hitos', icon: Flag },
        { id: 'upme', label: 'UPME', icon: Building },
    ];

    const tabs = isComercial
        ? allTabs.filter(t => ['general', 'workflow', 'history', 'milestones'].includes(t.id))
        : allTabs;

    const { post: completeMilestone, processing: processingMilestone } = useForm();

    const handleCompleteMilestone = (milestoneId: number) => {
        if (confirm('¿Mark este hito como completado?')) {
            completeMilestone(route('projects.milestones.complete', [project.id, milestoneId]), {
                preserveScroll: true,
            });
        }
    };

    return (
        <AuthenticatedLayout>
            <div className="py-6">
                <div className="w-full px-4 sm:px-6 lg:px-8">
                    <div className="mb-6">
                        <Link
                            href={route('projects.index')}
                            className="inline-flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--solar-gold)] transition-colors"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Volver a Proyectos
                        </Link>
                    </div>

                    <div className="glass rounded-[2rem] p-8 mb-6">
                        <h1 className="text-2xl font-bold font-outfit text-[var(--text-primary)]">{project.name}</h1>
                        <p className="text-sm text-[var(--text-secondary)] mt-1">
                            {project.code} • Cliente: {project.client?.name}
                        </p>
                    </div>

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

                    <div className="mt-6">
                        {activeTab === 'general' && (
                            <ProjectGeneralInfo project={project} />
                        )}

                        {activeTab === 'workflow' && (
                            <ProjectWorkflowTab
                                project={project}
                                availableStates={availableStates}
                                isComercial={isComercial}
                            />
                        )}

                        {activeTab === 'documents' && (
                            <ProjectDocumentsTab project={project} />
                        )}

                        {activeTab === 'history' && (
                            <ProjectHistoryTab
                                history={project.state_history || []}
                                notes={project.notes || []}
                            />
                        )}

                        {activeTab === 'milestones' && (
                            <ProjectMilestonesTimeline
                                project={project}
                                milestones={project.milestones}
                                milestoneTypes={milestoneTypes}
                                onComplete={handleCompleteMilestone}
                                readOnly={isComercial}
                            />
                        )}

                        {activeTab === 'upme' && (
                            <ProjectUpmeTab
                                project={project}
                                upmeDetail={project.upme_detail}
                            />
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}