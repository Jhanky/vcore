import {
    forwardRef,
    InputHTMLAttributes,
    useEffect,
    useImperativeHandle,
    useRef,
    useState,
    useCallback,
    memo,
} from 'react';

interface NumberInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange' | 'value'> {
    value: string | number;
    onChange: (value: string) => void;
    integer?: boolean;
}

const NumberInput = memo(forwardRef(function NumberInput(
    { value, onChange, integer = false, className = '', ...props }: NumberInputProps,
    ref,
) {
    const [displayValue, setDisplayValue] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const localRef = useRef<HTMLInputElement>(null);

    useImperativeHandle(ref, () => ({
        focus: () => localRef.current?.focus(),
        current: localRef.current,
    }));

    const formatNumber = (val: string): string => {
        const raw = val.replace(/[^\d.]/g, '');
        const parts = raw.split('.');
        const intPart = parts[0].replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.');
        if (parts.length > 1) {
            return integer ? intPart : intPart + ',' + parts[1];
        }
        return intPart;
    };

    const parseNumber = (formatted: string): string => {
        return formatted.replace(/\./g, '').replace(/,/g, '.');
    };

    useEffect(() => {
        if (!isFocused) {
            setDisplayValue(value === '' || value === null || value === undefined ? '' : formatNumber(String(value)));
        }
    }, [value, isFocused]);

    const handleFocus = () => {
        setIsFocused(true);
        setDisplayValue(value === '' ? '' : String(value).replace(/\./g, ''));
    };

    const handleBlur = () => {
        setIsFocused(false);
        if (displayValue !== '') {
            const parsed = parseNumber(displayValue);
            setDisplayValue(formatNumber(displayValue));
            onChange(parsed);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const input = e.target.value;
        const raw = input.replace(/[^\d.,]/g, '');
        setDisplayValue(raw);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleBlur();
        }
    };

    return (
        <input
            {...props}
            type="text"
            inputMode="numeric"
            className={
                'rounded-2xl border-[var(--border-ui)] bg-[var(--surface)] text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]/60 shadow-sm transition-all duration-300 focus:border-[var(--solar-gold)] focus:ring focus:ring-[var(--solar-gold)]/20 ' +
                className
            }
            value={displayValue}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            ref={localRef}
        />
    );
}));

export default NumberInput;