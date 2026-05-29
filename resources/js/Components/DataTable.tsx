import { clsx } from 'clsx';
import { Link } from '@inertiajs/react';
import { Search, X, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { useState, useMemo, useCallback, ReactNode } from 'react';
import { useDebounce } from '@/Hooks/useDebounce';

export interface Column<T> {
    key: string;
    label: string;
    sortable?: boolean;
    render?: (item: T) => ReactNode;
    className?: string;
}

export interface FilterOption {
    key: string;
    label: string;
    options?: { value: string; label: string }[];
    type?: 'select' | 'range';
    placeholder?: string;
}

interface PaginationInfo {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
    links: { url: string | null; label: string; active: boolean }[];
}

interface DataTableProps<T> {
    data: T[];
    columns: Column<T>[];
    filters?: FilterOption[];
    searchPlaceholder?: string;
    emptyMessage?: string;
    loading?: boolean;
    pagination?: PaginationInfo | null;
    actions?: (item: T) => ReactNode;
    onSearch?: (value: string) => void;
    onFilterChange?: (key: string, value: string) => void;
    onPerPageChange?: (perPage: number) => void;
    debounceMs?: number;
    headerAction?: ReactNode;
}

const PER_PAGE_OPTIONS = [
    { value: '10', label: '10' },
    { value: '30', label: '30' },
    { value: '50', label: '50' },
    { value: '-1', label: 'Todos' },
];

export function DataTable<T extends { id: number | string }>({
    data,
    columns,
    filters = [],
    searchPlaceholder = 'Buscar...',
    emptyMessage = 'No hay elementos',
    loading = false,
    pagination = null,
    actions,
    onSearch,
    onFilterChange,
    onPerPageChange,
    debounceMs = 300,
    headerAction,
}: DataTableProps<T>) {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterValues, setFilterValues] = useState<Record<string, string>>({});
    const [perPage, setPerPage] = useState(pagination?.per_page?.toString() || '10');

    const debouncedSearch = useDebounce(searchTerm, debounceMs);

    const handleSearchChange = useCallback((value: string) => {
        setSearchTerm(value);
        onSearch?.(value);
    }, [onSearch]);

    const handleFilterChange = useCallback((key: string, value: string) => {
        setFilterValues(prev => ({ ...prev, [key]: value }));
        onFilterChange?.(key, value);
    }, [onFilterChange]);

    const handlePerPageChange = useCallback((value: string) => {
        setPerPage(value);
        onPerPageChange?.(parseInt(value));
    }, [onPerPageChange]);

    const clearFilters = useCallback(() => {
        setSearchTerm('');
        setFilterValues({});
        onSearch?.('');
    }, [onSearch]);

    const hasActiveFilters = useMemo(() => {
        return searchTerm || Object.values(filterValues).some(v => v);
    }, [searchTerm, filterValues]);

    const filteredData = useMemo(() => {
        // Cuando hay paginación, los datos ya vienen filtrados del servidor
        // No aplicar filtrado local para evitar desconexión con filtros activos
        if (pagination) {
            return data;
        }

        return data.filter((item: any) => {
            const matchesSearch = !debouncedSearch ||
                Object.values(item).some(val =>
                    String(val ?? '').toLowerCase().includes(debouncedSearch.toLowerCase())
                );

            const matchesFilters = Object.entries(filterValues).every(([key, value]) => {
                if (!value) return true;
                const filterDef = filters.find(f => f.key === key || f.key === key.replace('_min', '').replace('_max', ''));
                const itemValue = item[key.replace('_min', '').replace('_max', '')];

                if (filterDef?.type === 'range') {
                    if (key.endsWith('_min') && value) {
                        return Number(itemValue) >= Number(value);
                    }
                    if (key.endsWith('_max') && value) {
                        return Number(itemValue) <= Number(value);
                    }
                    return true;
                }

                if (typeof itemValue === 'number') {
                    return Number(itemValue) >= Number(value);
                }
                return String(itemValue ?? '').toLowerCase().includes(value.toLowerCase());
            });

            return matchesSearch && matchesFilters;
        });
    }, [data, debouncedSearch, filterValues, filters, pagination]);

    if (loading) {
        return (
            <div className="space-y-4">
                <div className="h-14 w-full bg-[var(--surface)] rounded-2xl animate-pulse" />
                <div className="glass rounded-[2rem] overflow-hidden">
                    <div className="divide-y divide-[var(--border-ui)]/30">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="p-6 flex gap-4">
                                <div className="h-6 w-32 bg-slate-500/20 rounded animate-pulse" />
                                <div className="h-6 w-48 bg-slate-500/20 rounded animate-pulse" />
                                <div className="h-6 w-24 bg-slate-500/20 rounded animate-pulse" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    const renderPaginationButton = (link: { url: string | null; label: string; active: boolean }, index: number) => {
        const isDisabled = !link.url;
        const isPrev = link.label.includes('Anterior') || link.label.includes('Previous');
        const isNext = link.label.includes('Siguiente') || link.label.includes('Next');

        if (isPrev) {
            return (
                <Link
                    key={`prev-${index}`}
                    href={link.url || '#'}
                    className={clsx(
                        'px-3 py-2 rounded-xl transition-colors text-sm flex items-center gap-1',
                        link.active
                            ? 'bg-[var(--solar-gold)] text-slate-900 font-bold'
                            : 'bg-slate-500/10 text-[var(--text-secondary)] hover:bg-slate-500/20',
                        isDisabled && 'opacity-50 pointer-events-none'
                    )}
                    dangerouslySetInnerHTML={{ __html: link.label }}
                />
            );
        }

        if (isNext) {
            return (
                <Link
                    key={`next-${index}`}
                    href={link.url || '#'}
                    className={clsx(
                        'px-3 py-2 rounded-xl transition-colors text-sm flex items-center gap-1',
                        link.active
                            ? 'bg-[var(--solar-gold)] text-slate-900 font-bold'
                            : 'bg-slate-500/10 text-[var(--text-secondary)] hover:bg-slate-500/20',
                        isDisabled && 'opacity-50 pointer-events-none'
                    )}
                    dangerouslySetInnerHTML={{ __html: link.label }}
                />
            );
        }

        return (
            <Link
                key={index}
                href={link.url || '#'}
                className={clsx(
                    'px-3 py-2 rounded-xl transition-colors text-sm',
                    link.active
                        ? 'bg-[var(--solar-gold)] text-slate-900 font-bold'
                        : 'bg-slate-500/10 text-[var(--text-secondary)] hover:bg-slate-500/20',
                    isDisabled && 'opacity-50 pointer-events-none'
                )}
                dangerouslySetInnerHTML={{ __html: link.label }}
            />
        );
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4">
                <div className="relative flex-1 min-w-0">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-[var(--text-secondary)]" />
                    </div>
                    <input
                        type="text"
                        placeholder={searchPlaceholder}
                        value={searchTerm}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        className="block w-full pl-11 pr-10 py-3 bg-[var(--surface)] border border-[var(--border-ui)] rounded-2xl text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]/60 focus:border-[var(--solar-gold)] focus:ring focus:ring-[var(--solar-gold)]/20 transition-all shadow-sm"
                    />
                    {searchTerm && (
                        <button
                            onClick={() => handleSearchChange('')}
                            className="absolute inset-y-0 right-0 pr-4 flex items-center text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    )}
                </div>

                <div className="flex flex-wrap items-center gap-3 ml-auto">
                    {filters.map((filter) => {
                        if (filter.type === 'range') {
                            return (
                                <div key={filter.key} className="flex items-center gap-2">
                                    <input
                                        type="number"
                                        placeholder="Min"
                                        value={filterValues[`${filter.key}_min`] || ''}
                                        onChange={(e) => handleFilterChange(`${filter.key}_min`, e.target.value)}
                                        className="w-24 py-3 bg-[var(--surface)] border border-[var(--border-ui)] rounded-2xl text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]/60 focus:border-[var(--solar-gold)] focus:ring focus:ring-[var(--solar-gold)]/20 transition-all shadow-sm"
                                    />
                                    <span className="text-[var(--text-secondary)]">-</span>
                                    <input
                                        type="number"
                                        placeholder="Max"
                                        value={filterValues[`${filter.key}_max`] || ''}
                                        onChange={(e) => handleFilterChange(`${filter.key}_max`, e.target.value)}
                                        className="w-24 py-3 bg-[var(--surface)] border border-[var(--border-ui)] rounded-2xl text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]/60 focus:border-[var(--solar-gold)] focus:ring focus:ring-[var(--solar-gold)]/20 transition-all shadow-sm"
                                    />
                                </div>
                            );
                        }
                        return (
                            <select
                                key={filter.key}
                                value={filterValues[filter.key] || ''}
                                onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                                className="w-full sm:w-44 py-3 bg-[var(--surface)] border border-[var(--border-ui)] rounded-2xl text-[var(--text-primary)] focus:border-[var(--solar-gold)] focus:ring focus:ring-[var(--solar-gold)]/20 transition-all shadow-sm [&>option]:bg-[var(--bg-content)]"
                            >
                                <option value="">{filter.label}</option>
                                {filter.options?.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        );
                    })}
                    {hasActiveFilters && (
                        <button
                            onClick={clearFilters}
                            className="text-[var(--solar-gold)] text-sm font-bold hover:underline whitespace-nowrap"
                        >
                            Limpiar filtros
                        </button>
                    )}
                    {headerAction}
                </div>
            </div>

            <div className="glass rounded-[2rem] overflow-hidden shadow-xl border border-[var(--border-ui)]/30">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-[var(--border-ui)]/50 text-[var(--text-secondary)] text-sm uppercase tracking-wider">
                                {columns.map((column) => (
                                    <th
                                        key={column.key}
                                        className={clsx('p-6 font-bold', column.className)}
                                    >
                                        {column.label}
                                    </th>
                                ))}
                                {actions && (
                                    <th className="p-6 font-bold text-right">Acciones</th>
                                )}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--border-ui)]/50">
                            {filteredData.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={columns.length + (actions ? 1 : 0)}
                                        className="p-12 text-center text-[var(--text-secondary)]"
                                    >
                                        <div className="flex flex-col items-center gap-2">
                                            <Search className="h-8 w-8 opacity-20" />
                                            <span className="font-medium">{emptyMessage}</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredData.map((item) => (
                                    <tr
                                        key={item.id}
                                        className="hover:bg-slate-500/5 transition-colors group"
                                    >
                                        {columns.map((column) => (
                                            <td
                                                key={column.key}
                                                className={clsx('p-6', column.className)}
                                            >
                                                {column.render
                                                    ? column.render(item)
                                                    : String((item as any)[column.key] ?? '–')}
                                            </td>
                                        ))}
                                        {actions && (
                                            <td className="p-6 text-right">
                                                <div className="flex justify-end gap-2">
                                                    {actions(item)}
                                                </div>
                                            </td>
                                        )}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {pagination && (
                    <div className="p-4 border-t border-[var(--border-ui)]/30">
                        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                            <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                                <span>Mostrando</span>
                                <select
                                    value={perPage}
                                    onChange={(e) => handlePerPageChange(e.target.value)}
                                    className="px-3 py-1.5 bg-[var(--surface)] border border-[var(--border-ui)] rounded-xl text-[var(--text-primary)] focus:border-[var(--solar-gold)] transition-all [&>option]:bg-[var(--bg-content)]"
                                >
                                    {PER_PAGE_OPTIONS.map((opt) => (
                                        <option key={opt.value} value={opt.value}>
                                            {opt.label}
                                        </option>
                                    ))}
                                </select>
                                <span>filas</span>
                                <span className="ml-4">
                                    {pagination.from}-{pagination.to} de {pagination.total}
                                </span>
                            </div>

                            {pagination.links && pagination.links.length > 3 && (
                                <div className="flex items-center gap-1">
                                    {pagination.current_page > 1 && (
                                        <>
                                            <Link
                                                href={pagination.links[0]?.url || '#'}
                                                className="p-2 rounded-xl bg-slate-500/10 text-[var(--text-secondary)] hover:bg-slate-500/20 transition-colors"
                                                title="Primera"
                                            >
                                                <ChevronsLeft className="h-4 w-4" />
                                            </Link>
                                            <Link
                                                href={pagination.links.find(l => l.label.includes('Anterior') || l.label.includes('Previous'))?.url || '#'}
                                                className="p-2 rounded-xl bg-slate-500/10 text-[var(--text-secondary)] hover:bg-slate-500/20 transition-colors"
                                                title="Anterior"
                                            >
                                                <ChevronLeft className="h-4 w-4" />
                                            </Link>
                                        </>
                                    )}

                                    {pagination.links.slice(1, -1).map((link, i) => (
                                        renderPaginationButton(link, i)
                                    ))}

                                    {pagination.current_page < pagination.last_page && (
                                        <>
                                            <Link
                                                href={pagination.links.find(l => l.label.includes('Siguiente') || l.label.includes('Next'))?.url || '#'}
                                                className="p-2 rounded-xl bg-slate-500/10 text-[var(--text-secondary)] hover:bg-slate-500/20 transition-colors"
                                                title="Siguiente"
                                            >
                                                <ChevronRight className="h-4 w-4" />
                                            </Link>
                                            <Link
                                                href={pagination.links[pagination.links.length - 1]?.url || '#'}
                                                className="p-2 rounded-xl bg-slate-500/10 text-[var(--text-secondary)] hover:bg-slate-500/20 transition-colors"
                                                title="Última"
                                            >
                                                <ChevronsRight className="h-4 w-4" />
                                            </Link>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}