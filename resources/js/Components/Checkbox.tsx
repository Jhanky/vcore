import { InputHTMLAttributes } from 'react';

export default function Checkbox({
    className = '',
    ...props
}: InputHTMLAttributes<HTMLInputElement>) {
    return (
        <input
            {...props}
            type="checkbox"
            className={
                'rounded border-[var(--border-ui)] text-[var(--solar-gold)] shadow-sm focus:ring-[var(--solar-gold)]/20 bg-[var(--surface)] ' +
                className
            }
        />
    );
}
