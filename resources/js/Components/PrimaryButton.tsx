import React from 'react';
import { HTMLMotionProps, motion } from 'framer-motion';
import { cn } from '../utils/cn';
import Spinner from './Spinner';

interface PrimaryButtonProps extends HTMLMotionProps<"button"> {
    isLoading?: boolean;
}

export default function PrimaryButton({
    className = '',
    disabled,
    isLoading = false,
    children,
    ...props
}: PrimaryButtonProps) {
    return (
        <motion.button
            whileHover={{ scale: disabled || isLoading ? 1 : 1.02 }}
            whileTap={{ scale: disabled || isLoading ? 1 : 0.98 }}
            {...props}
            disabled={disabled || isLoading}
            className={cn(
                "inline-flex relative items-center justify-center rounded-xl bg-[var(--verde-medio)] px-6 py-3 text-sm font-semibold text-white transition-all duration-300 ease-in-out",
                "hover:bg-[var(--lima-claro)] hover:shadow-[0_0_20px_rgba(123,186,78,0.4)]",
                "focus:outline-none focus:ring-2 focus:ring-[var(--verde-medio)] focus:ring-offset-2 focus:ring-offset-white",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                className
            )}
        >
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-[var(--verde-medio)] rounded-xl">
                    <Spinner size={20} className="text-white" />
                </div>
            )}
            <span className={cn("inline-flex items-center gap-2", isLoading && "opacity-0")}>
                {children as React.ReactNode}
            </span>
        </motion.button>
    );
}
