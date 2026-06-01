import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { ArrowLeft, Search, Wifi, AlertTriangle } from 'lucide-react';
import { useState } from 'react';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import { showToast } from '@/Components/Toast';
import type { ProjectOption } from '@/features/aire-seguimiento/types';

interface Props {
    projects: ProjectOption[];
}

export default function Create({ projects }: Props) {
    const [selectedProject, setSelectedProject] = useState<ProjectOption | null>(null);
    const [proxyData, setProxyData] = useState<any>(null);
    const [checkingNic, setCheckingNic] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        project_id: '',
        potencia_proyecto_kw: '',
        nic: '',
    });

    const handleProjectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const project = projects.find(p => p.id === Number(e.target.value));
        setSelectedProject(project || null);
        setData('project_id', e.target.value);
        if (project?.client?.nic) {
            setData('nic', project.client.nic);
        }
    };

    const handleCheckNic = () => {
        if (!data.nic) return;
        setCheckingNic(true);
        router.post(route('aire-seguimiento.check-nic'), {
            nic: data.nic,
        }, {
            preserveScroll: true,
            onSuccess: (page: any) => {
                if (page.props.flash?.proxy_data) {
                    setProxyData(page.props.flash.proxy_data);
                    showToast('Datos del transformador obtenidos', 'success');
                }
            },
            onError: () => {
                showToast('No se encontraron datos para este NIC', 'error');
            },
            onFinish: () => setCheckingNic(false),
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('aire-seguimiento.store'), {
            onSuccess: () => {
                showToast('Seguimiento creado correctamente', 'success');
            },
        });
    };

    const projectsWithNIC = projects.filter(p => p.client?.nic);
    const projectsWithoutNIC = projects.filter(p => !p.client?.nic);

    return (
        <AuthenticatedLayout header="Nuevo Seguimiento Air-e">
            <Head title="Nuevo Seguimiento Air-e" />

            <div className="max-w-3xl mx-auto">
                <Link
                    href={route('aire-seguimiento.index')}
                    className="inline-flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--solar-gold)] transition-colors mb-6"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Volver a lista
                </Link>

                <form onSubmit={handleSubmit} className="glass rounded-[2rem] p-8 border border-[var(--border-ui)] space-y-8">
                    <div>
                        <h2 className="font-outfit text-xl font-bold text-[var(--text-primary)] mb-1">
                            Seleccionar Proyecto
                        </h2>
                        <p className="text-sm text-[var(--text-secondary)]">
                            Seleccione el proyecto fotovoltaico para asociar el seguimiento Air-e.
                        </p>
                    </div>

                    <div>
                        <InputLabel htmlFor="project_id" value="Proyecto" />
                        <select
                            id="project_id"
                            className="mt-1 block w-full rounded-2xl border-[var(--border-ui)] bg-[var(--bg-content)] text-[var(--text-primary)] px-4 py-3 focus:ring-[var(--solar-gold)] focus:border-[var(--solar-gold)]"
                            value={data.project_id}
                            onChange={handleProjectChange}
                        >
                            <option value="">Seleccione un proyecto...</option>
                            {projectsWithNIC.length > 0 && (
                                <optgroup label="Con NIC registrado">
                                    {projectsWithNIC.map(p => (
                                        <option key={p.id} value={p.id}>
                                            {p.code} — {p.name} ({p.client?.name})
                                        </option>
                                    ))}
                                </optgroup>
                            )}
                            {projectsWithoutNIC.length > 0 && (
                                <optgroup label="Sin NIC">
                                    {projectsWithoutNIC.map(p => (
                                        <option key={p.id} value={p.id}>
                                            {p.code} — {p.name} ({p.client?.name})
                                        </option>
                                    ))}
                                </optgroup>
                            )}
                        </select>
                        {errors.project_id && <InputError message={errors.project_id} />}
                    </div>

                    {selectedProject && (
                        <>
                            <div className="border-t border-[var(--border-ui)] pt-6">
                                <h3 className="font-outfit font-bold text-lg text-[var(--text-primary)] mb-4">
                                    Datos del Cliente
                                </h3>

                                {selectedProject.client?.nic ? (
                                    <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-4 flex items-start gap-3">
                                        <Wifi className="h-5 w-5 text-emerald-400 mt-0.5" />
                                        <div>
                                            <p className="font-bold text-emerald-400 text-sm">NIC detectado</p>
                                            <p className="text-[var(--text-primary)] font-mono">{selectedProject.client.nic}</p>
                                            <p className="text-xs text-[var(--text-secondary)] mt-1">
                                                Los datos del transformador se cargarán automáticamente desde el ConnectionPoint del cliente.
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-4 flex items-start gap-3">
                                            <AlertTriangle className="h-5 w-5 text-amber-400 mt-0.5" />
                                            <div>
                                                <p className="font-bold text-amber-400 text-sm">NIC no registrado</p>
                                                <p className="text-xs text-[var(--text-secondary)]">
                                                    Ingrese el NIC manualmente para consultar los datos del transformador vía proxy.
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex gap-2 items-end">
                                            <div className="flex-1">
                                                <InputLabel htmlFor="nic" value="NIC / Matrícula" />
                                                <TextInput
                                                    id="nic"
                                                    type="text"
                                                    className="mt-1 block w-full"
                                                    value={data.nic}
                                                    onChange={(e) => setData('nic', e.target.value)}
                                                    placeholder="Ej: 0202R"
                                                />
                                                <InputError message={errors.nic} />
                                            </div>
                                            <SecondaryButton
                                                type="button"
                                                onClick={handleCheckNic}
                                                disabled={!data.nic || checkingNic}
                                                className="flex items-center gap-2 mb-0.5"
                                            >
                                                <Search className="h-4 w-4" />
                                                {checkingNic ? 'Consultando...' : 'Consultar'}
                                            </SecondaryButton>
                                        </div>

                                        {proxyData && (
                                            <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-4">
                                                <p className="text-sm font-bold text-emerald-400 mb-2">
                                                    Datos del transformador obtenidos
                                                </p>
                                                <pre className="text-xs text-[var(--text-secondary)] overflow-auto max-h-32">
                                                    {JSON.stringify(proxyData, null, 2)}
                                                </pre>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="border-t border-[var(--border-ui)] pt-6">
                                <InputLabel htmlFor="potencia_proyecto_kw" value="Potencia del proyecto (kW AC)" />
                                <TextInput
                                    id="potencia_proyecto_kw"
                                    type="number"
                                    step="0.01"
                                    min="0.1"
                                    max="5000"
                                    className="mt-1 block w-full"
                                    value={data.potencia_proyecto_kw}
                                    onChange={(e) => setData('potencia_proyecto_kw', e.target.value)}
                                    placeholder="Ej: 15.00"
                                />
                                <InputError message={errors.potencia_proyecto_kw} />
                                <p className="text-xs text-[var(--text-secondary)] mt-1">
                                    Este valor determina la clasificación del proyecto (AGPE pequeño/mediano/AGGE) y la pre-calificación de disponibilidad.
                                </p>
                            </div>
                        </>
                    )}

                    <div className="flex items-center justify-end gap-4 pt-4 border-t border-[var(--border-ui)]">
                        <Link
                            href={route('aire-seguimiento.index')}
                            className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                        >
                            Cancelar
                        </Link>
                        <PrimaryButton type="submit" disabled={processing || !data.project_id}>
                            Crear Seguimiento
                        </PrimaryButton>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
