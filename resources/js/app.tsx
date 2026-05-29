import '../css/app.css';
import './bootstrap';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { Toaster } from 'sonner';
import { useEffect, useState } from 'react';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

function ThemeAwareToaster() {
    const [theme, setTheme] = useState<'dark' | 'light'>(() => {
        const saved = localStorage.getItem('theme');
        return saved === 'dark' || saved === 'light' ? saved : 'dark';
    });

    useEffect(() => {
        const handler = (e: StorageEvent) => {
            if (e.key === 'theme' && (e.newValue === 'dark' || e.newValue === 'light')) {
                setTheme(e.newValue);
            }
        };
        window.addEventListener('storage', handler);
        const observer = new MutationObserver(() => {
            const htmlClass = document.documentElement.classList;
            setTheme(htmlClass.contains('dark') ? 'dark' : 'light');
        });
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
        return () => {
            window.removeEventListener('storage', handler);
            observer.disconnect();
        };
    }, []);

    return <Toaster richColors position="top-right" theme={theme} />;
}

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) => {
        const pages = import.meta.glob([
            './Pages/**/*.tsx',
            './Pages/**/*.jsx',
        ]);
        const path = Object.keys(pages).find(key => key.startsWith(`./Pages/${name}.`));
        if (!path) throw new Error(`Page not found: ${name}`);
        return resolvePageComponent(path, pages);
    },
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(
            <>
                <App {...props} />
                <ThemeAwareToaster />
            </>
        );
    },
    progress: {
        color: '#4B5563',
    },
});
