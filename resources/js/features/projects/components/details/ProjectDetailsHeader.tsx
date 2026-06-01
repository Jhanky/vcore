import { ArrowLeft } from 'lucide-react';
import { Link } from '@inertiajs/react';
import type { Project } from '@/features/projects/types';

interface Props {
    project: Project;
}

export default function ProjectDetailsHeader({ project }: Props) {
    return (
        <>
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
        </>
    );
}
