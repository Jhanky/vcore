import { useState } from 'react';
import { router } from '@inertiajs/react';
import { FileText, AlertCircle, ArrowRight } from 'lucide-react';
import ProjectFieldForm from './ProjectFieldForm';
import { showToast } from '@/Components/Toast';

export default function ProjectWorkflowTab({ project, availableStates, isComercial = false }) {
    const [noteContent, setNoteContent] = useState('');
    const [noteFile, setNoteFile] = useState(null);
    const [processingNote, setProcessingNote] = useState(false);

    const [selectedStateId, setSelectedStateId] = useState('');
    const [reason, setReason] = useState('');
    const [notes, setNotes] = useState('');
    const [processingTransition, setProcessingTransition] = useState(false);

    const handleNoteSubmit = (e) => {
        e.preventDefault();
        setProcessingNote(true);
        const formData = new FormData();
        formData.append('content', noteContent);
        if (noteFile) {
            formData.append('file', noteFile);
        }

        router.post(route('projects.notes', project.id), formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
            onSuccess: () => {
                setNoteContent('');
                setNoteFile(null);
                setProcessingNote(false);
                showToast('Nota agregada.', 'success');
            },
            onError: () => {
                setProcessingNote(false);
                showToast('Error al agregar nota.', 'error');
            },
        });
    };

    const handleTransition = (e) => {
        e.preventDefault();
        if (!selectedStateId) return;

        setProcessingTransition(true);
        const formData = new FormData();
        formData.append('status_id', selectedStateId);
        if (reason) formData.append('reason', reason);
        if (notes) formData.append('notes', notes);

        router.patch(route('projects.changeStatus', project.id), formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
            onSuccess: () => {
                setSelectedStateId('');
                setReason('');
                setNotes('');
                setProcessingTransition(false);
                window.location.reload();
            },
            onError: () => {
                setProcessingTransition(false);
                showToast('Error al cambiar estado.', 'error');
            },
        });
    };

    if (isComercial) {
        return (
            <div className="glass rounded-[2rem] p-8">
                <h3 className="text-lg font-bold font-outfit text-[var(--text-primary)] mb-4">
                    Notas del Proyecto
                </h3>

                <textarea
                    value={noteContent}
                    onChange={(e) => setNoteContent(e.target.value)}
                    className="w-full rounded-xl border-[var(--border-ui)] bg-[var(--surface)] focus:border-[var(--solar-gold)] focus:ring focus:ring-[var(--solar-gold)]/20 text-[var(--text-primary)] mb-3"
                    rows={3}
                    placeholder="Escribir una nota..."
                />
                <div className="mb-3">
                    <input
                        type="file"
                        onChange={(e) => setNoteFile(e.target.files[0])}
                        className="block w-full text-sm text-[var(--text-secondary)] file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-[var(--solar-gold)]/10 file:text-[var(--solar-gold)] hover:file:bg-[var(--solar-gold)]/20"
                        accept=".pdf,.jpg,.jpeg,.png,.gif,.webp,.doc,.docx,.xls,.xlsx"
                    />
                    {noteFile && (
                        <p className="text-xs text-[var(--text-secondary)] mt-1">{noteFile.name}</p>
                    )}
                </div>
                <button
                    onClick={handleNoteSubmit}
                    disabled={!noteContent || processingNote}
                    className="w-full bg-[var(--solar-gold)] text-slate-900 py-3 px-4 rounded-xl font-bold hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                    {processingNote ? 'Guardando...' : 'Agregar Nota'}
                </button>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="glass rounded-[2rem] p-8">
                <h3 className="text-lg font-bold font-outfit text-[var(--text-primary)] mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-[var(--solar-gold)]" />
                    Datos del Estado Actual
                </h3>

                <ProjectFieldForm project={project} />
            </div>

            <div className="glass rounded-[2rem] p-8">
                <h3 className="text-lg font-bold font-outfit text-[var(--text-primary)] mb-4 flex items-center gap-2">
                    <ArrowRight className="w-5 h-5 text-[var(--solar-gold)]" />
                    Transición de Estado
                </h3>

                <div className="mb-4">
                    <label className="block text-sm font-bold text-[var(--text-secondary)] mb-2">
                        Estado Actual
                    </label>
                    <div
                        className="px-3 py-2 rounded-xl border inline-flex items-center gap-2"
                        style={{
                            backgroundColor: project.current_state.color + '15',
                            borderColor: project.current_state.color + '40',
                            color: project.current_state.color,
                        }}
                    >
                        <span className="font-bold">{project.current_state.name}</span>
                    </div>
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-bold text-[var(--text-secondary)] mb-2">
                        Nuevo Estado
                    </label>
                    <select
                        value={selectedStateId}
                        onChange={(e) => setSelectedStateId(e.target.value)}
                        className="w-full rounded-xl border-[var(--border-ui)] bg-[var(--surface)] focus:border-[var(--solar-gold)] focus:ring focus:ring-[var(--solar-gold)]/20 text-[var(--text-primary)]"
                    >
                        <option value="">Seleccionar nuevo estado</option>
                        {availableStates?.map((state) => (
                            <option key={state.id} value={state.id}>
                                {state.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-bold text-[var(--text-secondary)] mb-2">
                        Razón del Cambio
                    </label>
                    <input
                        type="text"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        className="w-full rounded-xl border-[var(--border-ui)] bg-[var(--surface)] focus:border-[var(--solar-gold)] focus:ring focus:ring-[var(--solar-gold)]/20 text-[var(--text-primary)]"
                        placeholder="Ej: Cliente aprobó la propuesta"
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-bold text-[var(--text-secondary)] mb-2">
                        Notas Adicionales
                    </label>
                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="w-full rounded-xl border-[var(--border-ui)] bg-[var(--surface)] focus:border-[var(--solar-gold)] focus:ring focus:ring-[var(--solar-gold)]/20 text-[var(--text-primary)]"
                        rows={2}
                        placeholder="Observaciones adicionales..."
                    />
                </div>

                <button
                    onClick={handleTransition}
                    disabled={!selectedStateId || processingTransition}
                    className="w-full bg-[var(--solar-gold)] text-slate-900 py-3 px-4 rounded-xl font-bold hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                    {processingTransition ? 'Guardando...' : 'Registrar Avance'}
                </button>

                <div className="border-t border-[var(--border-ui)]/50 mt-6 pt-6">
                    <h4 className="text-sm font-bold text-[var(--text-primary)] mb-3">
                        Agregar Nota (sin cambiar estado)
                    </h4>
                    <textarea
                        value={noteContent}
                        onChange={(e) => setNoteContent(e.target.value)}
                        className="w-full rounded-xl border-[var(--border-ui)] bg-[var(--surface)] focus:border-[var(--solar-gold)] focus:ring focus:ring-[var(--solar-gold)]/20 text-[var(--text-primary)] mb-3"
                        rows={2}
                        placeholder="Escribir una nota..."
                    />
                    <div className="mb-3">
                        <input
                            type="file"
                            onChange={(e) => setNoteFile(e.target.files[0])}
                            className="block w-full text-sm text-[var(--text-secondary)] file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-[var(--solar-gold)]/10 file:text-[var(--solar-gold)] hover:file:bg-[var(--solar-gold)]/20"
                            accept=".pdf,.jpg,.jpeg,.png,.gif,.webp,.doc,.docx,.xls,.xlsx"
                        />
                        {noteFile && (
                            <p className="text-xs text-[var(--text-secondary)] mt-1">{noteFile.name}</p>
                        )}
                    </div>
                    <button
                        onClick={handleNoteSubmit}
                        disabled={!noteContent || processingNote}
                        className="w-full bg-slate-500/10 text-[var(--text-primary)] py-2 px-4 rounded-xl font-bold hover:bg-slate-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {processingNote ? 'Guardando...' : 'Agregar Nota'}
                    </button>
                </div>
            </div>
        </div>
    );
}