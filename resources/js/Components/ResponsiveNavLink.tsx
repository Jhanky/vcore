import { InertiaLinkProps, Link } from '@inertiajs/react';

export default function ResponsiveNavLink({
    active = false,
    className = '',
    children,
    ...props
}: InertiaLinkProps & { active?: boolean }) {
    return (
        <Link
            {...props}
            className={`flex w-full items-start border-l-4 py-2 pe-4 ps-3 ${
                active
                    ? 'border-[var(--solar-gold)] bg-[var(--solar-gold)]/10 text-[var(--solar-gold)] focus:border-[var(--solar-gold)] focus:bg-[var(--solar-gold)]/20 focus:text-[var(--solar-gold)]'
                    : 'border-transparent text-[var(--text-secondary)] hover:border-[var(--border-ui)] hover:bg-slate-500/5 hover:text-[var(--text-primary)] focus:border-[var(--border-ui)] focus:bg-slate-500/5 focus:text-[var(--text-primary)]'
            } text-base font-medium transition duration-150 ease-in-out focus:outline-none ${className}`}
        >
            {children}
        </Link>
    );
}
