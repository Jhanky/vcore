import { useState, useEffect } from 'react';

/**
 * Hook para debounce de valores.
 * Retrasa la actualización del valor hasta que hayan pasado `delay` ms
 * sin cambios adicionales.
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => clearTimeout(timer);
    }, [value, delay]);

    return debouncedValue;
}

export default useDebounce;
