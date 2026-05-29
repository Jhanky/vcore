import { forwardRef } from 'react';
import { clsx } from 'clsx';

interface SkeletonProps {
    className?: string;
    variant?: 'text' | 'circular' | 'rectangular';
    width?: string | number;
    height?: string | number;
}

const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(
    ({ className, variant = 'rectangular', width, height }, ref) => {
        return (
            <div
                ref={ref}
                className={clsx(
                    'animate-pulse bg-slate-700/30',
                    variant === 'circular' && 'rounded-full',
                    variant === 'text' && 'rounded-md h-4',
                    variant === 'rectangular' && 'rounded-xl',
                    className
                )}
                style={{ width, height }}
            />
        );
    }
);

Skeleton.displayName = 'Skeleton';

export function SkeletonText({ lines = 3, className }: { lines?: number; className?: string }) {
    return (
        <div className={clsx('space-y-2', className)}>
            {Array.from({ length: lines }).map((_, i) => (
                <Skeleton
                    key={i}
                    variant="text"
                    className={i === lines - 1 ? 'w-3/4' : 'w-full'}
                />
            ))}
        </div>
    );
}

export function SkeletonCard({ className }: { className?: string }) {
    return (
        <div className={clsx('glass p-6 rounded-2xl space-y-4', className)}>
            <div className="flex items-center justify-between">
                <Skeleton variant="rectangular" className="h-12 w-12 rounded-xl" />
                <Skeleton variant="text" className="w-20 h-4" />
            </div>
            <Skeleton variant="text" className="w-full h-8" />
            <Skeleton variant="text" className="w-2/3 h-4" />
        </div>
    );
}

export function SkeletonTableRow({ columns = 5 }: { columns?: number }) {
    return (
        <tr className="border-b border-[var(--border-ui)]/30">
            {Array.from({ length: columns }).map((_, i) => (
                <td key={i} className="p-4">
                    <Skeleton variant="text" className="w-full h-4" />
                </td>
            ))}
        </tr>
    );
}

export function SkeletonTable({ rows = 5, columns = 5 }: { rows?: number; columns?: number }) {
    return (
        <div className="glass rounded-[2rem] overflow-hidden">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="border-b border-[var(--border-ui)]/50">
                        {Array.from({ length: columns }).map((_, i) => (
                            <th key={i} className="p-4">
                                <Skeleton variant="text" className="w-24 h-3" />
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {Array.from({ length: rows }).map((_, i) => (
                        <SkeletonTableRow key={i} columns={columns} />
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default Skeleton;
