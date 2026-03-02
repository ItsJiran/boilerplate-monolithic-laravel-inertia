export default function SelectField({
    label,
    value,
    onChange,
    options = [],
    className = '',
    helper,
    error,
    inputProps = {},
}) {
    return (
        <div className={`space-y-2 ${className}`}>
            {label && (
                <label className="block text-sm font-medium text-gray-700">
                    {label}
                </label>
            )}

            <select
                value={value}
                onChange={onChange}
                className="w-full px-3 py-2.5 border border-gray-200 bg-white text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                {...inputProps}
            >
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
            {helper && (
                <p className="text-xs text-gray-500">{helper}</p>
            )}
            {error && (
                <p className="text-xs text-red-500">{error}</p>
            )}
        </div>
    );
}
