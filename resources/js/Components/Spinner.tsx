import { Loader2 } from 'lucide-react';
import { cn } from '@/utils/cn';

interface SpinnerProps {
    className?: string;
    size?: number;
}

export function Spinner({ className, size = 24 }: SpinnerProps) {
    return (
        <Loader2 
            size={size} 
            className={cn("animate-spin text-[var(--solar-gold)]", className)} 
        />
    );
}

export default Spinner;
