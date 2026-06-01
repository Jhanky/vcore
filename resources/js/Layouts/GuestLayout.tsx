import { useEffect } from 'react';
import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link } from '@inertiajs/react';
import { PropsWithChildren } from 'react';

export default function Guest({ children }: PropsWithChildren) {
    useEffect(() => {
        const savedTheme = localStorage.getItem('theme');
        const themeVersion = localStorage.getItem('theme_version');
        const theme = (savedTheme && themeVersion === '2') ? savedTheme : 'light';
        const root = window.document.documentElement;
        root.classList.remove('dark', 'light');
        root.classList.add(theme);
        localStorage.setItem('theme', theme);
        localStorage.setItem('theme_version', '2');
    }, []);

    return (
        <div className="flex min-h-screen flex-col items-center pt-6 sm:justify-center sm:pt-0 bg-[var(--bg-main)]">
            <div className="animate-fade-in">
                <Link href="/">
                    <ApplicationLogo className="h-24 w-auto drop-shadow-[0_0_15px_rgba(189,214,65,0.4)]" />
                </Link>
            </div>

            <div className="mt-8 w-full px-8 py-10 bg-[var(--bg-content)] sm:max-w-md sm:rounded-[2rem] animate-fade-in border border-[var(--border-ui)]">
                {children}
            </div>
        </div>
    );
}
