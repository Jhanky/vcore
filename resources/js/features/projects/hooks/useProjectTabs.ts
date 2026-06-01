import { useState } from 'react';
import { useForm, usePage } from '@inertiajs/react';
import { FileText, MapPin, FolderOpen, History, Flag, Package, Building } from 'lucide-react';
import type { TabDefinition } from '@/features/projects/types';

export function useProjectTabs(projectId: number) {
    const { auth } = usePage().props as unknown as { auth: { user?: { roles?: string[] } } };
    const user = auth?.user;
    const isComercial = user?.roles?.includes('comercial') ?? false;

    const [activeTab, setActiveTab] = useState('general');

    const allTabs: TabDefinition[] = [
        { id: 'general', label: 'Información General', icon: FileText },
        { id: 'workflow', label: 'Workflow', icon: MapPin },
        { id: 'documents', label: 'Documentos', icon: FolderOpen },
        { id: 'history', label: 'Historial', icon: History },
        { id: 'milestones', label: 'Hitos', icon: Flag },
        { id: 'equipment', label: 'Equipos', icon: Package },
        { id: 'upme', label: 'UPME', icon: Building },
    ];

    const tabs = isComercial
        ? allTabs.filter(t => ['general', 'workflow', 'history', 'milestones'].includes(t.id))
        : allTabs;

    const { post: completeMilestone, processing: processingMilestone } = useForm();

    const handleCompleteMilestone = (milestoneId: number) => {
        if (confirm('¿Marcar este hito como completado?')) {
            completeMilestone(route('projects.milestones.complete', [projectId, milestoneId]), {
                preserveScroll: true,
            });
        }
    };

    return {
        tabs,
        activeTab,
        setActiveTab,
        isComercial,
        handleCompleteMilestone,
        processingMilestone,
    };
}
