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
        const userTheme = auth?.user?.theme;
        const theme = savedTheme || userTheme || 'dark';

        const root = window.document.documentElement;
        root.classList.remove('dark', 'light');
        root.classList.add(theme);
        localStorage.setItem('theme', theme);
    }, [auth?.user?.theme]);

    // Sincronizar con otras pestañas
    useEffect(() => {
        const handler = (e: StorageEvent) => {
            if (e.key !== 'theme') return;
            const theme = e.newValue || 'dark';
            const root = window.document.documentElement;
            root.classList.remove('dark', 'light');
            root.classList.add(theme);
        };
        window.addEventListener('storage', handler);
        return () => window.removeEventListener('storage', handler);
    }, []);
}