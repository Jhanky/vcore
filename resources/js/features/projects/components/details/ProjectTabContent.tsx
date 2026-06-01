import type { Project, MilestoneType, Supplier, Note } from '@/features/projects/types';

import ProjectGeneralInfo from '@/features/projects/components/ProjectGeneralInfo';
import ProjectWorkflowTab from '@/features/projects/components/ProjectWorkflowTab';
import ProjectDocumentsTab from '@/features/projects/components/ProjectDocumentsTab';
import ProjectHistoryTab from '@/features/projects/components/ProjectHistoryTab';
import ProjectMilestonesTimeline from '@/features/projects/components/ProjectMilestonesTimeline';
import ProjectEquipmentTab from '@/features/projects/components/ProjectEquipmentTab';
import ProjectUpmeTab from '@/features/projects/components/ProjectUpmeTab';

interface Props {
    activeTab: string;
    project: Project;
    availableStates: any;
    isComercial: boolean;
    milestoneTypes: MilestoneType[];
    suppliers: Supplier[];
    onCompleteMilestone: (id: number) => void;
}

export default function ProjectTabContent({
    activeTab,
    project,
    availableStates,
    isComercial,
    milestoneTypes,
    suppliers,
    onCompleteMilestone,
}: Props) {
    return (
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
                    notes={(project.notes || []) as Note[]}
                />
            )}

            {activeTab === 'milestones' && (
                <ProjectMilestonesTimeline
                    project={project}
                    milestones={project.milestones}
                    milestoneTypes={milestoneTypes as never[]}
                    onComplete={onCompleteMilestone}
                    readOnly={isComercial}
                />
            )}

            {activeTab === 'equipment' && (
                <ProjectEquipmentTab
                    project={project}
                    suppliers={suppliers}
                />
            )}

            {activeTab === 'upme' && (
                <ProjectUpmeTab
                    project={project}
                    upmeDetail={project.upme_detail}
                />
            )}
        </div>
    );
}
