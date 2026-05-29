import {
    forwardRef,
    InputHTMLAttributes,
    useEffect,
    useImperativeHandle,
    useRef,
    memo,
} from 'react';

const TextInput = memo(forwardRef(function TextInput(
    {
        type = 'text',
        className = '',
        isFocused = false,
        ...props
    }: InputHTMLAttributes<HTMLInputElement> & { isFocused?: boolean },
    ref,
) {
    const localRef = useRef<HTMLInputElement>(null);

    useImperativeHandle(ref, () => ({
        focus: () => localRef.current?.focus(),
    }));

    useEffect(() => {
        if (isFocused) {
            localRef.current?.focus();
        }
    }, [isFocused]);

    return (
        <input
            {...props}
            type={type}
            className={
                'rounded-2xl border-[var(--border-ui)] bg-[var(--surface)] text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]/60 shadow-sm transition-all duration-300 focus:border-[var(--solar-gold)] focus:ring focus:ring-[var(--solar-gold)]/20 ' +
                className
            }
            ref={localRef}
        />
    );
}));

export default TextInput;
