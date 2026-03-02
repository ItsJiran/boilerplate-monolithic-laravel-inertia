import { useMemo, useRef, useState } from 'react';

export default function ComboBox({
    label,
    value,
    onChange,
    placeholder = '',
    helper,
    error,
    options = [],
    className = '',
    adornment,
}) {
    const [isOpen, setIsOpen] = useState(false);
    const blurTimeout = useRef(null);

    const filteredOptions = useMemo(() => {
        const normalized = (value ?? '').toLowerCase();
        return options.filter((option) =>
            option.toLowerCase().includes(normalized),
        );
    }, [options, value]);

    const handleFocus = () => {
        if (blurTimeout.current) {
            clearTimeout(blurTimeout.current);
        }
        setIsOpen(true);
    };

    const handleBlur = () => {
        blurTimeout.current = setTimeout(() => {
            setIsOpen(false);
        }, 150);
    };

    const handleSelect = (option) => {
        onChange(option);
        setIsOpen(false);
    };

    return (
        <div className={`space-y-2 relative ${className}`}>
            {label && (
                <label className="block text-sm font-medium text-gray-700">
                    {label}
                </label>
            )}

            <div className="relative">
                <input
                    className={`w-full px-3 py-2.5 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm ${
                        adornment ? 'pr-10' : ''
                    } ${error ? 'border-red-300' : ''}`}
                    value={value ?? ''}
                    placeholder={placeholder}
                    onChange={(event) => {
                        onChange(event.target.value);
                        setIsOpen(true);
                    }}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                />
                {adornment && (
                    <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                        {adornment}
                    </div>
                )}
                {isOpen && filteredOptions.length > 0 && (
                    <ul className="absolute z-20 mt-1 max-h-40 w-full overflow-auto rounded-md border border-gray-200 bg-white shadow-lg">
                        {filteredOptions.map((option) => (
                            <li
                                key={option}
                                className="cursor-pointer px-3 py-2 text-sm text-gray-700 hover:bg-purple-50"
                                onMouseDown={(event) => {
                                    event.preventDefault();
                                    handleSelect(option);
                                }}
                            >
                                {option}
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {helper && (
                <p className="text-xs text-gray-500">{helper}</p>
            )}
            {error && (
                <p className="text-xs text-red-500">{error}</p>
            )}
        </div>
    );
}
