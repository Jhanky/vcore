import type { TabDefinition } from '@/features/projects/types';

interface Props {
    tabs: TabDefinition[];
    activeTab: string;
    onTabChange: (id: string) => void;
}

export default function ProjectTabsBar({ tabs, activeTab, onTabChange }: Props) {
    return (
        <div className="mb-6">
            <div className="border-b border-[var(--border-ui)]">
                <nav className="-mb-px flex space-x-4">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => onTabChange(tab.id)}
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
    );
}
