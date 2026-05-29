import { InertiaLinkProps, Link } from '@inertiajs/react';

export default function NavLink({
    active = false,
    className = '',
    children,
    ...props
}: InertiaLinkProps & { active: boolean }) {
    return (
        <Link
            {...props}
            className={
                'inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium leading-5 transition duration-150 ease-in-out focus:outline-none ' +
                (active
                    ? 'border-[var(--solar-gold)] text-[var(--text-primary)] focus:border-[var(--solar-gold)]'
                    : 'border-transparent text-[var(--text-secondary)] hover:border-[var(--border-ui)] hover:text-[var(--text-primary)] focus:border-[var(--border-ui)] focus:text-[var(--text-primary)]') +
                className
            }
        >
            {children}
        </Link>
    );
}
