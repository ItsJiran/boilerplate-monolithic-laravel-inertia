export default function InputGroup({
    label,
    type = 'text',
    value,
    onChange,
    placeholder,
    className = '',
    error,
    helper,
    adornment,
    inputProps = {},
}) {
    return (
        <div className={`${className}`}>
            {label && (
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    {label}
                </label>
            )}
            <div className="relative">
                <input
                    type={type}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    className={`w-full px-3 py-2.5 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm ${
                        adornment ? 'pr-10' : ''
                    } ${error ? 'border-red-300' : ''}`}
                    {...inputProps}
                />
                {adornment && (
                    <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                        {adornment}
                    </div>
                )}
            </div>
            {helper && (
                <p className="mt-1 text-xs text-gray-500">{helper}</p>
            )}
            {error && (
                <p className="mt-1 text-xs text-red-500">{error}</p>
            )}
        </div>
    );
}
