import Modal from '@/Components/Modal';
import DangerButton from '@/Components/DangerButton';
import SecondaryButton from '@/Components/SecondaryButton';

export default function ProjectDeleteModal({ show, onClose, project, onConfirm }) {
    if (!project) return null;

    const handleDelete = () => {
        onConfirm(project);
        onClose();
    };

    return (
        <Modal show={show} onClose={onClose} maxWidth="sm">
            <div className="p-6 bg-[var(--surface)] text-[var(--text-primary)]">
                <h2 className="text-xl font-bold font-outfit mb-6 text-red-400">
                    Eliminar Proyecto
                </h2>

                <p className="text-sm text-[var(--text-secondary)] mb-4">
                    ¿Estás seguro de que deseas eliminar el proyecto <strong className="text-[var(--text-primary)]">{project.code}</strong>? Esta acción eliminará
                    también todo el historial de estados, notas, documentos y hitos asociados.
                </p>

                <p className="text-sm text-[var(--power-red)] mb-6">
                    Esta acción no se puede deshacer.
                </p>

                <div className="flex justify-end gap-3">
                    <SecondaryButton onClick={onClose}>
                        Cancelar
                    </SecondaryButton>
                    <DangerButton onClick={handleDelete}>
                        Eliminar
                    </DangerButton>
                </div>
            </div>
        </Modal>
    );
}
