import { useState, useCallback } from 'react';
import { useForm, router } from '@inertiajs/react';
import type { AireStage, AireSeguimiento } from '../types';

export function useAireSeguimiento(seguimiento: AireSeguimiento) {
    const [isLoading, setIsLoading] = useState(false);

    const { data, setData, put, processing, errors, reset } = useForm({
        ...seguimiento,
    });

    const handleUpdate = useCallback((e: React.FormEvent) => {
        e.preventDefault();
        put(route('aire-seguimiento.update', seguimiento.id), {
            preserveScroll: true,
            onSuccess: () => { },
        });
    }, [seguimiento.id, put]);

    const stageTransition = (targetStage: AireStage) => {
        setIsLoading(true);
        router.patch(route('aire-seguimiento.stage', seguimiento.id), {
            target_stage: targetStage,
        }, {
            preserveScroll: true,
            onFinish: () => setIsLoading(false),
        });
    };

    return {
        data,
        setData,
        handleUpdate,
        processing,
        errors,
        reset,
        stageTransition,
        isLoading,
        setIsLoading,
    };
}
