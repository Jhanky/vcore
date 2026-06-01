import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useProjectTabs } from '@/features/projects/hooks/useProjectTabs';
import ProjectDetailsHeader from '@/features/projects/components/details/ProjectDetailsHeader';
import ProjectTabsBar from '@/features/projects/components/details/ProjectTabsBar';
import ProjectTabContent from '@/features/projects/components/details/ProjectTabContent';
import type { Project, MilestoneType, Supplier } from '@/features/projects/types';

interface ProjectDetailsPageProps {
    project: Project;
    availableStates: any;
    requirements: any;
    milestoneTypes: MilestoneType[];
    suppliers: Supplier[];
}

export default function ProjectDetailsPage({
    project,
    availableStates,
    requirements,
    milestoneTypes,
    suppliers = [],
}: ProjectDetailsPageProps) {
    const {
        tabs,
        activeTab,
        setActiveTab,
        isComercial,
        handleCompleteMilestone,
    } = useProjectTabs(project.id);

    return (
        <AuthenticatedLayout>
            <div className="py-6">
                <div className="w-full px-4 sm:px-6 lg:px-8">
                    <ProjectDetailsHeader project={project} />
                    <ProjectTabsBar tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
                    <ProjectTabContent
                        activeTab={activeTab}
                        project={project}
                        availableStates={availableStates}
                        isComercial={isComercial}
                        milestoneTypes={milestoneTypes}
                        suppliers={suppliers}
                        onCompleteMilestone={handleCompleteMilestone}
                    />
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
