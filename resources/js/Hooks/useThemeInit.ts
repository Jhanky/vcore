import { useEffect } from 'react';
import { usePage } from '@inertiajs/react';

/**
 * Hook global para inicialización y sincronización del tema dark/light.
 *
 * Ejecuta en cada render para asegurar que el <html> tenga la clase correcta
 * basada en: localStorage (prioridad) > auth.user.theme > 'dark' (default).
 *
 * También sincroniza el estado local de Settings cuando el tema cambia
 * desde otra pestaña via storage event.
 */
export function useThemeInit() {
    const { auth } = usePage().props as any;

    useEffect(() => {
        const savedTheme = localStorage.getItem('theme');
        const themeVersion = localStorage.getItem('theme_version');
        const userTheme = auth?.user?.theme;
        const theme = (savedTheme && themeVersion === '2') ? savedTheme : (userTheme || 'light');

        const root = window.document.documentElement;
        root.classList.remove('dark', 'light');
        root.classList.add(theme);
        localStorage.setItem('theme', theme);
        localStorage.setItem('theme_version', '2');
    }, [auth?.user?.theme]);

    // Sincronizar con otras pestañas
    useEffect(() => {
        const handler = (e: StorageEvent) => {
            if (e.key !== 'theme') return;
            const theme = e.newValue || 'light';
            const root = window.document.documentElement;
            root.classList.remove('dark', 'light');
            root.classList.add(theme);
        };
        window.addEventListener('storage', handler);
        return () => window.removeEventListener('storage', handler);
    }, []);
}