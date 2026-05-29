import { useState } from 'react';
import { Link } from '@inertiajs/react';
import { Eye, Pencil, Trash2, MoreVertical, MapPin, Calendar, User } from 'lucide-react';

export default function ProjectsTable({ projects, onEdit, onDelete }) {
    const [openMenu, setOpenMenu] = useState(null);

    const getPriorityColor = (priority) => {
        const colors = {
            alta: 'bg-red-100 text-red-800',
            media: 'bg-yellow-100 text-yellow-800',
            baja: 'bg-green-100 text-green-800',
        };
        return colors[priority] || 'bg-gray-100 text-gray-800';
    };

    const getStateStyle = (state) => {
        if (!state || !state.color) return {};
        return {
            backgroundColor: state.color + '20',
            color: state.color,
            borderColor: state.color,
        };
    };

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Código
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Proyecto
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Cliente
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Estado
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Prioridad
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Fecha Inicio
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Valor
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Acciones
                        </th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {projects.data.map((project) => (
                        <tr key={project.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 whitespace-nowrap">
                                <Link
                                    href={route('projects.show', project.id)}
                                    className="text-blue-600 hover:text-blue-900 font-medium"
                                >
                                    {project.code}
                                </Link>
                            </td>
                            <td className="px-4 py-3">
                                <div className="text-sm font-medium text-gray-900">{project.name}</div>
                                {project.installation_address && (
                                    <div className="text-xs text-gray-500 flex items-center gap-1">
                                        <MapPin className="w-3 h-3" />
                                        {project.installation_address}
                                    </div>
                                )}
                            </td>
                            <td className="px-4 py-3">
                                <div className="text-sm text-gray-900">{project.client?.name}</div>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                                <span
                                    className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border"
                                    style={getStateStyle(project.current_state)}
                                >
                                    {project.current_state?.name}
                                </span>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getPriorityColor(project.priority)}`}>
                                    {project.priority}
                                </span>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                {project.start_date ? (
                                    <div className="flex items-center gap-1">
                                        <Calendar className="w-3 h-3" />
                                        {new Date(project.start_date).toLocaleDateString('es-CO')}
                                    </div>
                                ) : '-'}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                {project.contracted_value_cop
                                    ? new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(project.contracted_value_cop)
                                    : '-'}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                                <div className="relative">
                                    <button
                                        onClick={() => setOpenMenu(openMenu === project.id ? null : project.id)}
                                        className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100"
                                    >
                                        <MoreVertical className="w-5 h-5" />
                                    </button>
                                    {openMenu === project.id && (
                                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border">
                                            <div className="py-1">
                                                <Link
                                                    href={route('projects.show', project.id)}
                                                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                    Ver Detalle
                                                </Link>
                                                <button
                                                    onClick={() => {
                                                        setOpenMenu(null);
                                                        onEdit(project);
                                                    }}
                                                    className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                    Editar
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setOpenMenu(null);
                                                        onDelete(project);
                                                    }}
                                                    className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                    Eliminar
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
