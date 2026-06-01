import Modal from '@/Components/Modal';

interface ProjectDeleteModalProps {
    show: boolean;
    onClose: () => void;
    project: { code: string } | null;
    onConfirm: (project: any) => void;
}

export default function ProjectDeleteModal({ show, onClose, project, onConfirm }: ProjectDeleteModalProps) {
    if (!project) return null;

    const handleDelete = () => {
        onConfirm(project);
    };

    return (
        <Modal show={show} onClose={onClose} maxWidth="sm">
            <div className="p-4 sm:p-6 bg-[var(--surface)] text-[var(--text-primary)]">
                <h2 className="text-lg font-bold font-outfit mb-2 text-red-400">
                    Eliminar Proyecto
                </h2>
                <p className="text-sm text-[var(--text-secondary)] mb-1">
                    ¿Estás seguro de eliminar <strong className="text-[var(--text-primary)]">{project.code}</strong>?
                </p>
                <p className="text-sm text-[var(--text-secondary)] mb-5">
                    Esta acción eliminará el historial, notas, documentos y hitos asociados. No se puede deshacer.
                </p>

                <button
                    onClick={handleDelete}
                    className="w-full bg-red-500/10 text-red-400 border border-red-500/20 py-2.5 rounded-xl font-bold hover:bg-red-500/20 transition-all"
                >
                    Sí, eliminar proyecto
                </button>

                <div className="mt-2 text-center">
                    <button
                        onClick={onClose}
                        className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                    >
                        Cancelar
                    </button>
                </div>
            </div>
        </Modal>
    );
}
